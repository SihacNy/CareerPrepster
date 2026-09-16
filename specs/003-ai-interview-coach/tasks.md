# Tasks: Module 3 - AI Interview Coach & Mock Drill Simulation

**Feature**: AI Interview Coach & Mock Drill Simulation  
**Target Scope**: Full-Stack (Next.js 14 App Router + Tailwind CSS frontend, Express + Prisma/MySQL backend, Google Gemini 1.5 Flash for AI drills)  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/](./contracts/)

---

## Phase 1: Setup (Shared Infrastructure & Types)

**Purpose**: Database schema extensions, ORM migration, environment configuration, and shared type contracts.

- [x] T001 Define relational schema for `InterviewSession`, `InterviewQuestion`, `InterviewResponse`, `TurnFeedback`, `InterviewScorecard`, and related enums in `backend/prisma/schema.prisma`
- [x] T002 Execute Prisma database sync and client generation via `npx prisma db push && npx prisma generate` in `backend/`
- [x] T003 [P] Create Zod schemas and TypeScript interfaces for session creation, turn response submission, STAR feedback, and scorecards in `backend/src/schemas/interview.schema.ts`
- [x] T004 [P] Create frontend TypeScript types matching backend contracts in `frontend/src/types/interview.ts`
- [x] T005 [P] Verify `GEMINI_API_KEY` configuration and rate-limit guardrails in `backend/src/config/env.ts`

---

## Phase 2: Foundational (Backend Routing & Core Service Primitives)

**Purpose**: Core backend service layer, Gemini prompt orchestrator, PII sanitizer, and API routing foundation that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Implement PII sanitizer function to strip candidate full name, phone number, address, and email from CV payloads in `backend/src/services/interview-ai.service.ts`
- [x] T007 Implement Gemini structured JSON prompt runner with `responseSchema` validation in `backend/src/services/interview-ai.service.ts`
- [x] T008 Implement base interview session database queries and state machine transitions in `backend/src/services/interview.service.ts`
- [x] T009 Implement interview controller handlers and HTTP error mappings in `backend/src/controllers/interview.controller.ts`
- [x] T010 Setup interview routes with `requireAuth` authentication middleware and Zod body validation in `backend/src/routes/interview.routes.ts`
- [x] T011 Mount interview router at `/api/interviews` in `backend/src/index.ts`
- [x] T012 [P] Implement client API service methods for interview sessions, turns, and scorecards in `frontend/src/lib/api.ts`

**Checkpoint**: Foundation ready. API routes mounted, database tables active, and Gemini service layer initialized.

---

## Phase 3: User Story 1 - Contextual Session Setup & CV Ingestion (Priority: P1) 🎯 MVP

**Goal**: Students can launch a practice interview session by selecting a saved CV (or inputting a target role and job description), choosing track, length, and mode, and receiving their first tailored interview question.

**Independent Test**: Send `POST /api/interviews/sessions` with `cvId`, verify session is created in MySQL with status `IN_PROGRESS`, and confirm Question 1 references a specific project or achievement from the CV within 4 seconds.

- [x] T013 [US1] Implement contextual CV extraction and fallback role prompt builder in `backend/src/services/interview-ai.service.ts`
- [x] T014 [US1] Implement session initialization and initial question generation in `backend/src/services/interview.service.ts`
- [x] T015 [US1] Implement `POST /api/interviews/sessions` and `GET /api/interviews/sessions/:id` handlers in `backend/src/controllers/interview.controller.ts`
- [x] T016 [P] [US1] Build session configuration modal with CV picker, target role input, track selector, length, and mode in `frontend/src/components/interview/SessionSetupModal.tsx`
- [x] T017 [US1] Build the main interview hub landing page with "Start New Drill" action in `frontend/src/app/interview/page.tsx`
- [x] T018 [US1] Wire session creation flow in `frontend/src/app/interview/page.tsx` to launch setup modal, call `api.createInterviewSession`, and route to `/interview/[id]`

**Checkpoint**: User Story 1 complete. Students can configure drills, ingest CV context, and initialize sessions with personalized first questions.

---

## Phase 4: User Story 2 - Interactive Conversational Drill & Adaptive Probing (Priority: P1) 🎯 MVP

**Goal**: Turn-by-turn interview simulation supporting text and speech-to-text dictation, elapsed pacing timer, and intelligent follow-up probing when answers lack concrete metrics or actions.

**Independent Test**: Start a session, submit a vague answer without tools or numbers, and verify that the system generates a follow-up probing question (`isProbe: true`) before advancing to the next scheduled question.

