"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CVData, TemplateId, CVSection, CVItem, SkillGroup, SectionType, normalizeCVData, BLANK_CV } from "@/types/cv";
import { saveToHistory } from "./historyStore";

const STORAGE_KEY = "careerprepster_cv_draft_v1";

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
  saveDraft: () => void;
  resetDraft: () => void;
  clearAll: () => void;
  loadFromHistory: (snapshot: CVData) => void;
  loadCV: (data: Partial<CVData>) => void;
}

const CVContext = createContext<CVContextType | null>(null);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cvData, setCVDataState] = useState<CVData>(BLANK_CV);
  const [targetJobDescription, setTargetJobDescription] = useState<string>("");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [desktopView, setDesktopView] = useState<"dual" | "editor" | "preview">("dual");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate from localStorage on client mount (one time)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.sections || parsed.education)) {
          const normalized = normalizeCVData(parsed);
          setCVDataState(normalized);
          setLastSaved(new Date());
        }
      }
    } catch (e) {
      console.warn("Could not load draft from localStorage:", e);
    } finally {
      setIsHydrated(true);
      setIsDirty(false);
    }
  }, []);

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

  const saveDraft = () => {
    try {
      const normalized = normalizeCVData(cvData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setLastSaved(new Date());
      setIsDirty(false);
      saveToHistory(normalized, "draft");
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const loadFromHistory = (snapshot: CVData) => {
    const normalized = normalizeCVData(snapshot);
    setCVDataState(normalized);
    setIsDirty(false);
    setLastSaved(new Date());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {
      console.error("Failed to sync loaded history to active draft:", e);
    }
  };

  const loadCV = (data: Partial<CVData>) => {
    setCVDataState((prev) => {
      const merged = normalizeCVData({
        ...prev,
        ...data,
        id: data.id || prev.id || `cv-${Date.now()}`,
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.error("Failed to sync loaded CV to active draft:", e);
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blankCV));
    } catch (e) {
      console.error("Save error during clear:", e);
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
