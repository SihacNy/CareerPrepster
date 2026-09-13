# Tasks: 002-backend-api (Express + MySQL + Prisma + Google Gemini)

**Feature**: Production Express Backend API  
**Target Scope**: Full-Stack Backend Service (Express 4.x + MySQL 8.0 + Prisma ORM 5.x + Google Gemini 2.5 Flash + pdf-parse/mammoth + Frontend Integration)  
**Input**: Feature specification from `specs/002-backend-api/spec.md`, Implementation Plan from `specs/002-backend-api/plan.md`, Data Model from `specs/002-backend-api/data-model.md`, Contracts from `specs/002-backend-api/contracts/`

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User Story ID (`US1` to `US7`)

---

## Phase 1: Setup & Scaffolding (Infrastructure)

**Purpose**: Initialize root Docker orchestration, backend workspace, TypeScript configuration, and server health check.

- [x] T001 Create root `docker-compose.yml` orchestrating `mysql:8.0` (with persistent volume), `backend` (Node.js 20), and `frontend` (Next.js 14) services
- [x] T002 Initialize `backend/` workspace with `package.json` installing core dependencies (`express`, `cors`, `helmet`, `cookie-parser`, `morgan`, `dotenv`, `zod`, `bcryptjs`, `jsonwebtoken`, `@prisma/client`, `@google/genai`, `pdf-parse`, `mammoth`, `multer`) and dev dependencies (`typescript`, `tsx`, `prisma`, `@types/*`)
- [x] T003 [P] Configure TypeScript compiler in `backend/tsconfig.json` with strict type checking, ES2022 target, and NodeNext module resolution
- [x] T004 [P] Create multi-stage `backend/Dockerfile` with development and production build stages
- [x] T005 Create validated environment configuration loader using Zod in `backend/src/config/env.ts`
- [x] T006 Create Express server entrypoint in `backend/src/index.ts` with CORS, Helmet, Cookie Parser, JSON body parser, request logging, and `GET /api/health` endpoint

**Checkpoint**: `docker compose up -d` boots services; `curl http://localhost:5000/api/health` returns `{ "status": "healthy" }`.

---

## Phase 2: Foundational Data Layer (Prisma & Database Seed)

**Purpose**: Database schema, relations, migrations, singleton client, and pre-seeded job role catalog.

- [x] T007 Define complete Prisma database schema in `backend/prisma/schema.prisma` with `User`, `CV`, `CVSection`, `CVItem`, `BulletPoint`, `SkillGroup`, `ATSReport`, `JobRole`, and `RoleBulletTemplate` models
- [x] T008 Run initial Prisma migration `npx prisma migrate dev --name init` to generate MySQL tables, indices, and foreign keys
- [x] T009 Create singleton Prisma client instance in `backend/src/config/prisma.ts` with query logging in development mode
- [x] T010 Author seed script in `backend/prisma/seed.ts` populating 15+ graduate job roles (Frontend, Backend, Fullstack, Mobile, DevOps, QA, Data Analyst, ML Engineer, UI/UX, PM, Cybersecurity, IT Systems) and 50+ pre-curated STAR/XYZ starter bullet templates

**Checkpoint**: `npx prisma db seed` successfully seeds 15+ roles and 50+ bullets into MySQL.

---

## Phase 3: Core Middlewares & Shared Validation Schemas

**Purpose**: Shared Zod schemas, generic validation middleware, JWT authentication guard, and centralized error handler.

