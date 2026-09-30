/**
 * CareerPrepster Frontend API Client
 * Typed client with credentials support and error boundary covering all backend endpoints.
 */

import { CVData } from "@/types/cv";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any[];
  };
}

export class ApiError extends Error {
  code: string;
  details?: any[];

  constructor(message: string, code = "API_ERROR", details?: any[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include", // Enforces sending and receiving HttpOnly JWT cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(
        `HTTP error ${response.status}: ${response.statusText}`,
        "NETWORK_ERROR"
      );
    }
    return {} as T;
  }

  if (!response.ok || !json.success) {
    const errMessage =
      json.error?.message ||
      `Request failed with status ${response.status}`;
    const errCode = json.error?.code || `HTTP_${response.status}`;
    throw new ApiError(errMessage, errCode, json.error?.details);
  }

  return json.data as T;
}

// -------------------------------------------------------------
// 1. Authentication Endpoints
// -------------------------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  googleId?: string | null;
}

export const authApi = {
  loginWithGoogle: (idToken: string) =>
    fetchApi<{ user: AuthUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  getMe: () =>
    fetchApi<{ user: AuthUser }>("/auth/me", {
      method: "GET",
    }),

  logout: () =>
    fetchApi<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  devLogin: (email?: string) =>
    fetchApi<{ user: AuthUser; token: string }>("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// -------------------------------------------------------------
// 2. Job Roles & Starter Bullets
// -------------------------------------------------------------
export interface JobRole {
  id: string;
  title: string;
  industry?: string | null;
  description?: string | null;
  skills?: string[] | null;
}

export interface StarterBullet {
  id: string;
  jobRoleId: string;
  bulletText: string;
  powerVerb: string;
  skillCategory: string;
  framework: string;
}

export const jobRoleApi = {
  search: (query = "") =>
    fetchApi<JobRole[]>(`/job-roles${query ? `?q=${encodeURIComponent(query)}` : ""}`, {
      method: "GET",
    }),

  getBullets: (roleId: string) =>
    fetchApi<StarterBullet[]>(`/job-roles/${roleId}/bullets`, {
      method: "GET",
    }),
};

// -------------------------------------------------------------
// 3. CV CRUD Endpoints
// -------------------------------------------------------------
export interface CVListItem {
  id: string;
  title: string;
  templateId: string;
  fullName: string;
  targetRoleId?: string | null;
  targetRole?: string | { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const cvApi = {
  list: () =>
    fetchApi<CVListItem[]>("/cvs", {
      method: "GET",
    }),

  getById: (id: string) =>
    fetchApi<any>(`/cvs/${id}`, {
      method: "GET",
    }),

  create: (cvData: Partial<CVData>) => {
    const payload = {
      title: cvData.title || "Untitled CV",
      templateId: cvData.templateId || "classic-ats",
      targetRoleId: cvData.targetRoleId || null,
      targetRole: cvData.targetRole || null,
      fullName: cvData.personalInfo?.fullName || "Candidate",
      email: cvData.personalInfo?.email || "candidate@example.com",
      phone: cvData.personalInfo?.phone || null,
      location: cvData.personalInfo?.location || null,
      websiteUrl: cvData.personalInfo?.portfolioUrl || null,
      linkedinUrl: cvData.personalInfo?.linkedinUrl || null,
      githubUrl: cvData.personalInfo?.githubUrl || null,
      summary: cvData.personalInfo?.summary || null,
      sections: cvData.sections || [],
      skillGroups: cvData.skillGroups || [],
    };
    return fetchApi<any>("/cvs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: (id: string, cvData: Partial<CVData>) => {
    const payload = {
      title: cvData.title,
      templateId: cvData.templateId,
      targetRoleId: cvData.targetRoleId !== undefined ? cvData.targetRoleId : null,
      targetRole: cvData.targetRole || null,
      fullName: cvData.personalInfo?.fullName,
      email: cvData.personalInfo?.email,
      phone: cvData.personalInfo?.phone || null,
      location: cvData.personalInfo?.location || null,
      websiteUrl: cvData.personalInfo?.portfolioUrl || null,
      linkedinUrl: cvData.personalInfo?.linkedinUrl || null,
      githubUrl: cvData.personalInfo?.githubUrl || null,
      summary: cvData.personalInfo?.summary || null,
      sections: cvData.sections,
      skillGroups: cvData.skillGroups,
    };
    return fetchApi<any>(`/cvs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/cvs/${id}`, {
      method: "DELETE",
    }),
};

// -------------------------------------------------------------
// 4. AI Enhancement (Google Gemini 3.6 Flash)
// -------------------------------------------------------------
export interface AIEnhanceInput {
  rawBullet: string;
  sectionContext?: {
    roleTitle?: string;
    organization?: string;
    technologies?: string[];
  };
  framework?: "STAR" | "XYZ" | "AUTO";
}

export interface AISuggestion {
  id: string;
  actionVerb: string;
  framework: "STAR" | "XYZ";
  enhancedText: string;
  accomplishedX: string;
  measuredY: string;
  byDoingZ: string;
  explanation: string;
}

export const aiApi = {
  enhanceBullet: (input: AIEnhanceInput) =>
    fetchApi<{ originalBullet: string; suggestions: AISuggestion[] }>(
      "/ai/enhance-bullet",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    ),
};

// -------------------------------------------------------------
// 5. ATS Scoring Engine
// -------------------------------------------------------------
export interface ScoreCvRequest {
  cvId?: string;
  cvData?: any;
  targetJobDescription?: string;
}

export interface ATSReportData {
  id?: string;
  cvId?: string;
  overallScore: number;
  parsabilityScore: number;
  impactScore: number;
  skillsScore: number;
  brevityScore: number;
  matchPercentage?: number;
  findings: Array<{
    id: string;
    pillar: "PARSABILITY" | "IMPACT" | "SKILLS" | "BREVITY";
    severity: "CRITICAL" | "SUGGESTION" | "PASSED";
    title: string;
    message: string;
    sectionRef?: string;
    remediation?: string;
  }>;
}

export const atsApi = {
  score: (req: ScoreCvRequest) =>
    fetchApi<ATSReportData>("/ats/score", {
      method: "POST",
      body: JSON.stringify(req),
    }),
};

// -------------------------------------------------------------
// 6. Resume File Import (PDF/DOCX)
// -------------------------------------------------------------
export const importApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchApi<any>("/cvs/import", {
      method: "POST",
      body: formData,
    });
  },
};

// -------------------------------------------------------------
// 7. Personalized Job Match Endpoints
// -------------------------------------------------------------
import type {
  JobListResponse,
  JobListFilterParams,
  JobMatchRecommendationDto,
  JobSearchPreferenceDto,
  RefreshStatusResponse,
  RecommendationStatus,
} from "@/types/jobs";

export const jobsApi = {
  listRecommendations: (params: JobListFilterParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== "ALL") searchParams.set("status", params.status);
    if (params.minScore) searchParams.set("minScore", params.minScore.toString());
    if (params.arrangement && params.arrangement !== "ALL") searchParams.set("arrangement", params.arrangement);
    if (params.employmentType && params.employmentType !== "ALL") searchParams.set("employmentType", params.employmentType);
    if (params.search) searchParams.set("search", params.search);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());

    const qs = searchParams.toString();
    return fetchApi<JobListResponse>(`/jobs/recommendations${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  },

  getRecommendationById: (id: string) =>
    fetchApi<JobMatchRecommendationDto>(`/jobs/recommendations/${id}`, {
      method: "GET",
    }),

  updateRecommendationStatus: (id: string, status: RecommendationStatus, userNotes?: string) =>
    fetchApi<JobMatchRecommendationDto>(`/jobs/recommendations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, userNotes }),
    }),

  getPreferences: () =>
    fetchApi<JobSearchPreferenceDto>("/jobs/preferences", {
      method: "GET",
    }),

  updatePreferences: (preferences: Partial<JobSearchPreferenceDto>) =>
    fetchApi<JobSearchPreferenceDto>("/jobs/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    }),

  triggerRefresh: () =>
    fetchApi<{ cooldownSecondsRemaining: number }>("/jobs/refresh", {
      method: "POST",
    }),

  getRefreshStatus: () =>
    fetchApi<RefreshStatusResponse>("/jobs/refresh/status", {
      method: "GET",
    }),

  adminDiscover: (keywords?: string, location?: string) => {
    const searchParams = new URLSearchParams();
    if (keywords) searchParams.set("keywords", keywords);
    if (location) searchParams.set("location", location);
    const qs = searchParams.toString();
    return fetchApi<{ runId: string; jobsScanned: number; jobsInserted: number; jobsUpdated: number }>(
      `/jobs/admin/discover${qs ? `?${qs}` : ""}`,
      {
        method: "POST",
      }
    );
  },
};

// Unified Default Client
export const api = {
  auth: authApi,
  jobRoles: jobRoleApi,
  cvs: cvApi,
  ai: aiApi,
  ats: atsApi,
  import: importApi,
  jobs: jobsApi,
};
