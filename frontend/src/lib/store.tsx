"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CVData, TemplateId } from "@/types/cv";
import { INITIAL_EMPTY_CV } from "./mockData";

const STORAGE_KEY = "careerprepster_cv_draft_v1";

interface CVContextType {
  cvData: CVData;
  setCVData: React.Dispatch<React.SetStateAction<CVData>>;
  updatePersonalInfo: (field: keyof CVData["personalInfo"], value: string) => void;
  setTemplateId: (id: TemplateId) => void;
  setTargetRole: (role: string) => void;
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
}

const CVContext = createContext<CVContextType | null>(null);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cvData, setCVDataState] = useState<CVData>(INITIAL_EMPTY_CV);
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
        if (parsed && parsed.id) {
          setCVDataState(parsed);
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
    setCVDataState(action);
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

  const setTemplateId = (id: TemplateId) => {
    setCVData((prev) => ({
      ...prev,
      templateId: id,
      updatedAt: new Date().toISOString(),
    }));
  };

  const setTargetRole = (role: string) => {
    setCVData((prev) => ({
      ...prev,
      targetRole: role,
      updatedAt: new Date().toISOString(),
    }));
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const clearAll = () => {
    const blankCV: CVData = {
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
      education: [
        {
          id: `edu-${Date.now()}`,
          institution: "",
          degree: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          gpa: "",
          bulletPoints: [""],
        },
      ],
      experience: [
        {
          id: `exp-${Date.now()}`,
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          bulletPoints: [""],
        },
      ],
      projects: [
        {
          id: `proj-${Date.now()}`,
          name: "",
          role: "",
          techStack: [],
          linkUrl: "",
          startDate: "",
          endDate: "",
          bulletPoints: [""],
        },
      ],
      skills: [
        {
          id: `skill-${Date.now()}`,
          categoryName: "Technical Skills",
          skills: [],
        },
      ],
      updatedAt: new Date().toISOString(),
    };
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
