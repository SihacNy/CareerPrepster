import { ATSPillar, FindingSeverity } from '../constants/index.js';

export interface PillarFinding {
  id: string;
  pillar: ATSPillar;
  severity: FindingSeverity;
  title: string;
  message: string;
  sectionRef?: string;
  remediation?: string;
}

export interface ATSFinding {
  id: string;
  type: 'critical' | 'suggestion' | 'passed';
  pillar: 'parsability' | 'impact' | 'skills' | 'brevity';
  message: string;
  recommendation?: string;
  suggestedFix?: string;
  sectionTarget?: string;
}

export interface ATSScoreBreakdown {
  parsabilityScore: number;
  impactScore: number;
  skillsScore: number;
  brevityScore: number;
}

export interface KeywordAnalysis {
  matchPercentage: number;
  matchedKeywords: { keyword: string; count: number }[];
  missingKeywords: string[];
}

export interface ATSReport {
  overallScore: number;
  wordCount: number;
  estimatedPages: number;
  breakdown: ATSScoreBreakdown;
  keywordAnalysis?: KeywordAnalysis;
  findings: ATSFinding[];
}

export interface ScoreCvInput {
  cvId?: string;
  cvData?: any;
  targetJobDescription?: string;
}
