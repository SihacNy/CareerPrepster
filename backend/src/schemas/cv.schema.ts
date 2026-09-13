import { z } from 'zod';

export const bulletPointSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Bullet point text cannot be empty'),
  actionVerb: z.string().optional().nullable(),
  hasMetric: z.boolean().default(false),
  framework: z.enum(['STAR', 'XYZ', 'STANDARD']).default('STANDARD'),
  orderIndex: z.number().int().default(0),
});

export const cvItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title / Role / Degree is required'),
  subtitle: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  orderIndex: z.number().int().default(0),
  bulletPoints: z.array(bulletPointSchema).default([]),
});

export const cvSectionSchema = z.object({
  id: z.string().optional(),
  sectionType: z.enum(['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'SKILLS', 'CERTIFICATIONS', 'CUSTOM']),
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
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().optional().nullable().or(z.literal('')),
  githubUrl: z.string().optional().nullable().or(z.literal('')),
  summary: z.string().optional().nullable(),
});

export const updateCvSchema = z.object({
  title: z.string().min(1, 'CV title is required').optional(),
  templateId: z.string().optional(),
  targetRoleId: z.string().uuid('Invalid role ID').optional().nullable(),
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
