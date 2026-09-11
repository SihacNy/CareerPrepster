# AI Wording Assistant API Contract

**Base URL**: `/api/ai`  
**Endpoint**: `POST /api/ai/enhance-bullet`  
**Validation**: Zod Schema (`shared/src/schemas/ai.schema.ts`)  

---

## Purpose
Transforms a student's draft bullet point into 2–3 high-impact, quantified achievement statements framed using the **STAR** (Situation, Task, Action, Result) or **XYZ** (Accomplished [X], measured by [Y], by doing [Z]) methodology.

---

## Request

- **Method**: `POST /api/ai/enhance-bullet`
- **Headers**: `Content-Type: application/json`
- **Body (`EnhanceBulletInputSchema`)**:
  ```json
  {
    "rawBullet": "Worked on a web application for booking flights and fixed some slow queries",
    "sectionContext": {
      "roleOrProjectTitle": "Full-Stack Developer Intern",
      "organization": "TravelTech Inc.",
      "technologiesUsed": ["React", "Node.js", "PostgreSQL"]
    },
    "frameworkPreference": "XYZ"
  }
  ```

---

## Response

- **Status**: `200 OK`
- **Body (`EnhanceBulletOutputSchema`)**:
  ```json
  {
    "success": true,
    "data": {
      "originalBullet": "Worked on a web application for booking flights and fixed some slow queries",
      "suggestions": [
        {
          "id": "sug-1",
          "actionVerb": "Optimized",
          "framework": "XYZ",
          "enhancedText": "Optimized flight reservation database queries by 45%, reducing end-user checkout latency from 2.8s to 1.5s using PostgreSQL indexing.",
          "accomplishedX": "Optimized flight reservation database queries",
          "measuredY": "reducing end-user checkout latency by 45% (2.8s to 1.5s)",
          "byDoingZ": "implementing targeted PostgreSQL indexing and query restructuring"
        },
        {
          "id": "sug-2",
          "actionVerb": "Engineered",
          "framework": "XYZ",
          "enhancedText": "Engineered full-stack flight booking workflows in React and Node.js, supporting 10,000+ monthly searches with zero booking transaction failures.",
          "accomplishedX": "Engineered full-stack flight booking workflows",
          "measuredY": "supporting 10,000+ monthly searches with 100% transaction reliability",
          "byDoingZ": "building responsive React components and resilient Node.js API endpoints"
        }
      ]
    }
  }
  ```

---

## Error Handling

- **`400 Bad Request`**: Raw bullet point is empty or less than 5 characters.
  ```json
  { "success": false, "error": { "code": "INPUT_TOO_SHORT", "message": "Please provide a brief description of what you worked on." } }
  ```
- **`503 Service Unavailable`**: LLM API provider timeout or rate limit.
  ```json
  { "success": false, "error": { "code": "AI_UNAVAILABLE", "message": "AI assistant is temporarily busy. Your draft is preserved." } }
  ```
