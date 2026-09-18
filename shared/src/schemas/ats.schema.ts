import { z } from 'zod';
import { ATS_PILLARS, FINDING_SEVERITIES } from '../constants/index.js';

export const scoreCvSchema = z.object({
  cvId: z.string().optional(),
  cvData: z.any().optional(),
  targetJobDescription: z
    .string()
    .max(10000, 'Target job description exceeds 10,000 characters')
    .optional(),
});

export const pillarFindingSchema = z.object({
  id: z.string(),
  pillar: z.enum(ATS_PILLARS),
  severity: z.enum(FINDING_SEVERITIES),
  title: z.string(),
  message: z.string(),
  sectionRef: z.string().optional(),
  remediation: z.string().optional(),
});

export const atsFindingSchema = z.object({
  id: z.string(),
  type: z.enum(['critical', 'suggestion', 'passed']).or(z.enum(FINDING_SEVERITIES)),
  pillar: z.enum(['parsability', 'impact', 'skills', 'brevity']).or(z.enum(ATS_PILLARS)),
  message: z.string(),
  recommendation: z.string().optional(),
  suggestedFix: z.string().optional(),
  sectionTarget: z.string().optional(),
});

export const atsScoreBreakdownSchema = z.object({
  parsabilityScore: z.number().min(0).max(25),
  impactScore: z.number().min(0).max(30),
  skillsScore: z.number().min(0).max(25),
  brevityScore: z.number().min(0).max(20),
});

export const keywordAnalysisSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  matchedKeywords: z.array(z.object({ keyword: z.string(), count: z.number() })),
  missingKeywords: z.array(z.string()),
});

export const atsReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  wordCount: z.number().int().nonnegative(),
  estimatedPages: z.number().min(0),
  breakdown: atsScoreBreakdownSchema,
  keywordAnalysis: keywordAnalysisSchema.optional(),
  findings: z.array(atsFindingSchema.or(pillarFindingSchema)),
});


