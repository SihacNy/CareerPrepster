import { z } from "zod";
import { urlFieldSchema } from "@careerprepster/shared";
import type { CVData } from "@/types/cv";
import { getTemplateById } from "@/types/templates";

export interface CVValidationDetail {
  field: string;
  message: string;
}

export interface CVValidationResult {
  valid: boolean;
  errors: CVValidationDetail[];
}

// Uses shared URL validation from @careerprepster/shared while applying
// frontend-specific interactive draft rules.
const urlField = urlFieldSchema;

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
      photoUrl: z.string().optional(),
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
    // If template supports photo, candidate headshot is required
    if (getTemplateById(data.templateId).supportsPhoto) {
      if (!(data.personalInfo.photoUrl ?? "").trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["personalInfo", "photoUrl"],
        });
      }
    }

    for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
      const sec = data.sections[sIdx];
      if (
        sec.sectionType !== "EDUCATION" &&
        sec.sectionType !== "EXPERIENCE" &&
        sec.sectionType !== "CUSTOM"
      ) {
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