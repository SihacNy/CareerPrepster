/**
 * CareerPrepster Frontend API Client
 * Typed client with credentials support and error boundary covering all backend endpoints.
 */

import { CVData } from "@/types/cv";
import {
  InterviewSessionData,
  CreateInterviewSessionPayload,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
  InterviewScorecardData,
} from "@/types/interview";

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

  if (typeof window !== "undefined") {
    const savedToken = localStorage.getItem("careerprepster_auth_token");
    if (savedToken) {
      defaultHeaders["Authorization"] = `Bearer ${savedToken}`;
    }
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
  loginWithGoogle: (token: string) =>
    fetchApi<{ user: AuthUser; token?: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ accessToken: token, idToken: token }),
    }),

  getMe: () =>
    fetchApi<{ user: AuthUser }>("/auth/me", {
      method: "GET",
    }),

  logout: () =>
    fetchApi<{ message: string }>("/auth/logout", {
      method: "POST",
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
  accentColor?: string;
  fullName: string;
  targetRoleId?: string | null;
  targetRole?: string | { id: string; title: string } | null;
  atsScore?: number;
  isExported?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const cvApi = {
  list: () =>
    fetchApi<CVListItem[]>("/cvs", {
      method: "GET",
    }),

  markExported: (id: string) =>
    fetchApi<{ id: string; isExported: boolean }>(`/cvs/${id}/export`, {
      method: "POST",
    }),

  getById: (id: string) =>
    fetchApi<any>(`/cvs/${id}`, {
      method: "GET",
    }),

  create: (cvData: Partial<CVData>) => {
    const payload = {
      title: cvData.title || "Untitled Resume",
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
      photoUrl: cvData.personalInfo?.photoUrl || null,
      accentColor: cvData.accentColor || "#0284c7",
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
      targetRoleId: cvData.targetRoleId || null,
      targetRole: cvData.targetRole || null,
      fullName: cvData.personalInfo?.fullName,
      email: cvData.personalInfo?.email,
      phone: cvData.personalInfo?.phone || null,
      location: cvData.personalInfo?.location || null,
      websiteUrl: cvData.personalInfo?.portfolioUrl || null,
      linkedinUrl: cvData.personalInfo?.linkedinUrl || null,
      githubUrl: cvData.personalInfo?.githubUrl || null,
      summary: cvData.personalInfo?.summary || null,
      photoUrl: cvData.personalInfo?.photoUrl || null,
      accentColor: cvData.accentColor,
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
// 7. AI Interview Coach & Drills
// -------------------------------------------------------------
export const interviewApi = {
  createSession: (payload: CreateInterviewSessionPayload) =>
    fetchApi<{ session: InterviewSessionData }>("/interviews/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSession: (id: string) =>
    fetchApi<InterviewSessionData>(`/interviews/sessions/${id}`, {
      method: "GET",
    }),

  submitAnswer: (sessionId: string, payload: SubmitAnswerPayload) =>
    fetchApi<SubmitAnswerResponse>(`/interviews/sessions/${sessionId}/responses`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getScorecard: (sessionId: string) =>
    fetchApi<InterviewScorecardData>(`/interviews/sessions/${sessionId}/scorecard`, {
      method: "GET",
    }),

  listSessions: (params?: { page?: number; limit?: number; track?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.track) query.set("track", params.track);
    const qs = query.toString();
    return fetchApi<{
      sessions: Array<any>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/interviews/sessions${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
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
  interviews: interviewApi,
};

