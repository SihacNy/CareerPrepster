import { z } from 'zod';

export const enhanceBulletSchema = z.object({
  rawBullet: z
    .string()
    .min(5, 'Input bullet must be at least 5 characters long')
    .max(500, 'Input bullet must not exceed 500 characters')
    .trim(),
  sectionContext: z
    .object({
      roleTitle: z.string().optional(),
      organization: z.string().optional(),
      technologies: z.array(z.string()).optional(),
    })
    .optional(),
  framework: z.enum(['STAR', 'XYZ', 'AUTO']).default('XYZ'),
});

export const bulletSuggestionSchema = z.object({
  id: z.string(),
  actionVerb: z.string(),
  framework: z.enum(['STAR', 'XYZ']),
  enhancedText: z.string(),
  accomplishedX: z.string(),
  measuredY: z.string(),
  byDoingZ: z.string(),
  explanation: z.string(),
});

export type EnhanceBulletInput = z.infer<typeof enhanceBulletSchema>;
export type BulletSuggestion = z.infer<typeof bulletSuggestionSchema>;
