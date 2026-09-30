# AI Interview Coach — Feature Report

**Project:** CareerPrepster  
**Feature Branch:** `module/cv-editor`  
**Last Updated:** 2026-09-23  
**Stack:** Next.js 14 (frontend) · Express + Prisma/MySQL (backend) · Google Gemini (AI)

---

## What This Feature Is

An AI-powered mock interview coach embedded inside CareerPrepster. It reads the candidate's saved CV, generates tailored behavioral and technical interview questions, evaluates each answer using the **STAR rubric** (Situation / Task / Action / Result), and produces a final performance scorecard with CV bullet point upgrade recommendations.

---

## System Architecture

```
User Browser (Next.js 14)
│
├── /interview                          ← Hub: history + new drill button
├── /interview/[id]                     ← Active interview room
└── /interview/[id]/scorecard           ← Final results + analysis
        │
        │  REST API  (credentials: include, HttpOnly JWT cookie)
        ▼
Express Backend (port 5000)
│
├── POST /api/interviews/sessions               ← Create session + Q1
├── GET  /api/interviews/sessions               ← List history
├── GET  /api/interviews/sessions/:id           ← Get full session
├── POST /api/interviews/sessions/:id/responses ← Submit answer
└── GET  /api/interviews/sessions/:id/scorecard ← Final scorecard
        │
        ├── InterviewService        (orchestration layer)
        ├── InterviewAIService      (Gemini calls + mock fallbacks)
        └── Prisma → MySQL          (persistence)
```

---

## Database Models (Prisma)

| Model | Purpose |
|---|---|
| `InterviewSession` | One drill session per attempt. Holds track, mode, length, status, score |
| `InterviewQuestion` | Each question in the session. Supports `isProbe` and `parentQuestionId` for adaptive follow-ups |
| `InterviewResponse` | Candidate's typed/spoken answer, word count, duration, input modality |
| `TurnFeedback` | STAR scores (1–5 each), impact/clarity scores, power verbs, strengths, improvements, model answer |
| `InterviewScorecard` | Synthesized final report: overall score (0–100), readiness tier, 4 dimensional sub-scores, CV recommendations |

---

## Backend — What Is Built

### Routes · `backend/src/routes/interview.routes.ts`

All 5 endpoints are wired, validated with Zod, and require `requireAuth` middleware.

### Zod Schemas · `backend/src/schemas/interview.schema.ts`

| Schema | Validates |
|---|---|
| `createInterviewSessionSchema` | Track, mode, length, cvId, targetRoleTitle, jobDescription |
| `submitAnswerSchema` | questionId, responseText (3–5000 chars), inputModality, durationSeconds |
| `turnFeedbackSchema` | Full STAR scores output shape |
| `interviewScorecardSchema` | Final scorecard output shape |
| `listSessionsQuerySchema` | Pagination + optional track filter |

### InterviewService · `backend/src/services/interview.service.ts`

| Method | Responsibility |
|---|---|
| `createSession()` | Ingests CV context via PII sanitizer, calls AI for Q1, creates session + question in a DB transaction |
| `getSessionById()` | Loads session with all questions, responses, feedback, and scorecard |
| `submitAnswer()` | Persists response → calls AI evaluator → saves feedback → optionally creates probe or next question → marks `COMPLETED` on final answer |
| `getOrGenerateScorecard()` | Returns cached scorecard or synthesizes a new one via Gemini |
| `listSessions()` | Paginated history with track filter |

**Session length → question count mapping:**
- `QUICK` = 3 questions
- `STANDARD` = 5 questions
- `FULL` = 8 questions

### InterviewAIService · `backend/src/services/interview-ai.service.ts`

Three Gemini-powered methods, all with full **mock fallbacks** (zero API key needed in dev):

#### `generateInitialQuestion()`
- Uses Gemini structured JSON output with `responseSchema`
- Anchors Q1 to CV projects or target role
- Mock: returns track-specific hardcoded question

#### `evaluateTurnOrProbe()`
- Single Gemini call that decides `PROBE` or `EVALUATION`
- **PROBE**: triggers when answer is vague/brief and no probe has been issued yet for this primary question
- **EVALUATION**: scores all 4 STAR dimensions (1–5), impact, clarity, extracts power verbs, writes 2 strengths + 2 improvements, generates a model answer, pre-generates the next question text
- Mock: evaluates by character length; returns fixed 4/5 scores

#### `synthesizeScorecard()`
- Aggregates all turns and CV bullets
- Produces: overall score (0–100), readiness tier, 4 sub-scores, key strengths, growth areas, CV bullet upgrade suggestions
- Readiness tiers: `"Interview Ready"` / `"Solid Foundation"` / `"Developing"` / `"Needs Practice"`
- Mock: returns score 85 with generic recommendations

#### `sanitizeCVContext()`
- Strips all PII (name, email, phone, address, URLs) before sending to Gemini
- Extracts: target role, professional summary, section items + bullet points, skill groups

> **Current AI config issue (needs fixing):**
> `backend/.env` has `GEMINI_API_KEY=YOUR_GCP_API_KEY_HERE` (placeholder) and `GEMINI_MODEL=gemini-3.6-flash` (non-existent model name). System currently runs entirely on mock fallbacks. Fix: set a real key and change model to `gemini-2.5-flash`.

---

## Frontend — What Is Built

### Pages

#### `/interview` — Hub Page
- Hero section with Start Practice Drill CTA
- Feature callout cards (Contextual Questions, Adaptive Probing, CV Feedback Loop)
- Session history table with past drills, scores, and retake button

