"use client";

import { CVData, CVHistoryItem, CVHistoryStatus, normalizeCVData, BLANK_CV } from "@/types/cv";

export const HISTORY_STORAGE_KEY = "careerprepster_cv_history_v1";

// Helper to calculate total words in a CV
export function countCVWords(cv: CVData): number {
  const parts: (string | undefined)[] = [
    cv.personalInfo.fullName,
    cv.personalInfo.summary,
  ];

  if (cv.sections && cv.sections.length > 0) {
    cv.sections.forEach((sec) => {
      (sec.items || []).forEach((item) => {
        parts.push(item.title, item.subtitle, item.location);
        (item.bulletPoints || []).forEach((bp) => {
          parts.push(typeof bp === "string" ? bp : bp.text);
        });
      });
    });
  } else {
    (cv.education || []).forEach((e) => {
      parts.push(e.institution || e.subtitle, e.degree || e.title);
      (e.bulletPoints || []).forEach((bp) => {
        parts.push(typeof bp === "string" ? bp : bp.text);
      });
    });
    (cv.experience || []).forEach((e) => {
      parts.push(e.company || e.subtitle, e.role || e.title);
      (e.bulletPoints || []).forEach((bp) => {
        parts.push(typeof bp === "string" ? bp : bp.text);
      });
    });
    (cv.projects || []).forEach((p) => {
      parts.push(p.name || p.title, p.role || p.subtitle);
      (p.bulletPoints || []).forEach((bp) => {
        parts.push(typeof bp === "string" ? bp : bp.text);
      });
    });
  }

  if (cv.skillGroups && cv.skillGroups.length > 0) {
    cv.skillGroups.forEach((g) => {
      parts.push(g.categoryName, ...(g.skills || []));
    });
  } else if (cv.skills) {
    cv.skills.forEach((s) => {
      parts.push(s.categoryName, ...(s.skills || []));
    });
  }

  return parts
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getHistory(): CVHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error("Failed to read CV history from localStorage:", err);
    return [];
  }
}

export function saveToHistory(
  cv: CVData,
  status: CVHistoryStatus = "draft",
  atsScore?: number
): CVHistoryItem {
  const history = getHistory();
  const now = new Date().toISOString();
  const wordCount = countCVWords(cv);

  // Check if an entry with this cvId already exists
  const existingIndex = history.findIndex((item) => item.cvId === cv.id);

  let updatedItem: CVHistoryItem;

  if (existingIndex >= 0) {
    const existing = history[existingIndex];
    updatedItem = {
      ...existing,
      title: cv.title || cv.targetRole || "Untitled Resume",
      targetRole: cv.targetRole || "General Candidate",
      fullName: cv.personalInfo.fullName || "Unnamed Candidate",
      templateId: cv.templateId,
      atsScore: atsScore !== undefined ? atsScore : existing.atsScore,
      wordCount,
      status,
      updatedAt: now,
      snapshot: { ...cv },
    };
    history[existingIndex] = updatedItem;
  } else {
    updatedItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      cvId: cv.id,
      title: cv.title || cv.targetRole || "Untitled Resume",
      targetRole: cv.targetRole || "General Candidate",
      fullName: cv.personalInfo.fullName || "Unnamed Candidate",
      templateId: cv.templateId,
      atsScore,
      wordCount,
      status,
      createdAt: now,
      updatedAt: now,
      snapshot: { ...cv },
    };
    history.unshift(updatedItem);
  }

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to save CV history item to localStorage:", err);
  }

  return updatedItem;
}

export function deleteFromHistory(id: string): CVHistoryItem[] {
  const history = getHistory();
  const filtered = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete CV history item from localStorage:", err);
  }
  return filtered;
}

export function duplicateHistoryItem(id: string): CVHistoryItem | null {
  const history = getHistory();
  const item = history.find((i) => i.id === id);
  if (!item) return null;

  const newCvId = `cv-copy-${Date.now()}`;
  const now = new Date().toISOString();

  const clonedSnapshot: CVData = normalizeCVData({
    ...(item.snapshot || BLANK_CV),
    id: newCvId,
    title: `${item.title} (Copy)`,
    templateId: item.templateId || item.snapshot?.templateId || "classic",
    updatedAt: now,
  });

  const newItem: CVHistoryItem = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    cvId: newCvId,
    title: `${item.title} (Copy)`,
    targetRole: item.targetRole,
    fullName: item.fullName,
    templateId: item.templateId,
    atsScore: item.atsScore,
    wordCount: item.wordCount,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    snapshot: clonedSnapshot,
  };

  const updatedHistory = [newItem, ...history];
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (err) {
    console.error("Failed to save duplicated history item to localStorage:", err);
  }

  return newItem;
}