- [x] T019 [US2] Implement adaptive probing decision logic (STAR completeness detection, 1-probe maximum per question) in `backend/src/services/interview-ai.service.ts`
- [x] T020 [US2] Implement response persistence and probe question creation in `backend/src/services/interview.service.ts`
- [x] T021 [P] [US2] Create Web Speech API hook with real-time speech-to-text streaming and keyboard fallback in `frontend/src/hooks/useSpeechRecognition.ts`
- [x] T022 [P] [US2] Build question display card with competency badge, context tag, and follow-up probe indicator in `frontend/src/components/interview/QuestionCard.tsx`
- [x] T023 [US2] Build dual-mode input component with textarea, microphone toggle, word count, and pacing timer in `frontend/src/components/interview/AnswerInputArea.tsx`
- [x] T024 [US2] Build the active interview room page with state hydration, auto-save, and pause/resume handling in `frontend/src/app/interview/[id]/page.tsx`
- [x] T025 [US2] Wire answer submission in `frontend/src/app/interview/[id]/page.tsx` to handle adaptive probe prompts dynamically without losing context

**Checkpoint**: User Story 2 complete. Students can speak or type answers, manage pacing, and respond to adaptive probing questions.

---

## Phase 5: User Story 3 - Turn-by-Turn STAR Rubric Feedback & Model Answers (Priority: P1) 🎯 MVP

**Goal**: In Instant Feedback mode, candidates receive immediate rubric-based evaluations of Situation, Task, Action, and Result components, power action verbs, and an exemplary model answer.

**Independent Test**: Submit an answer in Instant Feedback mode, verify that `TurnFeedback` is returned with ratings (1–5) across all 4 STAR pillars, identified strengths/improvements, and a high-impact model answer, followed by a smooth transition to Question 2.

- [x] T026 [US3] Implement Gemini STAR rubric evaluation and model answer prompt pipeline in `backend/src/services/interview-ai.service.ts`
- [x] T027 [US3] Implement turn feedback persistence and progress pointer update in `backend/src/services/interview.service.ts`
- [x] T028 [US3] Implement `POST /api/interviews/sessions/:id/responses` handler supporting `TURN_EVALUATION` and `SESSION_COMPLETED` payloads in `backend/src/controllers/interview.controller.ts`
- [x] T029 [P] [US3] Build interactive turn feedback card with STAR component meters, power verbs, strengths, and expandable model answer in `frontend/src/components/interview/TurnFeedbackCard.tsx`
- [x] T030 [US3] Integrate `TurnFeedbackCard` into `frontend/src/app/interview/[id]/page.tsx` with "Next Question →" transition controls

**Checkpoint**: User Story 3 complete. Immediate STAR critique and model answers teach candidates how to restructure responses in real time.

---

## Phase 6: User Story 4 - Post-Interview Scorecard & CV Recommendations (Priority: P2)

**Goal**: Comprehensive final evaluation displaying an overall readiness rating (0–100), dimensional competency breakdown, and cross-referenced recommendations to upgrade specific bullet points on the student's CV.

**Independent Test**: Complete the final question of a session, navigate to `/interview/[id]/scorecard`, and verify that the composite score, 4 sub-scores (STAR, Technical, Communication, Impact), and actionable CV bullet update suggestions are rendered within 5 seconds.

- [x] T031 [US4] Implement end-of-session synthesis pipeline in `backend/src/services/interview-ai.service.ts` comparing interview transcripts against CV bullet points
- [x] T032 [US4] Implement scorecard generation, tier classification, and database persistence in `backend/src/services/interview.service.ts`
- [x] T033 [US4] Implement `GET /api/interviews/sessions/:id/scorecard` handler in `backend/src/controllers/interview.controller.ts`
- [x] T034 [P] [US4] Build scorecard summary component with overall readiness tier and dimensional competency bars in `frontend/src/components/interview/ScorecardSummary.tsx`
- [x] T035 [P] [US4] Build CV recommendations card showing linked CV bullets and suggested STAR additions in `frontend/src/components/interview/CVRecommendationsCard.tsx`
- [x] T036 [P] [US4] Build question-by-question review accordion displaying student responses, scores, and model answers in `frontend/src/components/interview/QuestionReviewAccordion.tsx`
- [x] T037 [US4] Build final scorecard page assembling summary, CV advice, and question reviews in `frontend/src/app/interview/[id]/scorecard/page.tsx`

**Checkpoint**: User Story 4 complete. Students receive actionable debriefs that directly bridge interview practice back into CV improvements.

---

## Phase 7: User Story 5 - Interview Session History & Progress Tracking (Priority: P3)

**Goal**: Students can review historical practice drills, track performance trends over time, re-examine past feedback, and retake drills with fresh questions.

**Independent Test**: Complete multiple sessions, open the interview history table, verify past scores and tracks are listed with timestamps, click a past session to inspect its read-only scorecard, and click "Retake Drill" to start a new session with identical configuration.

