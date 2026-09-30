import { WorkArrangement, JobEmploymentType } from '@careerprepster/shared';

export interface RawDiscoveredJob {
  title: string;
  company: string;
  logoUrl?: string | null;
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
  postedAt?: Date | null;
}

export interface JobDiscoveryQuery {
  keywords?: string;
  location?: string;
  limit?: number;
}

export interface JobSourceProvider {
  readonly sourceId: string;
  readonly displayName: string;
  discoverJobs(query?: JobDiscoveryQuery): Promise<RawDiscoveredJob[]>;
  verifyAuthorization?(): Promise<boolean>;
}
