import { z } from 'zod';

export const parsedEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
});

export const parsedExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const parsedProjectSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  bullets: z.array(z.string()).default([]),
});

export const parsedSkillGroupSchema = z.object({
  categoryName: z.string(),
  skills: z.array(z.string()).default([]),
});

export const parsedCvSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  education: z.array(parsedEducationSchema).default([]),
  experience: z.array(parsedExperienceSchema).default([]),
  projects: z.array(parsedProjectSchema).default([]),
  skillGroups: z.array(parsedSkillGroupSchema).default([]),
});

export type ParsedEducation = z.infer<typeof parsedEducationSchema>;
export type ParsedExperience = z.infer<typeof parsedExperienceSchema>;
export type ParsedProject = z.infer<typeof parsedProjectSchema>;
export type ParsedSkillGroup = z.infer<typeof parsedSkillGroupSchema>;
export type ParsedCv = z.infer<typeof parsedCvSchema>;
