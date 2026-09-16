# Interview Turn & Evaluation API Contract

**Base URL**: `/api/interviews/sessions/:id`  
**Authentication**: Required (JWT cookie via `requireAuth` middleware)  
**Validation**: Zod Schemas (`shared/src/schemas/interview.schema.ts`)  

---

## 1. Submit Answer for Active Question

Submits the candidate's answer for the current question. The backend orchestrates with Google Gemini to analyze STAR framework adherence.
Depending on answer completeness and probing rules:
1. **Adaptive Probe Outcome**: If the answer is vague or misses critical Action/Result details and this question has not yet been probed, the API returns a follow-up probing question.
2. **Turn Feedback Outcome**: If the answer is sufficient (or following a probe), the API generates STAR component ratings, strength/improvement insights, and an improved model answer. In Instant Feedback mode, this feedback is returned immediately alongside the next primary question.

- **Method**: `POST /api/interviews/sessions/:id/responses`
- **Headers**: `Content-Type: application/json`
- **Request Body (`SubmitAnswerInputSchema`)**:
  ```json
  {
    "questionId": "q-101-abcd",
    "responseText": "In my capstone project, our flight query endpoint was taking almost 3 seconds to return. I noticed we were doing multiple sequential database lookups, so I rewrote them using parallel promises and added composite indexes.",
    "inputModality": "TEXT",
    "durationSeconds": 68
  }
  ```

---

### Response Variant A: Adaptive Follow-Up Probe Triggered

Returned when the student's initial response needs elaboration before final scoring.

- **Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "type": "PROBE",
      "questionId": "q-101-abcd",
      "probeQuestion": {
        "id": "q-101-probe-1",
        "sessionId": "ses-9812-abcd-45ef",
        "questionIndex": 1,
        "questionText": "What specific metrics or load testing did you perform to verify that the composite indexes solved the problem, and what was the final response time?",
        "competency": "Validation & Impact Quantification",
        "isProbe": true,
        "parentQuestionId": "q-101-abcd"
      }
    }
  }
  ```

---

### Response Variant B: Turn Completed with Instant Feedback & Next Question

Returned when evaluation is completed in Instant Feedback mode and further questions remain.

- **Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "type": "TURN_EVALUATION",
      "questionId": "q-101-abcd",
      "feedback": {
        "id": "fb-001",
        "responseId": "resp-001",
        "starSituationScore": 4,
        "starSituationNotes": "Context of 3-second database lookup lag is well established.",
        "starTaskScore": 4,
        "starTaskNotes": "Clear responsibility for improving backend throughput.",
        "starActionScore": 5,
        "starActionNotes": "Excellent explanation of parallel promises and composite indexing.",
        "starResultScore": 4,
        "starResultNotes": "Demonstrated resolution; could cite exact percentage throughput gain.",
        "impactScore": 4,
        "clarityScore": 5,
        "powerVerbsUsed": ["Diagnosed", "Restructured", "Indexed"],
        "strengths": [
          "Demonstrates direct command of asynchronous Node.js patterns and database performance.",
          "Clear structure following Situation, Task, and Action."
        ],
        "improvements": [
          "Always state the specific before-and-after numbers (e.g. 2.8s down to 320ms)."
        ],
        "modelAnswer": "During our capstone flight reservation system testing, search queries peaked at 2.8 seconds due to sequential table scans. As backend lead, I profiled the query bottlenecks, implemented composite B-Tree indexes on departure date and destination IDs, and refactored API handlers with parallel promise execution. This slashed query latency by 85% to under 400ms under simulated 500-user concurrency."
      },
      "sessionProgress": {
        "currentQuestionIndex": 2,
        "totalQuestions": 5,
        "isComplete": false
      },
      "nextQuestion": {
        "id": "q-102-efgh",
        "sessionId": "ses-9812-abcd-45ef",
        "questionIndex": 2,
        "questionText": "Can you describe a situation where you had a disagreement with a teammate regarding a technical decision? How did you resolve it?",
        "competency": "Team Collaboration & Conflict Resolution",
        "contextReference": null,
        "isProbe": false
      }
    }
  }
  ```

---

### Response Variant C: Session Finished (Final Question Submitted)

Returned when the last scheduled question of the session has been answered.

- **Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "type": "SESSION_COMPLETED",
      "questionId": "q-105-ijkl",
      "sessionProgress": {
        "currentQuestionIndex": 5,
        "totalQuestions": 5,
        "isComplete": true
      },
      "scorecardUrl": "/api/interviews/sessions/ses-9812-abcd-45ef/scorecard"
    }
  }
  ```

---

## 2. Error Handling

- **`400 Bad Request`**: `EMPTY_RESPONSE` - Submitted answer text is empty or fewer than 5 characters.
- **`409 Conflict`**: `QUESTION_ALREADY_ANSWERED` - Answer already submitted for this specific question ID.
- **`404 Not Found`**: `QUESTION_NOT_FOUND` - Question ID does not match active session.
- **`503 Service Unavailable`**: `AI_EVALUATION_FAILED` - Transient failure communicating with Gemini. Student answer is safely persisted to database; client can retry without re-typing.
