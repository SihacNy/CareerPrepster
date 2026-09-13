import { z } from 'zod';

export const scoreCvSchema = z.object({
  cvId: z.string().optional(),
  cvData: z.any().optional(),
  targetJobDescription: z.string().max(10000, 'Target job description exceeds 10,000 characters').optional(),
});

export const pillarFindingSchema = z.object({
  id: z.string(),
  pillar: z.enum(['PARSABILITY', 'IMPACT', 'SKILLS', 'BREVITY']),
  severity: z.enum(['CRITICAL', 'SUGGESTION', 'PASSED']),
  title: z.string(),
  message: z.string(),
  sectionRef: z.string().optional(),
  remediation: z.string().optional(),
});

export type ScoreCvInput = z.infer<typeof scoreCvSchema>;
export type PillarFinding = z.infer<typeof pillarFindingSchema>;
