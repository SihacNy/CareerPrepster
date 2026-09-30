import { Framework, SectionType, TemplateId } from '../constants/index.js';

export interface BulletPoint {
  id: string;
  text: string;
  actionVerb?: string;
  hasMetric?: boolean;
  framework?: Framework;
  orderIndex?: number;
}

export interface CVItem {
  id: string;
  sectionId?: string;
  title: string;
  subtitle?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  url?: string;
  gpa?: string;
  techStack?: string[];
  orderIndex?: number;
  bulletPoints: BulletPoint[];
  // Legacy aliases
  institution?: string;
  degree?: string;
  company?: string;
  role?: string;
  name?: string;
  linkUrl?: string;
}

export interface CVSection {
  id: string;
  sectionType: SectionType;
  title: string;
  customTitle?: string;
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
  photoUrl?: string;
}

export interface CVData {
  id: string;
  title: string;
  templateId: TemplateId | string;
  accentColor?: string;
  targetRole: string;
  targetRoleId?: string;
  personalInfo: PersonalInfo;
  sections: CVSection[];
  skillGroups: SkillGroup[];
  updatedAt: string;
  atsScore?: number;
  education?: CVItem[];
  experience?: CVItem[];
  projects?: CVItem[];
  skills?: SkillGroup[];
}

export type EducationItem = CVItem;
export type ExperienceItem = CVItem;
export type ProjectItem = CVItem;
export type SkillCategory = SkillGroup;
