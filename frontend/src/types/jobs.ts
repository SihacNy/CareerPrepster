import type {
  JobListingDto,
  JobMatchRecommendationDto,
  JobMatchReasoning,
  JobSearchPreferenceDto,
  JobDiscoveryRunDto,
  WorkArrangement,
  JobEmploymentType,
  RecommendationStatus,
} from '@careerprepster/shared';

export type {
  JobListingDto,
  JobMatchRecommendationDto,
  JobMatchReasoning,
  JobSearchPreferenceDto,
  JobDiscoveryRunDto,
  WorkArrangement,
  JobEmploymentType,
  RecommendationStatus,
};

export interface JobListResponse {
  items: JobMatchRecommendationDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  disclaimer: string;
}

export interface JobListFilterParams {
  status?: string;
  minScore?: number;
  arrangement?: string;
  employmentType?: string;
  search?: string;
  sortBy?: 'matchScore' | 'postedAt' | 'discoveredAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RefreshStatusResponse {
  canRefresh: boolean;
  cooldownSecondsRemaining: number;
  status: string;
}
