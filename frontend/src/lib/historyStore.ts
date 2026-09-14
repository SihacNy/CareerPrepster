"use client";

import { CVData, CVHistoryItem, CVHistoryStatus, normalizeCVData } from "@/types/cv";
import { INITIAL_EMPTY_CV } from "./mockData";

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

// Initial seed history items so the history page is vibrant right from the start
const INITIAL_SEED_ITEMS: CVHistoryItem[] = [
  {
    id: "hist-seed-1",
    cvId: "cv-fullstack-draft",
    title: "Full-Stack Developer Resume (Cambodia Tech)",
    targetRole: "Full-Stack Software Engineer",
    fullName: "Vannak Samnang",
    templateId: "classic",
    atsScore: 88,
    wordCount: 395,
    status: "exported",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    snapshot: normalizeCVData({
      id: "cv-fullstack-draft",
      title: "Full-Stack Developer Resume (Cambodia Tech)",
      templateId: "classic",
      targetRole: "Full-Stack Software Engineer",
      personalInfo: {
        fullName: "Vannak Samnang",
        email: "vannak.samnang@camtech.edu.kh",
        phone: "+855 12 890 123",
        location: "Phnom Penh, Cambodia",
        linkedinUrl: "linkedin.com/in/vannak-samnang",
        githubUrl: "github.com/vannaksamnang",
        summary: "Motivated Software Engineering student at CamTech with hands-on experience building full-stack web applications with Next.js, Node.js, and TypeScript. Passionate about scalable distributed systems and ATS-compliant career tools.",
      },
      education: [
        {
          id: "edu-1",
          institution: "CamTech University",
          degree: "Bachelor of Science in Software Engineering",
          location: "Phnom Penh, Cambodia",
          startDate: "2023-01",
          endDate: "2027-06",
          isCurrent: true,
          gpa: "3.85 / 4.00",
          bulletPoints: [
            "Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Cloud Architecture.",
            "Dean's List Honoree for Academic Excellence (2023, 2024).",
          ],
        },
      ],
      experience: [
        {
          id: "exp-1",
          company: "Sabay Digital Media",
          role: "Junior Web Developer Intern",
          location: "Phnom Penh, Cambodia",
          startDate: "2024-06",
          endDate: "2024-09",
          isCurrent: false,
          bulletPoints: [
            "Engineered responsive content modules using React and Tailwind CSS, reducing average initial page load by 320ms.",
            "Collaborated with senior engineers to implement RESTful endpoints in Node.js serving over 45,000 monthly active users.",
          ],
        },
      ],
      projects: [
        {
          id: "proj-1",
          name: "CareerPrepster AI Editor",
          role: "Lead Frontend Engineer",
          techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Prisma"],
          linkUrl: "github.com/vannaksamnang/careerprepster",
          startDate: "2024-10",
          endDate: "2024-12",
          bulletPoints: [
            "Architected a dual-pane live resume editor with sub-100ms preview updates using local draft synchronization.",
            "Integrated explainable 4-pillar ATS auditing algorithm providing instant diagnostic scoring across 25+ parameters.",
          ],
        },
      ],
      skills: [
        {
          id: "skill-1",
          categoryName: "Languages",
          skills: ["TypeScript", "JavaScript", "Python", "SQL", "HTML5/CSS3"],
        },
        {
          id: "skill-2",
          categoryName: "Frameworks & Libraries",
          skills: ["React", "Next.js", "Express.js", "Tailwind CSS", "Prisma ORM"],
        },
      ],
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    }),
  },
  {
    id: "hist-seed-2",
    cvId: "cv-data-analyst-draft",
    title: "Data Analyst / BI Specialist Resume",
    targetRole: "Data Analyst",
    fullName: "Sophea Chan",
    templateId: "modern",
    atsScore: 74,
    wordCount: 310,
    status: "audited",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    snapshot: normalizeCVData({
      id: "cv-data-analyst-draft",
      title: "Data Analyst / BI Specialist Resume",
      templateId: "modern",
      targetRole: "Data Analyst",
      personalInfo: {
        fullName: "Sophea Chan",
        email: "sophea.chan@alumni.camtech.edu.kh",
        phone: "+855 77 456 789",
        location: "Phnom Penh, Cambodia",
        linkedinUrl: "linkedin.com/in/sophea-chan",
        githubUrl: "github.com/sopheachan",
        summary: "Detail-oriented junior data analyst skilled in SQL querying, Python automation, and Power BI dashboards.",
      },
      education: [
        {
          id: "edu-2",
          institution: "CamTech University",
          degree: "B.S. in Data Science & Artificial Intelligence",
          location: "Phnom Penh, Cambodia",
          startDate: "2022-10",
          endDate: "2026-07",
          isCurrent: true,
          gpa: "3.72 / 4.00",
          bulletPoints: [
            "Completed capstone on predictive student attrition modeling using scikit-learn with 89% accuracy.",
          ],
        },
      ],
      experience: [
        {
          id: "exp-2",
          company: "Smart Axiata",
          role: "BI Analytics Trainee",
          location: "Phnom Penh, Cambodia",
          startDate: "2024-03",
          endDate: "2024-07",
          isCurrent: false,
          bulletPoints: [
            "Constructed automated SQL reporting pipelines reducing manual spreadsheet compilation by 6 hours weekly.",
            "Designed 4 interactive executive Power BI dashboards monitoring regional data plan adoption.",
          ],
        },
      ],
      projects: [
        {
          id: "proj-2",
          name: "Cambodia AgriMarket Price Tracker",
          techStack: ["Python", "Pandas", "PostgreSQL", "Streamlit"],
          startDate: "2024-01",
          endDate: "2024-02",
          bulletPoints: [
            "Scraped and standardized wholesale produce pricing across 12 provinces for local agricultural cooperatives.",
          ],
        },
      ],
      skills: [
        {
          id: "skill-3",
          categoryName: "Analytics & Tools",
          skills: ["Python", "SQL", "Power BI", "Excel", "PostgreSQL"],
        },
      ],
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    }),
  },
];

export function getHistory(): CVHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ITEMS));
      return INITIAL_SEED_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SEED_ITEMS;
  } catch (err) {
    console.error("Failed to read CV history from localStorage:", err);
    return INITIAL_SEED_ITEMS;
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

  const clonedSnapshot: CVData = {
    ...item.snapshot,
    id: newCvId,
    title: `${item.title} (Copy)`,
    updatedAt: now,
  };

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
