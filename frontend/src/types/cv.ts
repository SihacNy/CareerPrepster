import { z } from "zod";

export type TemplateId = "classic" | "modern";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  summary: string;
  websiteUrl?: string;
  portfolioUrl?: string;
}

export interface BulletPoint {
  id: string;
  text: string;
  actionVerb?: string;
  hasMetric?: boolean;
  framework?: "STAR" | "XYZ" | "STANDARD";
  orderIndex?: number;
}

export interface CVItem {
  id: string;
  sectionId?: string;
  title: string;       // Job Role, Degree/Major, or Project Name
  subtitle?: string;   // Company, University, or Subtitle
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  url?: string;
  gpa?: string;
  techStack?: string[];
  orderIndex?: number;
  bulletPoints: BulletPoint[];
  // Optional legacy aliases for seamless transitional compatibility
  institution?: string;
  degree?: string;
  company?: string;
  role?: string;
  name?: string;
  linkUrl?: string;
}

export type SectionType = "EXPERIENCE" | "EDUCATION" | "PROJECTS" | "SKILLS" | "CERTIFICATIONS" | "CUSTOM";

export interface CVSection {
  id: string;
  sectionType: SectionType;
  title: string;
  orderIndex?: number;
  isVisible?: boolean;
  items: CVItem[];
}

export interface SkillGroup {
  id: string;
  categoryName: string;
  skills: string[];
  orderIndex?: number;
}

// Legacy type aliases for backward compatibility during refactor
export type EducationItem = CVItem;
export type ExperienceItem = CVItem;
export type ProjectItem = CVItem;
export type SkillCategory = SkillGroup;

export interface CVData {
  id: string;
  title: string;
  templateId: TemplateId;
  targetRole: string;
  targetRoleId?: string;
  personalInfo: PersonalInfo;
  sections: CVSection[];
  skillGroups: SkillGroup[];
  updatedAt: string;
  atsScore?: number;
  // Legacy accessors for convenience
  education?: CVItem[];
  experience?: CVItem[];
  projects?: CVItem[];
  skills?: SkillGroup[];
}

/**
 * Helper to extract items for a given section type from CVData
 */
export function getSectionItems(cv: CVData, sectionType: SectionType): CVItem[] {
  const sec = cv.sections?.find((s) => s.sectionType === sectionType);
  return sec?.items || [];
}

/**
 * Helper to convert array of string bullets to BulletPoint[]
 */
export function createBulletPoints(bullets: (string | BulletPoint)[]): BulletPoint[] {
  return bullets.map((b, i) => {
    if (typeof b === "string") {
      return {
        id: `bp-${Date.now()}-${i}`,
        text: b,
        framework: "STANDARD",
        orderIndex: i,
      };
    }
    return {
      ...b,
      id: b.id || `bp-${Date.now()}-${i}`,
      orderIndex: b.orderIndex !== undefined ? b.orderIndex : i,
    };
  });
}

/**
 * Helper to extract plain string array from CVItem or BulletPoint[]
 */
export function getBulletTexts(
  itemOrBullets: CVItem | BulletPoint[] | string[] | undefined
): string[] {
  if (!itemOrBullets) return [];
  if (Array.isArray(itemOrBullets)) {
    return itemOrBullets.map((bp) => (typeof bp === "string" ? bp : bp.text));
  }
  if (!itemOrBullets.bulletPoints) return [];
  return itemOrBullets.bulletPoints.map((bp) =>
    typeof bp === "string" ? bp : bp.text
  );
}

/**
 * Normalizes any CV payload (legacy or new) into the unified Alternative 3 structure
 */
