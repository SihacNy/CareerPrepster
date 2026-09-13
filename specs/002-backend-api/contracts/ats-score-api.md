# API Contract: Deterministic ATS Scoring Engine

**Base URL**: `/api/ats`

---

## 1. Score CV (4-Pillar Evaluation & Findings)

Executes a deterministic rule-based evaluation against the target CV document, returning scores, pillar breakdowns, actionable findings, and optional JD keyword matching.

- **Method**: `POST`
- **Path**: `/api/ats/score`
- **Auth Required**: Yes (`requireAuth` middleware)

### Request Body
```json
{
  "cvId": "uuid-cv",
  "targetJobDescription": "We are seeking a Frontend Developer with strong TypeScript, React, Next.js, and CSS skills to build intuitive user interfaces."
}
```

### Zod Validation Schema
```typescript
export const scoreCvSchema = z.object({
  cvId: z.string().uuid("Invalid CV ID"),
  targetJobDescription: z.string().max(10000).optional(),
});
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "reportId": "uuid-report",
    "overallScore": 84,
    "breakdown": {
      "parsability": {
        "score": 25,
        "maxScore": 25,
        "status": "PASSED",
        "description": "Standard headers, clean contact info, single-column layout."
      },
      "impact": {
        "score": 22,
        "maxScore": 30,
        "status": "SUGGESTION",
        "description": "Strong power verbs present; 2 bullet points lack quantifiable metrics."
      },
      "skills": {
        "score": 21,
        "maxScore": 25,
        "status": "PASSED",
        "description": "Categorized skill groups with 14 relevant technical skills."
      },
      "brevity": {
        "score": 16,
        "maxScore": 20,
        "status": "PASSED",
        "description": "Document length is optimal (520 words)."
      }
    },
    "jobMatch": {
      "matchPercentage": 75,
      "matchedKeywords": ["TypeScript", "React", "Next.js", "CSS"],
      "missingKeywords": ["Redux", "Jest", "CI/CD"]
    },
    "findings": [
      {
        "id": "find-1",
        "pillar": "IMPACT",
        "severity": "SUGGESTION",
        "title": "Add Quantifiable Metrics",
        "message": "Bullet point under 'Junior Frontend Developer' does not contain numbers, percentages, or metrics.",
        "sectionRef": "EXPERIENCE",
        "remediation": "Rewrite using the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z]."
      },
      {
        "id": "find-2",
        "pillar": "SKILLS",
        "severity": "PASSED",
        "title": "Clean Categorization",
        "message": "Skills are cleanly organized into 3 clear categories.",
        "sectionRef": "SKILLS"
      }
    ]
  }
}
```
