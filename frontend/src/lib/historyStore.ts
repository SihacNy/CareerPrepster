"use client";

import { CVData, CVHistoryItem, CVHistoryStatus, normalizeCVData, TemplateId } from "@/types/cv";
import { cvApi, CVListItem } from "@/lib/api";
import { HISTORY_STORAGE_KEY } from "@/lib/storageKeys";
export { HISTORY_STORAGE_KEY };

// Purge any legacy localStorage history item on client start
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
}

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

/**
 * Local storage no longer stores CV history.
 * CV history is strictly loaded and persisted in MySQL via cvApi.
 */
export function getHistory(): CVHistoryItem[] {
  return [];
}

/**
 * Fetch all CVs for the authenticated user directly from MySQL.
 */
export async function getCloudHistory(): Promise<CVHistoryItem[]> {
  try {
    const list = await cvApi.list();
    return list.map((cv: CVListItem) => ({
      id: cv.id,
      cvId: cv.id,
      title: cv.title || "Untitled Resume",
      targetRole:
        typeof cv.targetRole === "string" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cv.targetRole)
          ? cv.targetRole
          : typeof cv.targetRole === "object" && cv.targetRole !== null
          ? (cv.targetRole as any).title || "General Candidate"
          : "General Candidate",
      fullName: cv.fullName || "Candidate",
      templateId: (cv.templateId as TemplateId) || "classic",
      wordCount: 0,
      status: "draft",
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
      snapshot: undefined,
    }));
  } catch (err) {
    console.error("Failed to read CV history from MySQL:", err);
    return [];
  }
}

export async function getUnifiedHistory(cloudAuth: boolean): Promise<CVHistoryItem[]> {
  if (cloudAuth) {
    return getCloudHistory();
  }
  return [];
}

/**
 * Delete a CV from MySQL.
 */
export async function deleteFromHistory(id: string): Promise<CVHistoryItem[]> {
  try {
    await cvApi.delete(id);
  } catch (err) {
    console.error("Failed to delete CV from MySQL:", err);
  }
  return getCloudHistory();
}

/**
 * Duplicate a CV in MySQL.
 */
export async function duplicateHistoryItem(id: string): Promise<CVHistoryItem | null> {
  try {
    const existing = await cvApi.getById(id);
    if (!existing) return null;
    const cloned: CVData = normalizeCVData({
      ...existing,
      id: undefined,
      title: `${existing.title || "Untitled Resume"} (Copy)`,
      updatedAt: new Date().toISOString(),
    });
    const created = await cvApi.create(cloned);
    return {
      id: created.id,
      cvId: created.id,
      title: created.title,
      targetRole:
        typeof created.targetRole === "string" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(created.targetRole)
          ? created.targetRole
          : typeof created.targetRole === "object" && created.targetRole !== null
          ? (created.targetRole as any).title || "General Candidate"
          : "General Candidate",
      fullName: created.fullName || "Candidate",
      templateId: (created.templateId as TemplateId) || "classic",
      atsScore: created.atsScore,
      wordCount: 0,
      status: "draft",
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      snapshot: undefined,
    };
  } catch (err) {
    console.error("Failed to duplicate CV in MySQL:", err);
    return null;
  }
}