#### `/interview/[id]` — Active Interview Room
- **Exam-style flow**: question → answer → immediately next question → scorecard at the end
- Dot progress indicator (● ● ○ ○ ○) + thin animated progress bar
- Smooth "Answer recorded / Loading…" transition overlay between questions
- Auto-redirect to scorecard on session completion
- Adaptive probe questions surface inline (no re-fetch needed)

#### `/interview/[id]/scorecard` — Results Page
- Loads scorecard + session in parallel
- Triggers scorecard generation if not yet cached
- Renders all 3 result components

### Components (8 total)

| Component | File | Purpose |
|---|---|---|
| `SessionSetupModal` | `SessionSetupModal.tsx` | Configure drill: CV selection, target role, job description paste, track, length, mode |
| `QuestionCard` | `QuestionCard.tsx` | Renders question with competency tag and probe indicator |
| `AnswerInputArea` | `AnswerInputArea.tsx` | Answer textarea + live **voice dictation** (Web Speech API), pacing timer, word count |
| `TurnFeedbackCard` | `TurnFeedbackCard.tsx` | STAR rubric card (built; now only used inside scorecard accordion) |
| `ScorecardSummary` | `ScorecardSummary.tsx` | Overall score badge, readiness tier, 4 competency bars, strengths/growth panels |
| `CVRecommendationsCard` | `CVRecommendationsCard.tsx` | CV bullet upgrade suggestions from scorecard |
| `QuestionReviewAccordion` | `QuestionReviewAccordion.tsx` | Per-question review: candidate answer, STAR scores grid, model answer |
| `SessionHistoryTable` | `SessionHistoryTable.tsx` | Past drills table with score, track, length, date, status badge |

### Type System · `frontend/src/types/interview.ts`

Full TypeScript coverage:
- Enums: `InterviewTrack`, `SessionLength`, `PracticeMode`, `SessionStatus`, `InputModality`
- Nested types: `TurnFeedbackData`, `InterviewResponseData`, `InterviewQuestionData`
- Top-level: `InterviewScorecardData`, `InterviewSessionData`
- Discriminated union: `SubmitAnswerResponse` → `PROBE | TURN_EVALUATION | SESSION_COMPLETED`

---

## Full User Journey (Current State)

```
1. /interview hub
   └── Click "Start Practice Drill"
       └── SessionSetupModal opens
           ├── Select CV (optional — auto-loads user's CVs)
           ├── Set target role title (required)
           ├── Paste job description (optional)
           ├── Choose track: Behavioral / Technical / Mixed
           ├── Choose length: Quick (3Q) / Standard (5Q) / Full (8Q)
           └── Click "Start Practice Drill"
               └── POST /api/interviews/sessions
                   ├── AI generates Q1 (or mock)
                   └── Redirect to /interview/[id]

2. /interview/[id] — Active Room
   ├── Question shown with competency tag
   ├── Candidate types or dictates via mic
   ├── Submit Answer → POST /api/interviews/sessions/:id/responses
   │   ├── AI evaluates with STAR rubric (saved to DB always)
   │   ├── [If vague + no prior probe] → PROBE: show follow-up inline
   │   ├── [Normal] → TURN_EVALUATION: auto-advance to next question
   │   └── [Final Q] → SESSION_COMPLETED: redirect to scorecard
   └── No feedback shown mid-session (exam-style)

3. /interview/[id]/scorecard
   ├── GET /api/interviews/sessions/:id/scorecard
   │   └── AI synthesizes scorecard from all turns (cached after first call)
   ├── ScorecardSummary — overall score, readiness tier, 4 bars, strengths/growth
   ├── CVRecommendationsCard — upgraded bullet point suggestions
   └── QuestionReviewAccordion — Q-by-Q with STAR scores + model answers
```

---

## What Is Pending / Not Yet Built

| # | Item | Priority |
|---|---|---|
| 1 | **Real Gemini API key** — set `GEMINI_API_KEY` and fix `GEMINI_MODEL=gemini-2.5-flash` in `backend/.env` | 🔴 Blocker for real AI |
| 2 | **Voice answer badge** — `inputModality: VOICE` stored but not shown distinctly in the accordion | 🟡 Polish |
| 3 | **Session abandonment** — no UI to mark `ABANDONED`; stale `IN_PROGRESS` sessions accumulate | 🟡 UX |
| 4 | **Retake pre-fill** — `handleRetake()` opens setup modal but doesn't pre-fill settings from the past session | 🟡 UX |
| 5 | **Export scorecard** — no PDF/print export for the results report | 🟢 Nice-to-have |
| 6 | **Score history chart** — hub shows history table but no trend chart of score progression | 🟢 Nice-to-have |
| 7 | **CV Editor auto-apply** — recommendations link to `/editor?cvId=...` but one-click bullet apply is not built | 🟢 Future |

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| AI mock fallbacks on every method | Zero-config dev mode; feature works end-to-end without a Gemini key |
| STAR scores saved per-turn even in Exam mode | All feedback always available for the scorecard accordion |
| PII sanitizer before Gemini calls | Privacy — never sends name/email/phone to external LLM |
| Discriminated union on `SubmitAnswerResponse` | Type-safe branching across 3 fundamentally different response shapes |
| Adaptive probe capped at 1 per primary question | Prevents infinite loops; enforced by `existingProbes.length === 0` |
| `db push` (no migrations) | Faster schema iteration during active WIP development |
