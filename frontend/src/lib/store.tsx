"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { CVData, TemplateId, CVSection, CVItem, SkillGroup, SectionType, normalizeCVData, BLANK_CV } from "@/types/cv";

import { cvApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CV_DRAFT_STORAGE_KEY } from "@/lib/storageKeys";
import { validateCV, CVValidationDetail } from "@/lib/cvValidation";

// Local-only draft IDs (guests) are cv-draft-*, cv-copy-*, cv-<timestamp>, or empty.
// Cloud CVs are stored server-side with UUID ids.
function isLocalDraftId(id?: string | null): boolean {
  if (!id) return true;
  return /^cv-draft-/.test(id) || /^cv-copy-/.test(id) || /^cv-\d+/.test(id);
}

interface PersistenceState {
  isSynced: boolean;
  lastSync?: Date;
  saveSource: "local" | "cloud";
  validationErrors?: CVValidationDetail[];
  /** Increments on every validate run inside saveDraft; lets collapsed error
   *  entries know to re-open when the user hits Continue. */
  validationRunId?: number;
}

// Checks if a CV data structure has real content filled in by a user
export function isRealCVDraft(cv: any): boolean {
  if (!cv) return false;
  if (cv.targetRole?.trim()) return true;
  if (cv.personalInfo) {
    const { fullName, email, phone, summary, linkedinUrl, githubUrl, portfolioUrl } = cv.personalInfo;
    if (fullName?.trim() || email?.trim() || phone?.trim() || summary?.trim() || linkedinUrl?.trim() || githubUrl?.trim() || portfolioUrl?.trim()) {
      return true;
    }
  }
  if (Array.isArray(cv.sections)) {
    for (const sec of cv.sections) {
      if (Array.isArray(sec.items)) {
        for (const item of sec.items) {
          if (item.title?.trim() || item.subtitle?.trim() || item.company?.trim() || item.institution?.trim() || item.role?.trim()) {
            return true;
          }
          if (Array.isArray(item.bulletPoints)) {
            for (const bp of item.bulletPoints) {
              const text = typeof bp === "string" ? bp : bp?.text;
              if (text?.trim()) return true;
            }
          }
        }
      }
    }
  }
  if (Array.isArray(cv.skillGroups)) {
    for (const g of cv.skillGroups) {
      if (Array.isArray(g.skills) && g.skills.length > 0) {
        return true;
      }
    }
  }
  if (Array.isArray(cv.education) && cv.education.some((e: any) => e.degree?.trim() || e.institution?.trim())) return true;
  if (Array.isArray(cv.experience) && cv.experience.some((e: any) => e.role?.trim() || e.company?.trim())) return true;
  if (Array.isArray(cv.projects) && cv.projects.some((p: any) => p.name?.trim() || p.title?.trim())) return true;
  return false;
}

// Retrieves the latest real draft from primary draft storage
export function getSavedDraftFromStorage(): CVData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(CV_DRAFT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isRealCVDraft(parsed)) {
        return normalizeCVData(parsed);
      }
    }
  } catch (err) {
    console.warn("Could not parse local draft from localStorage:", err);
  }

  return null;
}