- [x] T011 [P] Create shared TypeScript Zod schemas in `backend/src/schemas/`: `auth.schema.ts`, `cv.schema.ts`, `job-role.schema.ts`, `ai.schema.ts`, `ats.schema.ts`, and `import.schema.ts`
- [x] T012 Implement generic Zod request body/query validation middleware in `backend/src/middlewares/validate.ts`
- [x] T013 Implement JWT authentication guard middleware in `backend/src/middlewares/requireAuth.ts` extracting token from `HttpOnly` cookies and attaching `req.user`
- [x] T014 Implement centralized error boundary middleware in `backend/src/middlewares/errorHandler.ts` supporting standard JSON error envelopes (`UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, etc.)

**Checkpoint**: Middleware tests pass; malformed JSON or missing tokens return structured error envelopes.

---

## Phase 4: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Students can register, log in, view their profile, and log out with secure `HttpOnly` JWT session cookies.

**Independent Test**: Register a new user via `POST /api/auth/register`, verify `Set-Cookie` header is present, call `GET /api/auth/me` with cookie to verify identity, then call `POST /api/auth/logout`.

- [x] T015 [US1] Implement `auth.service.ts` in `backend/src/services/auth.service.ts` with `bcryptjs` password hashing (salt rounds = 10), JWT token signing, and credential verification
- [x] T016 [US1] Implement `auth.controller.ts` in `backend/src/controllers/auth.controller.ts` for `register`, `login`, `getMe`, and `logout` handlers
- [x] T017 [US1] Implement and mount `auth.routes.ts` in `backend/src/routes/auth.routes.ts` wiring `validate(registerSchema)`, `validate(loginSchema)`, and `requireAuth` to handlers

**Checkpoint**: User Story 1 fully functional. Authentication flow verified via `curl` with cookies.

---

## Phase 5: User Story 2 - CV CRUD & Atomic Tree Storage (Priority: P1) 🎯 MVP

**Goal**: Authenticated students can create, read, update, and delete CV documents with atomic Prisma transaction synchronization.

**Independent Test**: Create a CV via `POST /api/cvs`, verify default sections are generated, fetch nested tree via `GET /api/cvs/:id`, perform deep update via `PUT /api/cvs/:id`, and delete via `DELETE /api/cvs/:id`.

- [x] T018 [US2] Implement `cv.service.ts` in `backend/src/services/cv.service.ts` with:
  - `listUserCvs(userId)`
  - `createCv(userId, data)` initializing default sections (`EDUCATION`, `EXPERIENCE`, `PROJECTS`, `SKILLS`)
  - `getCvById(cvId, userId)` returning full nested relational tree
  - `updateCv(cvId, userId, data)` executing atomic Prisma `$transaction` (upserting sections, items, bullets, skill groups)
  - `deleteCv(cvId, userId)` cascade-deleting CV tree
- [x] T019 [US2] Implement `cv.controller.ts` in `backend/src/controllers/cv.controller.ts` with ownership authorization checks (returns `403 Forbidden` if CV does not belong to user)
- [x] T020 [US2] Implement and mount `cv.routes.ts` in `backend/src/routes/cv.routes.ts` protected by `requireAuth`

**Checkpoint**: User Stories 1 & 2 fully operational. Deep CV updates persist atomically in MySQL.

---

## Phase 6: User Story 3 - Job Role Catalog & Starter Bullet Library (Priority: P2)

**Goal**: Students can search curated job roles and browse pre-authored STAR/XYZ starter bullets with sub-50ms latency.

**Independent Test**: Search `GET /api/job-roles?q=front` to retrieve "Frontend Developer", then call `GET /api/job-roles/:id/bullets?category=Architecture` to retrieve filtered starter bullets.

- [x] T021 [P] [US3] Implement `job-role.service.ts` in `backend/src/services/job-role.service.ts` with indexed `LIKE` query on title/industry and category-filtered bullet retrieval
- [x] T022 [P] [US3] Implement `job-role.controller.ts` in `backend/src/controllers/job-role.controller.ts`
- [x] T023 [US3] Implement and mount `job-role.routes.ts` in `backend/src/routes/job-role.routes.ts` (public cached endpoints)

**Checkpoint**: Job catalog endpoints return seeded roles and bullets in < 50ms.

---

## Phase 7: User Story 4 - Stateless AI Bullet Enhancement (Priority: P2)

**Goal**: Students send raw bullet text and receive 2-3 professionally rewritten STAR/XYZ achievement suggestions via Google Gemini.

**Independent Test**: Send `POST /api/ai/enhance-bullet` with raw bullet string; verify response contains structured suggestions with `actionVerb`, `accomplishedX`, `measuredY`, `byDoingZ`, and `explanation`.

- [x] T024 [US4] Implement `ai.service.ts` in `backend/src/services/ai.service.ts` integrating Google Gemini 2.5 Flash SDK (`@google/genai`) with:
  - `ats_architect` system persona prompt
  - Strict JSON `responseSchema` matching suggestion contract
  - Exponential backoff retry loop (1s, 2s, 4s; max 3 retries) with 10s timeout
  - Pure stateless execution (zero conversation memory in RAM)
- [x] T025 [US4] Implement `ai.controller.ts` in `backend/src/controllers/ai.controller.ts` handling `enhanceBullet` requests
- [x] T026 [US4] Implement and mount `ai.routes.ts` in `backend/src/routes/ai.routes.ts` protected by `requireAuth` and `validate(enhanceBulletSchema)`

**Checkpoint**: AI enhancement endpoint produces valid STAR/XYZ suggestions within 2.5 seconds.

---

## Phase 8: User Story 5 - Deterministic 4-Pillar ATS Scoring Engine (Priority: P3)

**Goal**: Evaluate CVs with 100% reproducible scoring across Parsability (25), Impact (30), Skills (25), and Brevity (20), plus optional Job Description keyword matching and MySQL audit persistence.

**Independent Test**: Call `POST /api/ats/score` with `cvId`; verify overall score and pillar breakdown match static rule computations; running twice yields identical scores.

- [x] T027 [US5] Implement `ats.service.ts` in `backend/src/services/ats.service.ts` containing:
  - Parsability evaluator (standard section headers, contact completeness, single-column layout)
  - Impact evaluator (250+ power verb dictionary lookup, regex metric/percentage scanner)
  - Skills evaluator (categorization check, 8-25 count hygiene)
  - Brevity evaluator (450-700 total words, 12-28 words/bullet)
  - JD Keyword Matcher (stop-word filtered keyword intersection & match percentage)
  - MySQL `ATSReport` record creation for historical tracking
- [x] T028 [US5] Implement `ats.controller.ts` in `backend/src/controllers/ats.controller.ts`
- [x] T029 [US5] Implement and mount `ats.routes.ts` in `backend/src/routes/ats.routes.ts` protected by `requireAuth` and `validate(scoreCvSchema)`

**Checkpoint**: ATS scoring runs in < 10ms with 100% deterministic reproducibility.

---

## Phase 9: User Story 6 - Resume Import: In-Process Parsing & AI Structuring (Priority: P3)

**Goal**: Upload existing PDF/DOCX resumes, extract raw text in RAM using `pdf-parse`/`mammoth`, and intelligently structure sections via Google Gemini.

**Independent Test**: Upload sample PDF to `POST /api/cvs/import` via multipart/form-data; verify extracted text is parsed into structured personal info, education, experience, and skills JSON. Upload scanned PDF with < 30 chars; verify `422 Scanned PDF` is returned.

- [x] T030 [US6] Implement `parser.service.ts` in `backend/src/services/parser.service.ts` with:
  - In-memory `pdf-parse` extraction for PDF buffers
  - In-memory `mammoth` text extraction for DOCX buffers
  - Scanned PDF detection threshold (< 30 extractable text characters throws `422 SCANNED_PDF_NO_TEXT`)
  - Google Gemini semantic layout prompt with structured JSON `responseSchema` for resume field mapping
- [x] T031 [US6] Implement `import.controller.ts` in `backend/src/controllers/import.controller.ts` with Multer memory storage (5MB file limit, `.pdf` and `.docx` MIME filter)
- [x] T032 [US6] Implement and mount `import.routes.ts` in `backend/src/routes/import.routes.ts` (supports `POST /api/cvs/import`)

**Checkpoint**: Digital PDF and DOCX uploads extract and structure in < 3.5s; scanned PDFs safely rejected.

---

## Phase 10: User Story 7 - Frontend Full Integration & Mock Elimination (Priority: P1)

**Goal**: Connect Next.js frontend to real Express backend API, replace all client mock data, enable real authentication session cookies, and remove temporary API routes.

**Independent Test**: Open browser at `http://localhost:3000`, register an account, create a CV, search job roles, click "Refine with AI", upload an existing resume, and review live ATS scoring against real MySQL backend.

- [x] T033 [US7] Update `frontend/src/lib/api.ts` with real `fetch` wrapper calling `http://localhost:5000/api` with `credentials: "include"` for HttpOnly cookie propagation
- [x] T034 [US7] Wire `AuthModal.tsx` and auth state in `frontend/src/lib/store.tsx` to `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`
- [x] T035 [US7] Wire `CVForm.tsx` and autosave/manual save in `frontend/src/app/editor/page.tsx` to `POST /api/cvs`, `GET /api/cvs/:id`, and `PUT /api/cvs/:id`
- [x] T036 [US7] Wire `RoleAutocomplete.tsx` and `TemplateBulletDrawer.tsx` to `GET /api/job-roles` and `GET /api/job-roles/:id/bullets`
- [x] T037 [US7] Wire `AIEnhanceModal.tsx` in `frontend/src/components/editor/AIEnhanceModal.tsx` to `POST /api/ai/enhance-bullet`
- [x] T038 [US7] Wire `UploadDropzone.tsx` in `frontend/src/components/onboarding/UploadDropzone.tsx` to `POST /api/cvs/import` and update fallback in `frontend/src/lib/cvParser.ts`
- [x] T039 [US7] Wire `ATSScoringStage.tsx` in `frontend/src/app/editor/ats/page.tsx` to `POST /api/ats/score`

**Checkpoint**: Frontend is 100% connected to Express backend; zero mock data remaining.

---

## Phase 11: Polish & Cross-Cutting Verification

**Purpose**: End-to-end integration validation, error handling verification, and container smoke testing.

- [x] T040 Root `docker-compose.yml` verified for MySQL 8.0, Express backend, and Next.js frontend
- [x] T041 Automated `quickstart.md` curl test script verified across all 6 API groups
- [x] T042 Frontend UI responsiveness, error states, and HttpOnly session cookies verified

---

## Dependencies & Execution Order

```text
Phase 1: Setup & Scaffolding (T001 - T006) ✅
   │
   ▼
Phase 2: Database Layer & Seed (T007 - T010) ✅
   │
   ▼
Phase 3: Middlewares & Shared Schemas (T011 - T014) ✅
   │
   ├───────────────────┬───────────────────┬───────────────────┬───────────────────┐
   ▼                   ▼                   ▼                   ▼                   ▼
Phase 4: Auth API   Phase 5: CV CRUD    Phase 6: Job Roles  Phase 7: AI Assist  Phase 8: ATS Engine  Phase 9: Import API
(T015 - T017) ✅    (T018 - T020) ✅    (T021 - T023) ✅    (T024 - T026) ✅    (T027 - T029) ✅     (T030 - T032) ✅
   │                   │                   │                   │                   │                    │
   └───────────────────┴───────────────────┴─────────┬─────────┴───────────────────┴────────────────────┘
                                                     │
                                                     ▼
                                        Phase 10: Frontend Integration (T033 - T039) ✅
                                                     │
                                                     ▼
                                        Phase 11: Smoke Test & Polish (T040 - T042) ✅
```
