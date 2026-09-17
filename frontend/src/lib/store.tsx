"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { CVData, TemplateId, CVSection, CVItem, SkillGroup, SectionType, normalizeCVData, BLANK_CV } from "@/types/cv";
import { saveToHistory, getHistory, deleteFromHistory } from "./historyStore";
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

interface CVContextType {
  cvData: CVData;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  updatePersonalInfo: (field: keyof CVData["personalInfo"], value: string) => void;
  updateSectionItems: (sectionTypeOrId: SectionType | string, items: CVItem[]) => void;
  updateSkillGroups: (groups: SkillGroup[]) => void;
  addCustomSection: (title: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  removeSection: (sectionId: string) => void;
  setTemplateId: (id: TemplateId) => void;
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

      try {
        if (canUseCloud) {
          // Authenticated: load from MySQL
          const cvs = await cvApi.list();
          if (cvs.length > 0) {
            const latest = cvs[0];
            const remote = await cvApi.getById(latest.id);
            const normalized = normalizeCVData({
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
              },
            });
            setCVDataState(normalized);
            setPersistence({ isSynced: true, lastSync: new Date(), saveSource: "cloud" });
            setLastSaved(new Date());
            setIsDirty(false);
            return;
          }

          // No cloud CVs for this account. Adopt a local draft ONLY if it is
          // guest-origin (created locally in this browser); ignore a mirror
          // left over from a previously signed-in account.
          const saved = localStorage.getItem(CV_DRAFT_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && isLocalDraftId(parsed.id ?? parsed.cvId)) {
              const normalized = normalizeCVData(parsed);
              setCVDataState(normalized);
              setPersistence({ isSynced: false, saveSource: "local" });
              setLastSaved(new Date());
              return;
            }
          }
          if (userChanged) {
            setCVDataState({ ...normalizeCVData(BLANK_CV), id: `cv-draft-${Date.now()}` });
            setPersistence({ isSynced: false, saveSource: "local" });
            setIsDirty(false);
          }
          return;
        }

        // Guest or no cloud CVs: load from localStorage
        const saved = localStorage.getItem(CV_DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.id || parsed.sections || parsed.education)) {
            const normalized = normalizeCVData(parsed);
            setCVDataState(normalized);
            setPersistence({ isSynced: false, saveSource: "local" });
            setLastSaved(new Date());
            return;
          }
        }
        if (userChanged) {
          setCVDataState({ ...normalizeCVData(BLANK_CV), id: `cv-draft-${Date.now()}` });
          setPersistence({ isSynced: false, saveSource: "local" });
          setIsDirty(false);
        }
      } catch (e) {
        console.warn("Could not hydrate draft:", e);
        // Fallback to localStorage (best effort, e.g. backend offline)
        try {
          const saved = localStorage.getItem(CV_DRAFT_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            const normalized = normalizeCVData(parsed);
            setCVDataState(normalized);
            setPersistence({ isSynced: false, saveSource: "local" });
          }
        } catch (localErr) {
          console.warn("Could not load draft from localStorage:", localErr);
        }
      } finally {
        setIsHydrated(true);
        setIsDirty(false);
      }
    }
    hydrate();
  }, [canUseCloud, user, authLoading]);

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

  const setTemplateId = (id: TemplateId) => {
    setCVData((prev) => ({
      ...prev,
      templateId: id,
      updatedAt: new Date().toISOString(),
    }));
  };

  const setTargetRole = (role: string, roleId?: string) => {
    setCVData((prev) => ({
      ...prev,
      targetRole: role,
      targetRoleId: roleId !== undefined ? roleId : prev.targetRoleId,
      updatedAt: new Date().toISOString(),
    }));
  };

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
        saveToHistory(normalized, "draft");
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
          saveToHistory(normalized, "draft");
        } catch (cloudErr) {
          // Fallback to localStorage if cloud save fails
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
          setPersistence({ isSynced: false, lastSync: now, saveSource: "local", validationRunId });
          saveToHistory(normalized, "draft");
        }
      } else {
        // Guest: save to localStorage only
        localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
        setPersistence({ isSynced: false, lastSync: now, saveSource: "local", validationRunId });
        saveToHistory(normalized, "draft");
      }
      return true;
    } catch (e) {
      console.error("Save error:", e);
      return false;
    }
  };

  const loadFromHistory = (snapshot: CVData) => {
    const normalized = normalizeCVData(snapshot);
    setCVDataState(normalized);
    setIsDirty(false);
    setLastSaved(new Date());
    if (canUseCloud) {
      const promote = isLocalDraftId(normalized.id);
      if (promote) {
        cvApi.create(normalized).then((created) => {
          const updated = { ...normalized, id: created.id };
          setCVDataState(updated);
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(updated));
          setPersistence({ isSynced: true, lastSync: new Date(), saveSource: "cloud" });
        }).catch(() => {
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
          setPersistence({ isSynced: false, saveSource: "local" });
        });
      } else {
        cvApi.update(normalized.id!, normalized).then((updated) => {
          setCVDataState({ ...normalized, id: updated.id || normalized.id! });
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
          setPersistence({ isSynced: true, lastSync: new Date(), saveSource: "cloud" });
        }).catch(() => {
          localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
          setPersistence({ isSynced: false, saveSource: "local" });
        });
      }
    } else {
      localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
      setPersistence({ isSynced: false, saveSource: "local" });
    }
  };

  const loadCV = (data: Partial<CVData>) => {
    setCVDataState((prev) => {
      const merged = normalizeCVData({
        ...prev,
        ...data,
        id: data.id || prev.id || `cv-${Date.now()}`,
      });
      if (canUseCloud) {
        // Existing cloud CV (real UUID): update in place. New or guest-origin
        // draft: create (promote to cloud).
        if (merged.id && !isLocalDraftId(merged.id)) {
          cvApi.update(merged.id, merged).then((updated) => {
            setCVDataState({ ...merged, id: updated.id || merged.id! });
            setPersistence({ isSynced: true, lastSync: new Date(), saveSource: "cloud" });
          }).catch(() => {
            localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(merged));
            setPersistence({ isSynced: false, saveSource: "local" });
          });
        } else {
          cvApi.create(merged).then((created) => {
            setCVDataState({ ...merged, id: created.id });
            setPersistence({ isSynced: true, lastSync: new Date(), saveSource: "cloud" });
          }).catch(() => {
            localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(merged));
            setPersistence({ isSynced: false, saveSource: "local" });
          });
        }
      } else {
        localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(merged));
        setPersistence({ isSynced: false, saveSource: "local" });
      }
      return merged;
    });
    setIsDirty(false);
    setLastSaved(new Date());
  };

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
