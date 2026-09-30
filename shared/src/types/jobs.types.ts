export type WorkArrangement = 'REMOTE' | 'HYBRID' | 'ON_SITE';
export type JobEmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
export type RecommendationStatus = 'ACTIVE' | 'SAVED' | 'DISMISSED' | 'APPLIED' | 'INTERVIEWING' | 'ARCHIVED';
export type DiscoveryRunStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export interface JobListingDto {
  id: string;
  title: string;
  company: string;
  logoUrl: string | null;
  location: string;
  workArrangement: WorkArrangement;
  employmentType: JobEmploymentType;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minExperienceYears: number;
  sourcePlatform: string;
  externalId?: string | null;
  applicationUrl: string;
  postedAt?: string | null;
  discoveredAt: string;
  isActive: boolean;
}

export interface JobMatchReasoning {
  summary: string;
  evidenceReasons: string[];
  skillGaps: Array<{
    skill: string;
    criticality: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendation: string;
  }>;
}

export interface JobMatchRecommendationDto {
  id: string;
  userId: string;
  cvId: string;
  jobListingId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  roleScore: number;
  preferenceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: JobMatchReasoning;
  status: RecommendationStatus;
  userNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  job: JobListingDto;
}

export interface JobSearchPreferenceDto {
  id?: string;
  userId: string;
  desiredRoles: string[];
  preferredLocations: string[];
  preferredArrangement?: WorkArrangement | null;
  preferredEmploymentType?: JobEmploymentType | null;
  minSalary?: number | null;
  notifyDaily: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobDiscoveryRunDto {
  id: string;
  sourcePlatform: string;
  status: DiscoveryRunStatus;
  jobsScanned: number;
  jobsInserted: number;
  jobsUpdated: number;
  jobsExpired: number;
  errorSummary?: string | null;
  startedAt: string;
  completedAt?: string | null;
}
