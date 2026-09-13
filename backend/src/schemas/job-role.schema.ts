import { z } from 'zod';

export const jobRoleQuerySchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
});

export const roleBulletsQuerySchema = z.object({
  category: z.string().optional(),
});

export type JobRoleQuery = z.infer<typeof jobRoleQuerySchema>;
export type RoleBulletsQuery = z.infer<typeof roleBulletsQuerySchema>;
