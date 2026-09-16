# Interview Session API Contract

**Base URL**: `/api/interviews/sessions`  
**Authentication**: Required (JWT cookie via `requireAuth` middleware)  
**Validation**: Zod Schemas (`shared/src/schemas/interview.schema.ts`)  

---

## 1. Create & Initialize Interview Session

Initializes a new practice drill, loads contextual CV or role data, generates the first tailored interview question via Google Gemini, and returns the session object.

- **Method**: `POST /api/interviews/sessions`
- **Headers**: `Content-Type: application/json`
- **Request Body (`CreateInterviewSessionSchema`)**:
  ```json
  {
    "cvId": "e1f9b3c4-72a5-4890-b1a3-488219ef8901",
    "targetRoleId": "jr-swe-001",
    "targetRoleTitle": "Junior Full-Stack Engineer",
    "jobDescription": "We are seeking a Junior Software Engineer with React, TypeScript, and Node.js experience to collaborate on our core web platform...",
    "track": "BEHAVIORAL",
    "sessionLength": "STANDARD",
    "mode": "INSTANT_FEEDBACK"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "id": "ses-9812-abcd-45ef",
        "userId": "usr-1234",
        "cvId": "e1f9b3c4-72a5-4890-b1a3-488219ef8901",
        "targetRoleTitle": "Junior Full-Stack Engineer",
        "track": "BEHAVIORAL",
        "sessionLength": "STANDARD",
        "mode": "INSTANT_FEEDBACK",
        "status": "IN_PROGRESS",
        "currentQuestionIndex": 1,
        "totalQuestions": 5,
        "startedAt": "2026-09-16T10:30:00.000Z",
        "firstQuestion": {
          "id": "q-101-abcd",
          "sessionId": "ses-9812-abcd-45ef",
          "questionIndex": 1,
          "questionText": "Tell me about a time when you encountered an unexpected bug or performance bottleneck in your TravelTech flight booking project. How did you diagnose it and what actions did you take?",
          "competency": "Technical Problem Solving & Composure",
          "contextReference": "Project: TravelTech Inc. Flight Booking App",
          "isProbe": false
        }
      }
    }
  }
  ```

---

## 2. Get Interview Session By ID

Fetches the complete state of an interview session, including current progress, all asked questions, candidate answers, and turn feedback.

- **Method**: `GET /api/interviews/sessions/:id`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "ses-9812-abcd-45ef",
      "targetRoleTitle": "Junior Full-Stack Engineer",
      "track": "BEHAVIORAL",
      "sessionLength": "STANDARD",
      "mode": "INSTANT_FEEDBACK",
      "status": "IN_PROGRESS",
      "currentQuestionIndex": 2,
      "totalQuestions": 5,
      "startedAt": "2026-09-16T10:30:00.000Z",
      "questions": [
        {
          "id": "q-101-abcd",
          "questionIndex": 1,
          "questionText": "Tell me about a time when you encountered an unexpected bug in your TravelTech project...",
          "competency": "Technical Problem Solving",
          "contextReference": "Project: TravelTech Inc. Flight Booking App",
          "isProbe": false,
          "responses": [
            {
              "id": "resp-001",
              "responseText": "In my capstone project, our flight query endpoint was taking almost 3 seconds to return. I noticed we were doing multiple sequential database lookups...",
              "inputModality": "TEXT",
              "durationSeconds": 68,
              "wordCount": 94,
              "feedback": {
                "id": "fb-001",
                "starSituationScore": 4,
                "starTaskScore": 4,
                "starActionScore": 5,
                "starResultScore": 4,
                "impactScore": 4,
                "clarityScore": 5,
                "powerVerbsUsed": ["Diagnosed", "Restructured", "Indexed"],
                "strengths": [
                  "Strong technical clarity when explaining the root cause of the query lag.",
                  "Clear individual agency highlighted by detailing personal profiling steps."
                ],
                "improvements": [
                  "Quantify the exact final latency achieved (e.g. from 3s down to 300ms)."
                ],
                "modelAnswer": "During the TravelTech flight booking rollout, users experienced 2.8s search latencies..."
              }
            }
          ]
        },
        {
          "id": "q-102-efgh",
          "questionIndex": 2,
          "questionText": "Can you describe a situation where you had a disagreement with a team member regarding an architectural decision?",
          "competency": "Team Collaboration & Conflict Resolution",
          "contextReference": null,
          "isProbe": false,
          "responses": []
        }
      ]
    }
  }
  ```

---

## 3. List Past Interview Sessions (History)

Fetches a paginated history of past sessions for the authenticated student.

- **Method**: `GET /api/interviews/sessions`
- **Query Params**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `track` (optional: `BEHAVIORAL`, `TECHNICAL`, `MIXED`)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "sessions": [
        {
          "id": "ses-9812-abcd-45ef",
          "targetRoleTitle": "Junior Full-Stack Engineer",
          "track": "BEHAVIORAL",
          "sessionLength": "STANDARD",
          "status": "COMPLETED",
          "overallScore": 84,
          "startedAt": "2026-09-16T10:30:00.000Z",
          "completedAt": "2026-09-16T10:52:15.000Z",
          "questionCount": 5
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
      }
    }
  }
  ```

---

## 4. Error Codes

- `400 Bad Request`: `INVALID_SESSION_PARAMS` - Missing role or invalid track/length enum.
- `401 Unauthorized`: `UNAUTHORIZED` - User session cookie missing or invalid.
- `404 Not Found`: `SESSION_NOT_FOUND` - Interview session ID does not exist or does not belong to the user.
- `503 Service Unavailable`: `AI_SERVICE_UNAVAILABLE` - Gemini API failure during initial question generation.
