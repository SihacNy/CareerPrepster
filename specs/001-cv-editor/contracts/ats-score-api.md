# Universal ATS Scoring API Contract

**Base URL**: `/api/ats`  
**Endpoint**: `POST /api/ats/score`  
**Validation**: Zod Schema (`shared/src/schemas/ats.schema.ts`)  

---

## Purpose
Evaluates a CV across the 4 universal ATS screening pillars:
1. **Parsability & Section Structure** (25 points)
2. **Impact & Action-Oriented Phrasing** (30 points)
3. **Skills Depth & Categorization** (25 points)
4. **Brevity & Readability** (20 points)

Supports both **General Hygiene Mode** and **Job-Targeted Mode** (when a target job description is supplied).

---

## Request

- **Method**: `POST /api/ats/score`
- **Body (`ATSScoreInputSchema`)**:
  ```json
  {
    "cvId": "c7a8b9c0-1234-5678-90ab-cdef12345678",
    "targetJobDescription": "Looking for a Software Engineer with experience in React, Node.js, TypeScript, MySQL, Docker, and REST APIs. Must have strong unit testing skills and experience building high-throughput services."
  }
  ```

---

## Response

- **Status**: `200 OK`
- **Body (`ATSScoreOutputSchema`)**:
  ```json
  {
    "success": true,
    "data": {
      "reportId": "rep-uuid-999",
      "cvId": "c7a8b9c0-1234-5678-90ab-cdef12345678",
      "overallScore": 84,
      "breakdown": {
        "parsabilityScore": 25,
        "impactScore": 24,
        "skillsScore": 20,
        "brevityScore": 15
      },
      "wordCount": 580,
      "estimatedPages": 1,
      "keywordAnalysis": {
        "matchPercentage": 78,
        "matchedKeywords": [
          { "keyword": "React", "count": 3 },
          { "keyword": "Node.js", "count": 2 },
          { "keyword": "TypeScript", "count": 4 },
          { "keyword": "MySQL", "count": 1 },
          { "keyword": "Docker", "count": 2 }
        ],
        "missingKeywords": [
          { "keyword": "Unit Testing", "priority": "HIGH" },
          { "keyword": "REST APIs", "priority": "MEDIUM" }
        ]
      },
      "findings": [
        {
          "id": "F-01",
          "category": "IMPACT",
          "severity": "SUGGESTION",
          "title": "Missing Quantifiable Metric",
          "message": "Bullet point in 'Campus Tutoring' lacks measurable results (numbers, %, or scale). Consider framing with the XYZ framework.",
          "sectionRef": "sec-experience-item-2"
        },
        {
          "id": "F-02",
          "category": "SKILLS",
          "severity": "PASSED",
          "title": "Categorized Skills Detected",
          "message": "Skills are cleanly organized into Languages, Frameworks, and Tools.",
          "sectionRef": "sec-skills"
        },
        {
          "id": "F-03",
          "category": "PARSABILITY",
          "severity": "PASSED",
          "title": "Standard ATS Headings Used",
          "message": "All headings match universal ATS parser formats.",
          "sectionRef": null
        }
      ],
      "generatedAt": "2026-09-11T12:10:00.000Z"
    }
  }
  ```
