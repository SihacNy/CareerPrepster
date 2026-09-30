import { z } from 'zod';

export const WorkArrangementSchema = z.enum(['REMOTE', 'HYBRID', 'ON_SITE']);
export const JobEmploymentTypeSchema = z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']);
export const RecommendationStatusSchema = z.enum(['ACTIVE', 'SAVED', 'DISMISSED', 'APPLIED', 'INTERVIEWING', 'ARCHIVED']);

export const JobListQuerySchema = z.object({
  status: RecommendationStatusSchema.or(z.literal('ALL')).default('ACTIVE'),
  minScore: z.coerce.number().min(0).max(100).default(0),
  arrangement: WorkArrangementSchema.optional(),
  employmentType: JobEmploymentTypeSchema.optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['matchScore', 'postedAt', 'discoveredAt']).default('matchScore'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type JobListQueryInput = z.infer<typeof JobListQuerySchema>;

export const UpdateRecommendationStatusSchema = z.object({
  status: RecommendationStatusSchema,
  userNotes: z.string().max(1000).optional().nullable(),
});

export type UpdateRecommendationStatusInput = z.infer<typeof UpdateRecommendationStatusSchema>;

export const UpdateJobPreferencesSchema = z.object({
  desiredRoles: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  preferredLocations: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  preferredArrangement: WorkArrangementSchema.optional().nullable(),
  preferredEmploymentType: JobEmploymentTypeSchema.optional().nullable(),
  minSalary: z.number().int().positive().optional().nullable(),
  notifyDaily: z.boolean().default(true),
});

export type UpdateJobPreferencesInput = z.infer<typeof UpdateJobPreferencesSchema>;

export const JobMatchReasoningSchema = z.object({
  summary: z.string(),
  evidenceReasons: z.array(z.string()).default([]),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      criticality: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      recommendation: z.string(),
    })
  ).default([]),
});

export type JobMatchReasoningInput = z.infer<typeof JobMatchReasoningSchema>;
