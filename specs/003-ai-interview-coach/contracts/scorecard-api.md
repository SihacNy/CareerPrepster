# Interview Scorecard API Contract

**Base URL**: `/api/interviews/sessions/:id/scorecard`  
**Authentication**: Required (JWT cookie via `requireAuth` middleware)  
**Validation**: Zod Schemas (`shared/src/schemas/interview.schema.ts`)  

---

## 1. Get or Generate Final Interview Scorecard

Fetches the comprehensive evaluation scorecard for a completed session. If the session has just reached conclusion and the scorecard has not yet been computed, the backend invokes Gemini's synthesis pipeline to aggregate performance across all answered questions, compute dimensional scores, and generate cross-referenced CV bullet recommendations.

- **Method**: `GET /api/interviews/sessions/:id/scorecard`
- **Response**: `200 OK`
- **Response Body (`InterviewScorecardOutputSchema`)**:
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "ses-9812-abcd-45ef",
      "targetRoleTitle": "Junior Full-Stack Engineer",
      "track": "BEHAVIORAL",
      "sessionLength": "STANDARD",
      "mode": "INSTANT_FEEDBACK",
      "overallScore": 84,
      "readinessTier": "Solid Foundation - Minor Refinements Needed",
      "subScores": {
        "starScore": 86,
        "technicalScore": 88,
        "communicationScore": 80,
        "impactScore": 82
      },
      "keyStrengths": [
        "Consistently articulated technical depth and personal architectural decisions across full-stack projects.",
        "Structured answers cleanly with clear Situation context and well-defined Task ownership.",
        "Demonstrated strong self-awareness and accountability when discussing debugging challenges."
      ],
      "keyGrowthAreas": [
        "Include more concrete before-and-after quantifiable metrics (e.g. latency, user counts, transaction volume) in the Result stage.",
        "Avoid overly granular explanations of code syntax; focus higher-level on business impact and trade-offs."
      ],
      "cvRecommendations": [
        {
          "cvItemId": "item-capstone-001",
          "bulletPointId": "bp-002",
          "originalText": "Improved database performance and fixed slow flight booking queries using indexes.",
          "recommendation": "Engineered composite B-Tree indexes on flight departure queries, slashing query response times by 85% (from 2.8s to <400ms) under simulated 500-user load.",
          "reason": "During the drill, you articulated the specific 85% latency reduction and composite indexing strategy, but your current CV bullet point undersells this achievement as a generic task."
        }
      ],
      "questionsSummary": [
        {
          "questionIndex": 1,
          "questionText": "Tell me about a time when you encountered an unexpected bug in your TravelTech project...",
          "competency": "Technical Problem Solving",
          "studentResponse": "In my capstone project, our flight query endpoint was taking almost 3 seconds to return...",
          "score": 88,
          "modelAnswer": "During our capstone flight reservation system testing, search queries peaked at 2.8 seconds..."
        },
        {
          "questionIndex": 2,
          "questionText": "Can you describe a situation where you had a disagreement with a teammate regarding a technical decision?",
          "competency": "Team Collaboration & Conflict Resolution",
          "studentResponse": "During our group project, my teammate wanted to use MongoDB while I advocated for MySQL...",
          "score": 80,
          "modelAnswer": "In our e-commerce capstone, our team debated whether to use MongoDB or MySQL..."
        }
      ],
      "completedAt": "2026-09-16T10:52:15.000Z"
    }
  }
  ```

---

## 2. Error Handling

- **`400 Bad Request`**: `SESSION_NOT_FINISHED` - Attempted to fetch or generate a scorecard for a session that still has pending unanswered questions.
- **`404 Not Found`**: `SESSION_NOT_FOUND` - Interview session does not exist or does not belong to the authenticated user.
- **`503 Service Unavailable`**: `SCORECARD_GENERATION_FAILED` - AI synthesis pipeline error. Retrying the request regenerates the scorecard.