- [x] T038 [US5] Implement paginated history query with score statistics in `backend/src/services/interview.service.ts`
- [x] T039 [US5] Implement `GET /api/interviews/sessions` history endpoint handler in `backend/src/controllers/interview.controller.ts`
- [x] T040 [P] [US5] Build session history table with track badges, readiness tiers, and action buttons in `frontend/src/components/interview/SessionHistoryTable.tsx`
- [x] T041 [US5] Integrate history table, score progress indicators, and "Retake Drill" action into `frontend/src/app/interview/page.tsx`

**Checkpoint**: User Story 5 complete. Full longitudinal practice tracking and drill retakes operational.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: App navigation integration, error handling, edge cases, PII audit, and end-to-end verification.

- [x] T042 Add "Interview Coach" navigation link with active route indicator in `frontend/src/components/navigation/Header.tsx`
- [x] T043 Implement edge case guardrails for empty/single-word inputs ("idk", "pass") and microphone permission denials in `frontend/src/app/interview/[id]/page.tsx`
- [x] T044 Conduct PII sanitization audit verifying zero student phone/email/address data leaks into LLM payloads or server logs
- [x] T045 [P] Create end-to-end automated API verification script in `backend/src/scripts/test-interview-flow.ts`
- [x] T046 Run full quickstart validation scenarios according to `specs/003-ai-interview-coach/quickstart.md`


---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**.
- **User Stories (Phase 3 through Phase 7)**:
  - **User Story 1 (P1 - Phase 3)**: Depends on Phase 2. Delivers session setup & CV ingestion.
  - **User Story 2 (P1 - Phase 4)**: Depends on US1 (requires active session and question 1).
  - **User Story 3 (P1 - Phase 5)**: Integrates with US2 (delivers turn evaluation for submitted answers).
  - **User Story 4 (P2 - Phase 6)**: Depends on US2 & US3 (requires completed session to synthesize scorecard).
  - **User Story 5 (P3 - Phase 7)**: Depends on US1 & US4 (displays historical completed sessions).
- **Polish (Phase 8)**: Runs after all desired user stories are functional.

```text
Phase 1: Setup
     │
     ▼
Phase 2: Foundational
     │
     ▼
Phase 3: US1 (Session Setup & CV Ingestion)
     │
     ▼
Phase 4: US2 (Interactive Drill & Probing)
     │
     ▼
Phase 5: US3 (Turn STAR Feedback & Model Answers)  ◄── MVP Checkpoint (US1 + US2 + US3)
     │
     ▼
Phase 6: US4 (Scorecard & CV Recommendations)
     │
     ▼
Phase 7: US5 (History & Progress Tracking)
     │
     ▼
Phase 8: Polish & Cross-Cutting Concerns
```

---

## Parallel Opportunities

### Within Phase 1 (Setup)
- `T003` (backend Zod schemas), `T004` (frontend types), and `T005` (env check) can run concurrently after `T001`/`T002`.

### Within Phase 2 (Foundational)
- `T006` (PII sanitizer) and `T012` (frontend API client) can run in parallel while service queries (`T008`) and controllers (`T009`) are constructed.

### Within User Story 1
- `T016` (SessionSetupModal UI) can be developed in parallel with `T013`/`T014`/`T015` (backend session endpoints).

### Within User Story 2
- `T021` (useSpeechRecognition hook), `T022` (QuestionCard UI), and `T023` (AnswerInputArea UI) can be built in parallel with backend probing logic (`T019`/`T020`).

### Within User Story 4
- `T034` (ScorecardSummary), `T035` (CVRecommendationsCard), and `T036` (QuestionReviewAccordion) can be developed in parallel before assembling `T037`.

---

## Implementation Strategy

### MVP Scope (Phases 1, 2, 3, 4, and 5)
1. Complete **Phase 1** (Prisma schema sync, Zod schemas, TypeScript types).
2. Complete **Phase 2** (Service primitives, routes, Gemini structured outputs).
3. Complete **Phase 3** (User Story 1: Setup drill from CV or target role).
4. Complete **Phase 4** (User Story 2: Answer questions via text/voice, adaptive probing).
5. Complete **Phase 5** (User Story 3: Turn-by-turn STAR feedback and model answers).
6. **VALIDATE MVP**: A student can start a drill, answer questions, receive instant STAR feedback, and complete the simulation.

### Incremental Delivery Beyond MVP
- **Increment 2**: Add **Phase 6** (User Story 4) for post-interview scorecards and CV recommendations.
- **Increment 3**: Add **Phase 7** (User Story 5) for longitudinal history and drill retakes.
- **Increment 4**: Add **Phase 8** (Navigation integration, PII audit, and validation script).
