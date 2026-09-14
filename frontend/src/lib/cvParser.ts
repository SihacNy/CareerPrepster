import { CVData, normalizeCVData, createBulletPoints } from "@/types/cv";
import { importApi, ApiError } from "@/lib/api";

/**
 * Error thrown when server-side file parsing fails.
 */
export class ResumeParseError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ResumeParseError";
    this.code = code;
  }
}

/**
 * Sends the resume file to the live Express backend (POST /api/cvs/import).
 * Backend extracts raw text using pdf-parse / mammoth and structures it with Gemini 3.6 Flash.
 * If the backend returns an error or fails, an error is surfaced directly with no mock/heuristic fallbacks.
 */
export async function importResumeFile(file: File): Promise<CVData> {
  try {
    const res = await importApi.uploadFile(file);

    if (!res || !res.parsedCV) {
      throw new ResumeParseError(
        "EMPTY_RESPONSE",
        "The server could not extract CV details from this document."
      );
    }

    const p = res.parsedCV;

    return normalizeCVData({
      id: `imported-${Date.now()}`,
      title: `${file.name.replace(/\.[^/.]+$/, "")} (Imported)`,
      templateId: "classic-ats",
      targetRole: "Software Engineer",
      personalInfo: {
        fullName: p.fullName || "",
        email: p.email || "",
        phone: p.phone || "",
        location: p.location || "",
        linkedinUrl: p.linkedinUrl || "",
        githubUrl: p.githubUrl || "",
        summary: p.summary || "",
      },
      sections: [
        {
          id: "sec-education",
          sectionType: "EDUCATION",
          title: "Education",
          orderIndex: 0,
          isVisible: true,
          items: (p.education || []).map((e: any, idx: number) => ({
            id: `edu-imp-${idx}`,
            title: e.degree || "Degree",
            subtitle: e.institution || "Institution",
            location: e.location || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            isCurrent: e.isCurrent || false,
            bulletPoints: [],
            orderIndex: idx,
          })),
        },
        {
          id: "sec-experience",
          sectionType: "EXPERIENCE",
          title: "Work Experience",
          orderIndex: 1,
          isVisible: true,
          items: (p.experience || []).map((exp: any, idx: number) => ({
            id: `exp-imp-${idx}`,
            title: exp.title || "Role",
            subtitle: exp.company || "Company",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            isCurrent: exp.isCurrent || false,
            bulletPoints: createBulletPoints(exp.bullets || []),
            orderIndex: idx,
          })),
        },
        {
          id: "sec-projects",
          sectionType: "PROJECTS",
          title: "Technical Projects",
          orderIndex: 2,
          isVisible: true,
          items: (p.projects || []).map((proj: any, idx: number) => ({
            id: `proj-imp-${idx}`,
            title: proj.title || "Project",
            subtitle: proj.subtitle || "",
            linkUrl: proj.url || "",
            startDate: proj.startDate || "",
            endDate: proj.endDate || "",
            isCurrent: false,
            bulletPoints: createBulletPoints(proj.bullets || []),
            orderIndex: idx,
          })),
        },
      ],
      skillGroups: (p.skillGroups || []).map((sg: any, idx: number) => ({
        id: `skill-imp-${idx}`,
        name: sg.categoryName || "Skills",
        skills: Array.isArray(sg.skills) ? sg.skills : [],
        orderIndex: idx,
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err instanceof ResumeParseError) {
      throw err;
    }
    if (err instanceof ApiError) {
      throw new ResumeParseError(err.code || "PARSE_ERROR", err.message);
    }
    throw new ResumeParseError(
      "PARSE_ERROR",
      err?.message || "Failed to process resume upload on the server. Please verify backend connection."
    );
  }
}
