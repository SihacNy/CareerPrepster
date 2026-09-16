import { z } from 'zod';

export const interviewTrackEnum = z.enum(['BEHAVIORAL', 'TECHNICAL', 'MIXED']);
export const sessionLengthEnum = z.enum(['QUICK', 'STANDARD', 'FULL']);
export const practiceModeEnum = z.enum(['INSTANT_FEEDBACK', 'EXAM']);
export const sessionStatusEnum = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']);
export const inputModalityEnum = z.enum(['TEXT', 'VOICE']);

export const createInterviewSessionSchema = z.object({
  cvId: z.string().optional().nullable(),
  targetRoleId: z.string().optional().nullable(),
  targetRoleTitle: z.string().min(2, 'Target role title must be at least 2 characters').max(100),
  jobDescription: z.string().max(5000, 'Job description must not exceed 5000 characters').optional().nullable(),
  track: interviewTrackEnum.default('BEHAVIORAL'),
  sessionLength: sessionLengthEnum.default('STANDARD'),
  mode: practiceModeEnum.default('INSTANT_FEEDBACK'),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  responseText: z
    .string()
    .min(3, 'Answer must be at least 3 characters long')
    .max(5000, 'Answer must not exceed 5000 characters')
    .trim(),
  inputModality: inputModalityEnum.default('TEXT'),
  durationSeconds: z.number().int().nonnegative().default(0),
});

export const turnFeedbackSchema = z.object({
  id: z.string(),
  responseId: z.string(),
  starSituationScore: z.number().int().min(1).max(5),
  starSituationNotes: z.string().optional(),
  starTaskScore: z.number().int().min(1).max(5),
  starTaskNotes: z.string().optional(),
  starActionScore: z.number().int().min(1).max(5),
  starActionNotes: z.string().optional(),
  starResultScore: z.number().int().min(1).max(5),
  starResultNotes: z.string().optional(),
  impactScore: z.number().int().min(1).max(5),
  clarityScore: z.number().int().min(1).max(5),
  powerVerbsUsed: z.array(z.string()),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  modelAnswer: z.string(),
});

export const cvRecommendationSchema = z.object({
  cvItemId: z.string().optional(),
  bulletPointId: z.string().optional(),
  originalText: z.string().optional(),
  recommendation: z.string(),
  reason: z.string(),
});

export const interviewScorecardSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  overallScore: z.number().int().min(0).max(100),
  readinessTier: z.string(),
  starScore: z.number().int().min(0).max(100),
  technicalScore: z.number().int().min(0).max(100),
  communicationScore: z.number().int().min(0).max(100),
  impactScore: z.number().int().min(0).max(100),
  keyStrengths: z.array(z.string()),
  keyGrowthAreas: z.array(z.string()),
  cvRecommendations: z.array(cvRecommendationSchema),
  createdAt: z.string(),
});

export const listSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  track: interviewTrackEnum.optional(),
});

export type CreateInterviewSessionInput = z.infer<typeof createInterviewSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type TurnFeedbackOutput = z.infer<typeof turnFeedbackSchema>;
export type CVRecommendation = z.infer<typeof cvRecommendationSchema>;
export type InterviewScorecardOutput = z.infer<typeof interviewScorecardSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