export function normalizeCVData(input: any): CVData {
  if (!input) return input;

  const sections: CVSection[] = [];
  const skillGroups: SkillGroup[] = [];

  // If already has sections array, use it
  if (Array.isArray(input.sections) && input.sections.length > 0) {
    sections.push(
      ...input.sections.map((sec: any, sIdx: number) => ({
        id: sec.id || `sec-${sIdx}`,
        sectionType: sec.sectionType || "CUSTOM",
        title: sec.title || sec.sectionType,
        orderIndex: sec.orderIndex !== undefined ? sec.orderIndex : sIdx,
        isVisible: sec.isVisible !== false,
        items: (sec.items || []).map((item: any, iIdx: number) => ({
          ...item,
          id: item.id || `item-${sIdx}-${iIdx}`,
          title: item.title || item.degree || item.role || item.name || "",
          subtitle: item.subtitle || item.institution || item.company || (Array.isArray(item.techStack) ? item.techStack.join(", ") : "") || "",
          bulletPoints: createBulletPoints(item.bulletPoints || []),
        })),
      }))
    );
  } else {
    // Migrate legacy education[]
    if (Array.isArray(input.education) && input.education.length > 0) {
      sections.push({
        id: `sec-education`,
        sectionType: "EDUCATION",
        title: "Education",
        orderIndex: 0,
        isVisible: true,
        items: input.education.map((item: any, idx: number) => ({
          id: item.id || `edu-${idx}`,
          title: item.title || item.degree || "",
          subtitle: item.subtitle || item.institution || "",
          location: item.location || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          isCurrent: Boolean(item.isCurrent),
          gpa: item.gpa || "",
          orderIndex: idx,
          bulletPoints: createBulletPoints(item.bulletPoints || []),
        })),
      });
    }

    // Migrate legacy experience[]
    if (Array.isArray(input.experience) && input.experience.length > 0) {
      sections.push({
        id: `sec-experience`,
        sectionType: "EXPERIENCE",
        title: "Work Experience",
        orderIndex: 1,
        isVisible: true,
        items: input.experience.map((item: any, idx: number) => ({
          id: item.id || `exp-${idx}`,
          title: item.title || item.role || "",
          subtitle: item.subtitle || item.company || "",
          location: item.location || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          isCurrent: Boolean(item.isCurrent),
          orderIndex: idx,
          bulletPoints: createBulletPoints(item.bulletPoints || []),
        })),
      });
    }

    // Migrate legacy projects[]
    if (Array.isArray(input.projects) && input.projects.length > 0) {
      sections.push({
        id: `sec-projects`,
        sectionType: "PROJECTS",
        title: "Technical Projects",
        orderIndex: 2,
        isVisible: true,
        items: input.projects.map((item: any, idx: number) => ({
          id: item.id || `proj-${idx}`,
          title: item.title || item.name || "",
          subtitle: item.subtitle || (Array.isArray(item.techStack) ? item.techStack.join(", ") : "") || "",
          techStack: item.techStack || [],
          url: item.url || item.linkUrl || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          isCurrent: Boolean(item.isCurrent),
          orderIndex: idx,
          bulletPoints: createBulletPoints(item.bulletPoints || []),
        })),
      });
    }
  }

  // Handle skill groups
  if (Array.isArray(input.skillGroups) && input.skillGroups.length > 0) {
    skillGroups.push(...input.skillGroups);
  } else if (Array.isArray(input.skills) && input.skills.length > 0) {
    skillGroups.push(
      ...input.skills.map((sg: any, idx: number) => ({
        id: sg.id || `skill-${idx}`,
        categoryName: sg.categoryName || "Skills",
        skills: sg.skills || [],
        orderIndex: idx,
      }))
    );
  }

  const eduItems = sections.find((s) => s.sectionType === "EDUCATION")?.items || [];
  const expItems = sections.find((s) => s.sectionType === "EXPERIENCE")?.items || [];
  const projItems = sections.find((s) => s.sectionType === "PROJECTS")?.items || [];

  return {
    id: input.id || `cv-${Date.now()}`,
    title: input.title || "My Resume",
    templateId: input.templateId || "classic",
    targetRole: input.targetRole || "",
    targetRoleId: input.targetRoleId,
    personalInfo: input.personalInfo || {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      summary: "",
    },
    sections,
    skillGroups,
    updatedAt: input.updatedAt || new Date().toISOString(),
    atsScore: input.atsScore,
    // Provide legacy mirrors so existing reader logic keeps working
    education: eduItems,
    experience: expItems,
    projects: projItems,
    skills: skillGroups,
  };
}

export const BLANK_CV: CVData = {
  id: "cv-new",
  title: "Untitled Resume",
  templateId: "classic",
  targetRole: "",
  targetRoleId: undefined,
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    summary: "",
    websiteUrl: "",
    portfolioUrl: "",
  },
  sections: [
    {
      id: "sec-education",
      sectionType: "EDUCATION",
      title: "Education",
      orderIndex: 0,
      isVisible: true,
      items: [
        {
          id: "edu-init-1",
          title: "",
          subtitle: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          gpa: "",
          bulletPoints: [{ id: "bp-init-edu-1", text: "", framework: "STANDARD" }],
        },
      ],
    },
    {
      id: "sec-experience",
      sectionType: "EXPERIENCE",
      title: "Work Experience",
      orderIndex: 1,
      isVisible: true,
      items: [
        {
          id: "exp-init-1",
          title: "",
          subtitle: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          bulletPoints: [{ id: "bp-init-exp-1", text: "", framework: "STANDARD" }],
        },
      ],
    },
    {
      id: "sec-projects",
      sectionType: "PROJECTS",
      title: "Technical Projects",
      orderIndex: 2,
      isVisible: true,
      items: [
        {
          id: "proj-init-1",
          title: "",
          subtitle: "",
          url: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          bulletPoints: [{ id: "bp-init-proj-1", text: "", framework: "STANDARD" }],
        },
      ],
    },
  ],
  skillGroups: [
    {
      id: "skill-group-init-1",
      categoryName: "Technical Skills",
      skills: [],
      orderIndex: 0,
    },
  ],
  updatedAt: new Date().toISOString(),
};

export interface JobRole {
  id: string;
  name: string;
  track: string;
}

export interface RoleBulletTemplate {
  id: string;
  roleId: string;
  category: "Technical Implementation" | "System Performance" | "Collaboration & Delivery" | "Problem Solving";
  text: string;
}

export interface ATSFinding {
  id: string;
  type: "critical" | "suggestion" | "passed";
  pillar: "parsability" | "impact" | "skills" | "brevity";
  message: string;
  recommendation: string;
  suggestedFix?: string;
  sectionTarget?: "personalInfo" | "education" | "experience" | "projects" | "skills";
}

export interface ATSReport {
  overallScore: number;
  wordCount: number;
  estimatedPages: number;
  breakdown: {
    parsabilityScore: number; // Max 25
    impactScore: number;      // Max 30
    skillsScore: number;      // Max 25
    brevityScore: number;     // Max 20
  };
  keywordAnalysis?: {
    matchPercentage: number;
    matchedKeywords: { keyword: string; count: number }[];
    missingKeywords: string[];
  };
  findings: ATSFinding[];
}

// Zod Schema for validation
export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  summary: z.string().optional().default(""),
});

export type CVHistoryStatus = "draft" | "audited" | "exported";

export interface CVHistoryItem {
  id: string;
  cvId: string;
  title: string;
  targetRole: string;
  fullName: string;
  templateId: TemplateId;
  atsScore?: number;
  wordCount?: number;
  status: CVHistoryStatus;
  createdAt: string;
  updatedAt: string;
  snapshot?: CVData;
}
