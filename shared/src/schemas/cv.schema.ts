import { z } from 'zod';
import { FRAMEWORKS, SECTION_TYPES, TEMPLATES } from '../constants/index.js';

export const urlFieldSchema = z
  .union([z.string().url('Invalid URL'), z.literal('')])
  .optional()
  .nullable();

export const bulletPointSchema = z.object({
  id: z.string().optional(),
  text: z.string().default(''),
  actionVerb: z.string().optional().nullable(),
  hasMetric: z.boolean().optional().default(false),
  framework: z.enum(FRAMEWORKS).optional().default('STANDARD'),
  orderIndex: z.number().int().optional().default(0),
});

export const cvItemSchema = z.object({
  id: z.string().optional(),
  sectionId: z.string().optional(),
  title: z.string().default(''),
  subtitle: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  url: urlFieldSchema,
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
  sectionType: z.enum(SECTION_TYPES).default('CUSTOM'),
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

export const photoFieldSchema = z
  .string()
  .max(14 * 1024 * 1024, 'Photo payload must not exceed 10MB')
  .optional()
  .nullable();

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  linkedinUrl: urlFieldSchema.default(''),
  githubUrl: urlFieldSchema.default(''),
  summary: z.string().optional().default(''),
  websiteUrl: urlFieldSchema.default(''),
  portfolioUrl: urlFieldSchema.default(''),
  photoUrl: photoFieldSchema.default(''),
});

// Full CV document state (as stored in frontend store and returned from getById)
export const cvDataSchema = z.object({
  id: z.string().default(''),
  title: z.string().min(1, 'CV title is required').default('Untitled CV'),
  templateId: z.enum(TEMPLATES).or(z.string()).default('classic'),
  accentColor: z.string().max(30).optional().default('#0284c7'),
  targetRoleId: z.string().uuid('Invalid role ID').optional().nullable(),
  targetRole: z.string().optional().default(''),
  personalInfo: personalInfoSchema,
  sections: z.array(cvSectionSchema).default([]),
  skillGroups: z.array(skillGroupSchema).default([]),
  updatedAt: z.string().optional(),
  atsScore: z.number().optional(),
  education: z.array(cvItemSchema).optional(),
  experience: z.array(cvItemSchema).optional(),
  projects: z.array(cvItemSchema).optional(),
  skills: z.array(skillGroupSchema).optional(),
});

// Create CV Schema: accepts either nested personalInfo OR flat fields for full interoperability
export const createCvSchema = z.preprocess((val: any) => {
  if (val && typeof val === 'object' && val.personalInfo && typeof val.personalInfo === 'object') {
    const { personalInfo, ...rest } = val;
    return {
      ...rest,
      fullName: personalInfo.fullName ?? rest.fullName,
      email: personalInfo.email ?? rest.email,
      phone: personalInfo.phone ?? rest.phone,
      location: personalInfo.location ?? rest.location,
      linkedinUrl: personalInfo.linkedinUrl ?? rest.linkedinUrl,
      githubUrl: personalInfo.githubUrl ?? rest.githubUrl,
      websiteUrl: personalInfo.websiteUrl ?? rest.websiteUrl,
      summary: personalInfo.summary ?? rest.summary,
      photoUrl: personalInfo.photoUrl ?? rest.photoUrl,
      accentColor: val.accentColor ?? rest.accentColor ?? '#0284c7',
      personalInfo,
    };
  }
  return val;
}, z.object({
  title: z.string().min(1, 'CV title is required').default('Untitled CV'),
  templateId: z.string().default('classic'),
  accentColor: z.string().max(30).optional().default('#0284c7'),
  targetRoleId: z.string().uuid('Invalid role ID').optional().nullable(),
  targetRole: z.string().optional().nullable(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  websiteUrl: urlFieldSchema,
  linkedinUrl: urlFieldSchema,
  githubUrl: urlFieldSchema,
  photoUrl: photoFieldSchema,
  summary: z.string().optional().nullable(),
  personalInfo: personalInfoSchema.optional(),
  sections: z.array(cvSectionSchema).default([]),
  skillGroups: z.array(skillGroupSchema).default([]),
}));

// Update CV Schema: partial updates, also supporting personalInfo preprocessing
export const updateCvSchema = z.preprocess((val: any) => {
  if (val && typeof val === 'object' && val.personalInfo && typeof val.personalInfo === 'object') {
    const { personalInfo, ...rest } = val;
    return {
      ...rest,
      fullName: personalInfo.fullName ?? rest.fullName,
      email: personalInfo.email ?? rest.email,
      phone: personalInfo.phone ?? rest.phone,
      location: personalInfo.location ?? rest.location,
      linkedinUrl: personalInfo.linkedinUrl ?? rest.linkedinUrl,
      githubUrl: personalInfo.githubUrl ?? rest.githubUrl,
      websiteUrl: personalInfo.websiteUrl ?? rest.websiteUrl,
      summary: personalInfo.summary ?? rest.summary,
      photoUrl: personalInfo.photoUrl ?? rest.photoUrl,
      accentColor: val.accentColor ?? rest.accentColor,
      personalInfo,
    };
  }
  return val;
}, z.object({
  title: z.string().min(1, 'CV title is required').optional(),
  templateId: z.string().optional(),
  accentColor: z.string().max(30).optional(),
  targetRoleId: z.string().uuid('Invalid role ID').optional().nullable(),
  targetRole: z.string().optional().nullable(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email address format').optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  websiteUrl: urlFieldSchema,
  linkedinUrl: urlFieldSchema,
  githubUrl: urlFieldSchema,
  photoUrl: photoFieldSchema,
  summary: z.string().optional().nullable(),
  personalInfo: personalInfoSchema.optional(),
  sections: z.array(cvSectionSchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
}));

export type CreateCvInput = z.infer<typeof createCvSchema>;
export type UpdateCvInput = z.infer<typeof updateCvSchema>;
