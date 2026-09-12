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
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  gpa?: string;
  bulletPoints: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bulletPoints: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  techStack: string[];
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  bulletPoints: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface CVData {
  id: string;
  title: string;
  templateId: TemplateId;
  targetRole: string;
  personalInfo: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  updatedAt: string;
}

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
