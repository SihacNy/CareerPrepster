import { z } from 'zod';

export const bulletPointSchema = z.object({
  id: z.string().optional(),
  text: z.string().default(''),
  actionVerb: z.string().optional().nullable(),
  hasMetric: z.boolean().default(false),
  framework: z.enum(['STAR', 'XYZ', 'STANDARD']).default('STANDARD'),
  orderIndex: z.number().int().default(0),
});

// Mirrors frontend CVItem (frontend/src/types/cv.ts). Extra optional fields are
// accepted for forward-compat and simply ignored by the Prisma write path.
export const cvItemSchema = z.object({
  id: z.string().optional(),
  sectionId: z.string().optional(),
  title: z.string().default(''),
  subtitle: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  gpa: z.string().optional().nullable(),
  techStack: z.array(z.string()).optional().nullable(),
  orderIndex: z.number().int().default(0),
  bulletPoints: z.array(bulletPointSchema).default([]),
  // Legacy aliases for transitional compatibility
  institution: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
});

export const cvSectionSchema = z.object({
  id: z.string().optional(),
  sectionType: z.enum(['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'SKILLS', 'CERTIFICATIONS', 'CUSTOM']).default('CUSTOM'),
  title: z.string().optional().default(''),
  customTitle: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  items: z.array(cvItemSchema).default([]),
});

export const skillGroupSchema = z.object({
  id: z.string().optional(),
  categoryName: z.string().min(1, 'Category name is required'),
  skills: z.array(z.string()).default([]),
  orderIndex: z.number().int().default(0),
});

export const createCvSchema = z.object({
  title: z.string().min(1, 'CV title is required').default('Untitled CV'),
  templateId: z.string().default('classic-ats'),
  targetRoleId: z.string().uuid('Invalid role ID').optional().nullable(),
  targetRole: z.string().optional().nullable(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().optional().nullable().or(z.literal('')),
  githubUrl: z.string().optional().nullable().or(z.literal('')),
  summary: z.string().optional().nullable(),
  sections: z.array(cvSectionSchema).default([]),
  skillGroups: z.array(skillGroupSchema).default([]),
});

export const updateCvSchema = z.object({
  title: z.string().min(1, 'CV title is required').optional(),
  templateId: z.string().optional(),
  targetRoleId: z.string().uuid('Invalid role ID').optional().nullable(),
  targetRole: z.string().optional().nullable(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email address format').optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().optional().nullable().or(z.literal('')),
  githubUrl: z.string().optional().nullable().or(z.literal('')),
  summary: z.string().optional().nullable(),
  sections: z.array(cvSectionSchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
});

export type CreateCvInput = z.infer<typeof createCvSchema>;
export type UpdateCvInput = z.infer<typeof updateCvSchema>;
