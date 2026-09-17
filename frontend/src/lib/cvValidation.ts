import { z } from "zod";
import type { CVData } from "@/types/cv";

export interface CVValidationDetail {
  field: string;
  message: string;
}

export interface CVValidationResult {
  valid: boolean;
  errors: CVValidationDetail[];
}

// Mirrors the backend Zod schema (backend/src/schemas/cv.schema.ts) against the
// frontend's nested `personalInfo` CVData shape, so invalid payloads are caught
// before they reach the server (which would otherwise return a 400).
//
// Rules relaxed deliberately:
// - Bullet point `text` may be empty (draft rows mid-edit).
// - URL fields are optional: empty/null passes, malformed non-empty fails.
// - Email is required (non-empty + valid); `null`/`undefined` map to
//   "Required" via the schema's built-in error overrides.
//
// Every authored section entry must be filled in (title, and for Education /
// Experience also the institution / company) or removed — the SuperRefine
// enforces the per-section rules.
const urlField = z
  .union([z.string().url("Invalid URL"), z.literal("")])
  .optional()
  .nullable();

const itemValidation = z.object({
  title: z.string({ invalid_type_error: "Required" }).min(1, "Required"),
  subtitle: z.string().optional().nullable(),
  url: urlField,
  bulletPoints: z.array(z.object({ text: z.string() })).default([]),
});

const sectionValidation = z.object({
  id: z.string(),
  sectionType: z.string(),
  title: z.string().optional(),
  items: z.array(itemValidation).default([]),
});

const cvValidationSchema = z
  .object({
    title: z.string().min(1, "Required"),
    templateId: z.string().min(1, "Required"),
    targetRoleId: z
      .union([z.string().uuid("Invalid role"), z.literal("")])
      .optional()
      .nullable(),
    targetRole: z.string().optional(),
    personalInfo: z.object({
      fullName: z.string({ invalid_type_error: "Required" }).min(1, "Required"),
      email: z
        .string({ invalid_type_error: "Required", required_error: "Required" })
        .trim()
        .min(1, "Required")
        // pipe short-circuits: the format check only runs when the value is a
        // non-empty string, so an empty/null email yields a single "Required"
        // issue instead of "Required" + "Invalid email" (zod 3.25's chained
        // .email() does not stop on the earlier min failure).
        .pipe(z.string().email("Invalid email")),
      phone: z.string().optional(),
      location: z.string().optional(),
      linkedinUrl: urlField,
      githubUrl: urlField,
      portfolioUrl: urlField,
      websiteUrl: urlField,
      summary: z.string().optional(),
    }),
    sections: z.array(sectionValidation).default([]),
    skillGroups: z
      .array(
        z.object({
          categoryName: z
            .string({ invalid_type_error: "Required" })
            .min(1, "Required"),
          skills: z.array(z.string()).default([]),
        })
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
      const sec = data.sections[sIdx];
      if (sec.sectionType !== "EDUCATION" && sec.sectionType !== "EXPERIENCE") {
        continue;
      }
      for (let iIdx = 0; iIdx < sec.items.length; iIdx++) {
        if (!(sec.items[iIdx].subtitle ?? "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: ["sections", sIdx, "items", iIdx, "subtitle"],
          });
        }
      }
    }
  });

export function validateCV(data: CVData): CVValidationResult {
  const result = cvValidationSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { valid: false, errors };
}

// Index errors by their field path so form fields can look up their own message.
export function buildValidationMap(errors: CVValidationDetail[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const err of errors) {
    map[err.field] = err.message;
  }
  return map;
}