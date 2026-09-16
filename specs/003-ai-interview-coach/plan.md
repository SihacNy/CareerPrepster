# Implementation Plan: Module 3 - AI Interview Coach & Mock Drill Simulation

**Branch**: `module/ai-interview-coach` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-ai-interview-coach/spec.md`

---

## Summary

Module 3 delivers an interactive, AI-powered mock interview practice platform for university students and early-career job seekers. The module operates as a decoupled, opt-in downstream extension (as mandated by Constitution Principle 3) that contextually ingests a student's validated CV (or target role and job description) to generate realistic behavioral and technical interview questions. 

The architecture features:
1. **Stateless Multi-Turn Conversational Simulation**: Multi-turn interview sessions backed by MySQL and Prisma, orchestrating dynamic questions, pacing timers, and adaptive probing follow-ups via Google Gemini 1.5 Flash.
2. **Standardized STAR Rubric Evaluation**: Instant turn-by-turn feedback analyzing Situation, Task, Action, and Result elements, accompanied by tailored high-impact model answers.
3. **Comprehensive End-of-Session Scorecard & CV Recommendations**: Holistic evaluation generating an overall readiness score (0–100), dimensional competency breakdown, and actionable suggestions to strengthen corresponding CV bullet points.
4. **Accessible Input Modalities**: Seamless dual input supporting client-side speech-to-text dictation (Web Speech API) and rich text keyboard editing.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS  
**Frontend Framework**: Next.js 14+ (App Router), React 18, Tailwind CSS  
**Backend Framework**: Node.js + Express.js (ESM / NodeNext)  
**Database & ORM**: MySQL 8.0, Prisma ORM 5.x (5 new relational tables)  
**Authentication & Security**: Strictly OAuth 2.0 (Google OAuth), JWT in `HttpOnly, Secure, SameSite=Lax` cookie via `requireAuth` middleware  
**Validation**: Zod 3.x (shared client & server contracts in `src/schemas/interview.schema.ts`)  
**AI Service Integration**: Google Gemini 1.5 Flash API with strict `responseSchema` JSON structured outputs  
**Audio & Dictation**: Client-side Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with seamless keyboard fallback  
**State Architecture**: Next.js App Router client components + React hooks (`useInterviewSession`, `useSpeechRecognition`) + backend RESTful API  
**Containerization**: Docker, Docker Compose (`docker-compose.yml`) with host port parity  
**Testing**: Unit tests (Jest), API integration tests (Supertest / Node test scripts)  
**Target Platform**: Linux containers (Alpine/Debian), Modern evergreen web browsers  
**Performance Goals**:
- Session creation & first question generation < 4.0s (p95)
- Turn response submission, adaptive probe / instant feedback < 3.5s (p95)
- Scorecard generation & CV recommendation synthesis < 5.0s (p95)
- History list query < 150ms
**Constraints**:
- Decoupled optional module: Must never block or gate core CV drafting or ATS optimization
- Zero conversational state lost upon browser refresh or network disconnect
- PII sanitization: Strip student phone numbers, email, and addresses prior to external LLM calls
- All external API payloads strictly validated with Zod

---

## Constitution Check

*GATE: All principles from [.specify/memory/constitution.md](file:///d:/CareerPrepster/.specify/memory/constitution.md) verified.*

| Principle | Compliance Assessment | Status |
| :--- | :--- | :---: |
| **Principle 1: Full-Stack Architecture & Separation of Concerns** | Implemented using Next.js 14 + Tailwind frontend, Express API routes/controllers/services, MySQL with Prisma ORM, and strict Zod validation schemas. | **PASS** |
| **Principle 2: Staged AI Workflow (CV Editor → ATS)** | Module 3 is positioned strictly downstream of the core CV-to-ATS pipeline. AI suggestions are non-destructive and preserve user agency. | **PASS** |
| **Principle 3: Modular Downstream Extensions (Interview Drills & Job Matching)** | Module 3 is designed as a fully decoupled, opt-in extension. It consumes validated CV data as contextual baseline without gating core CV features; provides conversational realism and rubric-based feedback. | **PASS** |
| **Principle 4: Student Privacy & Data Minimization** | PII fields (full name, phone, address, email) are sanitized from CV projections before being dispatched to Google Gemini. Session data is scoped to authenticated users. | **PASS** |
| **Principle 5: Containerization & Environment Parity (Docker-First)** | Runs fully within the existing root `docker-compose.yml` stack (frontend :3000, backend :5000, mysql :3307). Source volume mounts support hot-reloading. | **PASS** |

---

## Project Structure

### Documentation & Specifications (this feature)

```text
specs/003-ai-interview-coach/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical decisions & architectural rationale
├── data-model.md        # Relational schema extensions & TypeScript types
├── quickstart.md        # Runnable end-to-end validation guide
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── contracts/
    ├── session-api.md   # Session creation, fetch, and history contracts
    ├── turn-api.md      # Answer submission, adaptive probing, and STAR feedback
    └── scorecard-api.md # Scorecard generation and CV recommendations
```

### Source Code Layout

```text
backend/
├── prisma/
│   └── schema.prisma                         # Add InterviewSession, InterviewQuestion, InterviewResponse, TurnFeedback, InterviewScorecard
├── src/
│   ├── config/
│   │   └── env.ts                            # Validates GEMINI_API_KEY, DATABASE_URL, JWT_SECRET
│   ├── schemas/
│   │   └── interview.schema.ts               # Zod schemas for session setup, turn responses, feedback, scorecard
│   ├── services/
│   │   ├── interview.service.ts              # Session lifecycle, turn orchestration, state transitions, DB queries
│   │   └── interview-ai.service.ts           # Gemini prompt builder, PII sanitization, structured output parsing
│   ├── controllers/
│   │   └── interview.controller.ts           # HTTP handlers for /api/interviews/sessions, /responses, /scorecard
│   ├── routes/
│   │   └── interview.routes.ts               # Express router protected by requireAuth middleware
│   └── index.ts                              # Mount interview router at /api/interviews

frontend/
├── src/
│   ├── app/
│   │   └── interview/
│   │       ├── page.tsx                      # Interview Hub: Start New Drill modal, Track/Role selection, Session History list
│   │       ├── [id]/
│   │       │   ├── page.tsx                  # Active Interview Room: Question card, timer, speech/text input, turn feedback
│   │       │   └── scorecard/
│   │       │       └── page.tsx              # Final Scorecard: Overall score, dimensional radar/bars, CV bullet recommendations
│   ├── components/
│   │   └── interview/
│   │       ├── SessionSetupModal.tsx         # CV selector, role input, track picker, length and mode options
│   │       ├── QuestionCard.tsx              # Renders current question, competency badge, context tag, probe indicator
│   │       ├── AnswerInputArea.tsx           # Dual-mode input (rich textarea + SpeechRecognition mic toggle, pacing timer)
│   │       ├── TurnFeedbackCard.tsx          # STAR component breakdown, power verbs, strengths, model answer
│   │       ├── ScorecardSummary.tsx          # Overall readiness score, dimensional sub-scores, key strengths & growth areas
│   │       ├── CVRecommendationsCard.tsx     # Actionable bullet point rewrites linked to CV items
│   │       └── SessionHistoryTable.tsx       # Historical drills list, score badges, review and retake buttons
│   ├── hooks/
│   │   └── useSpeechRecognition.ts           # Web Speech API hook with live transcription and permission handling
│   └── lib/
│       └── api.ts                            # Client API methods for session CRUD, answer submission, scorecard fetch
```

---

## Complexity Tracking

No constitution violations detected. The architecture adheres strictly to Principles 1 through 5.
