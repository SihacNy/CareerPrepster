import { z } from 'zod';
import { BULLET_CATEGORIES } from '../constants/index.js';

export const jobRoleQuerySchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
});

export const roleBulletsQuerySchema = z.object({
  category: z.string().optional(),
});

export const jobRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  track: z.string(),
  industry: z.string().optional().nullable(),
});

export const roleBulletTemplateSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  category: z.enum(BULLET_CATEGORIES).or(z.string()),
  text: z.string(),
});

export type JobRoleQuery = z.infer<typeof jobRoleQuerySchema>;
export type RoleBulletsQuery = z.infer<typeof roleBulletsQuerySchema>;
export type JobRole = z.infer<typeof jobRoleSchema>;
export type RoleBulletTemplate = z.infer<typeof roleBulletTemplateSchema>;