interface CVContextType {
  cvData: CVData;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  updatePersonalInfo: (field: keyof CVData["personalInfo"], value: string) => void;
  updateSectionItems: (sectionTypeOrId: SectionType | string, items: CVItem[]) => void;
  updateSkillGroups: (groups: SkillGroup[]) => void;
  addCustomSection: (title: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  removeSection: (sectionId: string) => void;
  setTemplateId: (id: TemplateId | string) => void;
  setAccentColor: (color: string) => void;
  setTargetRole: (role: string, roleId?: string) => void;
  targetJobDescription: string;
  setTargetJobDescription: (jd: string) => void;
  mobileView: "form" | "preview";
  setMobileView: (view: "form" | "preview") => void;
  desktopView: "dual" | "editor" | "preview";
  setDesktopView: (view: "dual" | "editor" | "preview") => void;
  lastSaved: Date | null;
  isDirty: boolean;
  saveDraft: () => Promise<boolean>;
  resetDraft: () => void;
  clearAll: () => void;
  loadFromHistory: (snapshot: CVData) => void;
  loadCV: (data: Partial<CVData>) => void;
  restoreDraft: () => boolean;
  hasSavedDraft: boolean;
  persistence: PersistenceState;
}

const CVContext = createContext<CVContextType | null>(null);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, isBackendSession } = useAuth();
  // Cloud writes are only valid for a backend-confirmed session. A user profile
  // restored from localStorage (e.g. backend offline / 401) is NOT a real
  // session, so guest (local) persistence applies until the backend confirms it.
  const canUseCloud = Boolean(user && isBackendSession);
  const [cvData, setCVDataState] = useState<CVData>(BLANK_CV);
  const [targetJobDescription, setTargetJobDescription] = useState<string>("");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [desktopView, setDesktopView] = useState<"dual" | "editor" | "preview">("dual");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [persistence, setPersistence] = useState<PersistenceState>({
    isSynced: false,
    saveSource: "local",
    validationRunId: 0,
  });

  // Tracks which user's data was last hydrated so we can reset to a clean slate
  // (instead of showing stale in-memory data) when the account changes.
  const prevUserIdRef = useRef<string | null>(null);

  // Hydrate from localStorage or MySQL based on auth state
  useEffect(() => {
    if (authLoading) return;
    async function hydrate() {
      setIsHydrated(false);
      const userId = user?.id ?? null;
      const userChanged = prevUserIdRef.current !== userId;
      prevUserIdRef.current = userId;

      // Retrieve any existing real draft from localStorage or history snapshots
      const localDraft = getSavedDraftFromStorage();

      try {
        if (canUseCloud) {
          // Authenticated: attempt to load from MySQL
          try {
            const cvs = await cvApi.list();
            if (cvs.length > 0) {
              const latest = cvs[0];
              const remote = await cvApi.getById(latest.id);
              const remoteNormalized = normalizeCVData({
                ...remote,
                personalInfo: {
                  fullName: remote.fullName || "",
                  email: remote.email || "",
                  phone: remote.phone || "",
                  location: remote.location || "",
                  linkedinUrl: remote.linkedinUrl || "",
                  githubUrl: remote.githubUrl || "",
                  portfolioUrl: remote.websiteUrl || "",
                  summary: remote.summary || "",
                  photoUrl: remote.personalInfo?.photoUrl || (remote as any).photoUrl || "",
                },
                accentColor: (remote as any).accentColor || "#0284c7",
              });

              // If the user has newer local draft edits than the remote copy, preserve local work
              if (
                localDraft &&
                localDraft.updatedAt &&
                remoteNormalized.updatedAt &&
                new Date(localDraft.updatedAt) > new Date(remoteNormalized.updatedAt)
              ) {
                setCVDataState(localDraft);
                setPersistence({ isSynced: false, lastSync: new Date(localDraft.updatedAt), saveSource: "local" });
                setLastSaved(new Date(localDraft.updatedAt));
                setIsDirty(false);
                return;
              }

              // Otherwise load the cloud CV
              setCVDataState(remoteNormalized);
              setPersistence({ isSynced: true, lastSync: new Date(), saveSource: "cloud" });
              setLastSaved(new Date(remoteNormalized.updatedAt || Date.now()));
              setIsDirty(false);
              return;
            }
          } catch (cloudErr) {
            console.warn("Could not load CV from cloud, falling back to local draft:", cloudErr);
          }

          // No cloud CVs or cloud error: restore local draft if available
          if (localDraft) {
            setCVDataState(localDraft);
            setPersistence({ isSynced: false, saveSource: "local" });
            setLastSaved(new Date(localDraft.updatedAt || Date.now()));
            setIsDirty(false);
            return;
          }

          if (userChanged) {
            setCVDataState({ ...normalizeCVData(BLANK_CV), id: `cv-draft-${Date.now()}` });
            setPersistence({ isSynced: false, saveSource: "local" });
            setIsDirty(false);
          }
          return;
        }

        // Guest: load from local draft if present
        if (localDraft) {
          setCVDataState(localDraft);
          setPersistence({ isSynced: false, saveSource: "local" });
          setLastSaved(new Date(localDraft.updatedAt || Date.now()));
          setIsDirty(false);
          return;
        }

        if (userChanged) {
          setCVDataState({ ...normalizeCVData(BLANK_CV), id: `cv-draft-${Date.now()}` });
          setPersistence({ isSynced: false, saveSource: "local" });
          setIsDirty(false);
        }
      } catch (e) {
        console.warn("Could not hydrate draft:", e);
        if (localDraft) {
          setCVDataState(localDraft);
          setPersistence({ isSynced: false, saveSource: "local" });
        }
      } finally {
        setIsHydrated(true);
        setIsDirty(false);
      }
    }
    hydrate();
  }, [canUseCloud, user, authLoading]);

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);

  // Monitor storage for any restorable draft
  useEffect(() => {
    if (!isHydrated) return;
    const draft = getSavedDraftFromStorage();
    setHasSavedDraft(Boolean(draft));
  }, [isHydrated, cvData]);

  // Restore draft on demand
  const restoreDraft = useCallback((): boolean => {
    const draft = getSavedDraftFromStorage();
    if (draft) {
      setCVDataState(draft);
      setPersistence({ isSynced: false, saveSource: "local" });
      setLastSaved(new Date(draft.updatedAt || Date.now()));
      setIsDirty(false);
      try {
        localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        // ignore
      }
      return true;
    }
    return false;
  }, []);

  // Autosave to localStorage so draft is never lost when navigating away
  useEffect(() => {
    if (!isHydrated) return;
    // CRITICAL: Never overwrite an existing saved draft in localStorage with a blank/empty CV!
    if (!isRealCVDraft(cvData)) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(cvData));
      } catch (e) {
        console.warn("Autosave to localStorage failed:", e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cvData, isHydrated]);

  const setCVData: React.Dispatch<React.SetStateAction<CVData>> = (action) => {
    setIsDirty(true);
    setCVDataState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      return normalizeCVData(next);
    });
  };

  const updatePersonalInfo = (field: keyof CVData["personalInfo"], value: string) => {
    setCVData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateSectionItems = (sectionTypeOrId: SectionType | string, items: CVItem[]) => {
    setCVData((prev) => {
      const existingSections = [...(prev.sections || [])];
      const secIdx = existingSections.findIndex(
        (s) => s.id === sectionTypeOrId || s.sectionType === sectionTypeOrId
      );

      if (secIdx >= 0) {
        existingSections[secIdx] = {
          ...existingSections[secIdx],
          items,
        };
      } else {
        const sectionType = (sectionTypeOrId as SectionType) || "CUSTOM";
        existingSections.push({
          id: `sec-${typeof sectionTypeOrId === "string" ? sectionTypeOrId.toLowerCase() : "custom"}-${Date.now()}`,
          sectionType,
          title:
            sectionType === "EDUCATION"
              ? "Education"
              : sectionType === "EXPERIENCE"
              ? "Work Experience"
              : sectionType === "PROJECTS"
              ? "Technical Projects"
              : typeof sectionTypeOrId === "string"
              ? sectionTypeOrId
              : "Custom Section",
          orderIndex: existingSections.length,
          isVisible: true,
          items,
        });
      }

      return {
        ...prev,
        sections: existingSections,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateSkillGroups = (groups: SkillGroup[]) => {
    setCVData((prev) => ({
      ...prev,
      skillGroups: groups,
      skills: groups,
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setCVData((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) =>
        sec.id === sectionId ? { ...sec, title } : sec
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addCustomSection = (title: string) => {
    setCVData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec-custom-${Date.now()}`,
          sectionType: "CUSTOM",
          title: title || "Additional Section",
          orderIndex: prev.sections.length,
          isVisible: true,
          items: [
            {
              id: `item-${Date.now()}`,
              title: "",
              subtitle: "",
              location: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
              orderIndex: 0,
              bulletPoints: [
                {
                  id: `bp-${Date.now()}`,
                  text: "",
                  framework: "STANDARD",
                },
              ],
            },
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeSection = (sectionId: string) => {
    setCVData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
      updatedAt: new Date().toISOString(),
    }));
  };

  const setTemplateId = (id: TemplateId | string) => {
    setCVData((prev) => ({
      ...prev,
      templateId: id,
      updatedAt: new Date().toISOString(),
    }));
  };

  const setAccentColor = (color: string) => {
    setCVData((prev) => ({
      ...prev,
      accentColor: color,
      updatedAt: new Date().toISOString(),
    }));
  };

  const setTargetRole = useCallback((role: string, roleId?: string) => {
    setCVData((prev) => ({
      ...prev,
      targetRole: role,
      targetRoleId: roleId !== undefined ? roleId : undefined,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const saveDraft = async (): Promise<boolean> => {
    try {
      const normalized = normalizeCVData(cvData);
      const now = new Date();
      setLastSaved(now);
      setIsDirty(false);

      // Validate before touching the backend so invalid payloads never 400.
      // The draft is still kept in localStorage so no work is lost.
      const validationRunId = (persistence.validationRunId ?? 0) + 1;
      const validation = validateCV(normalized);
      if (!validation.valid) {
        localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
        setPersistence({
          isSynced: false,
          lastSync: now,
          saveSource: "local",
          validationErrors: validation.errors,
          validationRunId,
        });
        return false;
      }

      if (canUseCloud) {
        // Authenticated: save to MySQL
        try {
          if (normalized.id && !isLocalDraftId(normalized.id)) {
            await cvApi.update(normalized.id, normalized);
          } else {
            // New draft or promoted local guest draft: create in MySQL
            const created = await cvApi.create(normalized);
            normalized.id = created.id;
            setCVDataState(normalized);
          }
          setPersistence({ isSynced: true, lastSync: now, saveSource: "cloud", validationRunId });
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
        } catch (cloudErr) {
          // Fallback to localStorage if cloud save fails
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
          setPersistence({ isSynced: false, lastSync: now, saveSource: "local", validationRunId });
        }
      } else {
        // Guest: save to localStorage only
        localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
        setPersistence({ isSynced: false, lastSync: now, saveSource: "local", validationRunId });
      }
      return true;
    } catch (e) {
      console.error("Save error:", e);
      return false;
    }
  };

  const loadFromHistory = useCallback((snapshot: CVData) => {
    const normalized = normalizeCVData(snapshot);
    setCVDataState(normalized);
    try {
      localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {
      // ignore
    }
    setPersistence({
      isSynced: false,
      lastSync: new Date(),
      saveSource: "local",
    });
    setIsDirty(true);
    setLastSaved(new Date());
  }, []);

  const loadCV = useCallback((data: Partial<CVData>) => {
    const merged = normalizeCVData(data);
    setCVDataState(merged);
    try {
      localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      // ignore
    }
    setPersistence({
      isSynced: true,
      lastSync: new Date(merged.updatedAt || Date.now()),
      saveSource: canUseCloud ? "cloud" : "local",
      validationRunId: 0,
    });
    setIsDirty(false);
    setLastSaved(new Date(merged.updatedAt || Date.now()));
  }, [canUseCloud]);

  const clearAll = () => {
    const blankCV: CVData = normalizeCVData({
      id: `cv-draft-${Date.now()}`,
      title: "My Resume",
      templateId: cvData.templateId || "classic",
      targetRole: "",
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedinUrl: "",
        githubUrl: "",
        summary: "",
      },
      sections: [
        {
          id: `sec-education`,
          sectionType: "EDUCATION",
          title: "Education",
          orderIndex: 0,
          isVisible: true,
          items: [
            {
              id: `edu-${Date.now()}`,
              title: "",
              subtitle: "",
              location: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
              gpa: "",
              bulletPoints: [{ id: `bp-${Date.now()}`, text: "", framework: "STANDARD" }],
            },
          ],
        },
        {
          id: `sec-experience`,
          sectionType: "EXPERIENCE",
          title: "Work Experience",
          orderIndex: 1,
          isVisible: true,
          items: [
            {
              id: `exp-${Date.now()}`,
              title: "",
              subtitle: "",
              location: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
              bulletPoints: [{ id: `bp-${Date.now()}`, text: "", framework: "STANDARD" }],
            },
          ],
        },
        {
          id: `sec-projects`,
          sectionType: "PROJECTS",
          title: "Technical Projects",
          orderIndex: 2,
          isVisible: true,
          items: [
            {
              id: `proj-${Date.now()}`,
              title: "",
              subtitle: "",
              url: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
              bulletPoints: [{ id: `bp-${Date.now()}`, text: "", framework: "STANDARD" }],
            },
          ],
        },
      ],
      skillGroups: [
        {
          id: `skill-${Date.now()}`,
          categoryName: "Technical Skills",
          skills: [],
          orderIndex: 0,
        },
      ],
      updatedAt: new Date().toISOString(),
    });
    setCVDataState(blankCV);
    if (user) {
      localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(blankCV));
      setPersistence({ isSynced: false, saveSource: "local" });
    } else {
      localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(blankCV));
      setPersistence({ isSynced: false, saveSource: "local" });
    }
    setLastSaved(new Date());
    setIsDirty(false);
  };

  const resetDraft = () => {
    clearAll();
  };

      return (
    <CVContext.Provider
      value={{
        cvData,
        setCVData,
        updatePersonalInfo,
        updateSectionItems,
        updateSkillGroups,
        addCustomSection,
        updateSectionTitle,
        removeSection,
        setTemplateId,
        setAccentColor,
        setTargetRole,
        targetJobDescription,
        setTargetJobDescription,
        mobileView,
        setMobileView,
        desktopView,
        setDesktopView,
        lastSaved,
        isDirty,
        saveDraft,
        resetDraft,
        clearAll,
        loadFromHistory,
        loadCV,
        restoreDraft,
        hasSavedDraft,
        persistence,
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within a CVProvider");
  }
  return context;
}
