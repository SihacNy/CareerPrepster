---
description: "Task list for fixing backend/frontend integration, database seeding, and dual persistence (guest localStorage vs authenticated MySQL)"
---

# Tasks: 001-cv-editor (Full-Stack Integration & Dual Persistence)

**Feature**: CV Editor, Resume Import & Universal ATS Scoring — Full-Stack Integration Fix & Dual Persistence
**Target Scope**: Backend (Express/Prisma/MySQL) + Frontend (Next.js 14)
**Context**: Existing tasks.md marked backend integration as complete, but the database is empty and the integration is broken. Guest users must save to localStorage only; authenticated users must save to MySQL.

---

## Phase 1: Setup (Database & Environment Readiness)

**Purpose**: Restore database connectivity, apply migrations, and seed the required job role catalog and starter bullet library so the backend has real data to serve.

- [x] T001 Verify MySQL container is healthy and reachable from the backend container via `docker compose ps` and `docker compose exec backend mysql -h mysql -u root -p -e "SHOW DATABASES"`
- [x] T002 Apply the Prisma schema to the MySQL database using `docker compose exec backend npx prisma db push` (or `npx prisma migrate dev --name init_cv_editor` if migrations are enabled)
- [x] T003 Run `docker compose exec backend npx prisma db seed` to populate `job_roles` and `role_bullet_templates` tables
- [x] T004 Verify seed data exists by querying `docker compose exec backend npx prisma studio` or running a direct MySQL query against `job_roles` and `role_bullet_templates`
- [x] T005 [P] Confirm backend environment variables (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`) are loaded from `backend/.env` inside the container
- [x] T006 [P] Confirm frontend environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) are loaded from `frontend/.env.local`

**Checkpoint**: MySQL database is populated, backend can connect, and seed data is visible.

---

## Phase 2: Foundational (Backend Integration Infrastructure)

**Purpose**: Establish the shared foundation required before any user story can be reliably tested end-to-end.

- [x] T007 [P] Create a shared Zod schema package or synchronize `backend/src/schemas/` with `frontend/src/types/cv.ts` so client and server contracts match exactly
- [x] T008 [P] Implement a reusable session/auth status resolver in `frontend/src/lib/auth.tsx` that checks `/api/auth/me` and falls back to guest mode on 401
- [x] T009 [P] Implement a dual-persistence storage abstraction in `frontend/src/lib/store.tsx` with separate `localStorage` and `MySQL` save paths
- [x] T010 [P] Implement a unified save dispatcher in `frontend/src/lib/store.tsx` that routes guest saves to `localStorage` and authenticated saves to `POST /api/cvs` or `PUT /api/cvs/:id`
- [x] T011 [P] Implement a unified load dispatcher in `frontend/src/lib/store.tsx` that reads from MySQL when authenticated and falls back to `localStorage` when guest
- [x] T012 [P] Implement a unified delete dispatcher in `frontend/src/lib/historyStore.ts` that deletes from MySQL when authenticated and from `localStorage` when guest
- [x] T013 [P] Implement a unified list dispatcher in `frontend/src/lib/historyStore.ts` that fetches from `GET /api/cvs` when authenticated and from `localStorage` when guest
- [x] T014 [P] Add a persistent auth-state watcher in `frontend/src/lib/auth.tsx` that switches the save target when the user signs in or out
- [x] T015 [P] Add clear UI feedback in `frontend/src/components/editor/ContinueActionBar.tsx` showing whether the draft is saved locally or in the cloud

**Checkpoint**: Dual persistence layer is operational and can route saves/loads/updates/deletes based on authentication state.

---

## Phase 3: User Story 1 - Onboarding Entry Fork & Existing CV Import (Priority: P1) 🎯 MVP

**Goal**: Students can start fresh with "Create from Scratch" or upload an existing PDF/DOCX to get an instant ATS diagnostic report, with drafts saved to the correct persistence layer.

**Independent Test**:
1. Open onboarding modal, click "Create from Scratch" -> successfully route to `/editor` with a blank template saved to localStorage.
2. Open onboarding modal, drop a resume file -> system parses the file and transitions to `/editor/ats?from=upload` showing the baseline score, with the imported draft saved to localStorage.
3. Sign in with Google -> the same draft is available from MySQL after reload.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Refactor `frontend/src/components/onboarding/UploadDropzone.tsx` to send files to `POST /api/cvs/import` via `importApi.uploadFile()` and handle guest fallback gracefully
- [ ] T017 [US1] Refactor `frontend/src/components/onboarding/OnboardingModal.tsx` to preserve the imported CV in localStorage for guests and in MySQL for authenticated users
- [ ] T018 [US1] Refactor `frontend/src/lib/cvParser.ts` to normalize parsed data into the shared `CVData` structure used by both guest and authenticated flows
- [ ] T019 [US1] Refactor `frontend/src/app/page.tsx` to route "Create from Scratch" to `/editor` and "Upload Existing Resume" to `/editor/ats?from=upload` while preserving draft state
- [ ] T020 [US1] Add baseline ATS diagnostic computation from imported CV content and route seamlessly to `/editor/ats?from=upload` or `/editor`

**Checkpoint**: Onboarding works for both guest and authenticated users with correct persistence routing.

---

## Phase 4: User Story 2 - Template Selection & Structured CV Content Authoring (Priority: P1) 🎯 MVP

**Goal**: Dual-pane editor with structured inputs and real-time live preview, where guest drafts save to localStorage and authenticated drafts save to MySQL.

**Independent Test**:
1. Type into personal info or education fields on the left -> right-pane preview updates in under 100ms.
2. Select a template via the dedicated `TemplateSelector` card picker (Classic ATS vs Modern Compact) -> card highlights with active badge and right-pane preview switches layout cleanly with zero data loss.
3. Save as a guest -> draft persists in localStorage after reload.
4. Sign in -> the same draft is saved to MySQL and survives across sessions.

### Implementation for User Story 2

- [ ] T021 [P] [US2] Refactor `frontend/src/components/preview/templates/ClassicAts.tsx` to consume the generic `sections` and `skillGroups` structure
- [ ] T022 [P] [US2] Refactor `frontend/src/components/preview/templates/ModernCompact.tsx` to consume the generic `sections` and `skillGroups` structure
- [ ] T023 [US2] Refactor `frontend/src/components/preview/LivePreview.tsx` to render from the unified store regardless of persistence target
- [ ] T024 [P] [US2] Refactor `frontend/src/components/editor/sections/PersonalSection.tsx` to consume the nested `personalInfo` structure
- [ ] T025 [P] [US2] Refactor `frontend/src/components/editor/sections/EducationSection.tsx` to consume generic `sectionType: "EDUCATION"` items
- [ ] T026 [P] [US2] Refactor `frontend/src/components/editor/sections/ExperienceSection.tsx` to consume generic `sectionType: "EXPERIENCE"` items
- [ ] T027 [P] [US2] Refactor `frontend/src/components/editor/sections/ProjectsSection.tsx` to consume generic `sectionType: "PROJECTS"` items
- [x] T028 [P] [US2] Refactor `frontend/src/components/editor/sections/SkillsSection.tsx` to consume `skillGroups` and fix the fallback bug where empty groups revert to `cvData.skills`
- [x] T028a [P] [US2] Implement interactive tag/chip skill editor in `frontend/src/components/editor/sections/SkillsSection.tsx` with dedicated remove (`×`) buttons for individual skills and backspace-to-delete
- [x] T028b [P] [US2] Fix comma and space input handling in `frontend/src/components/editor/sections/SkillsSection.tsx` allowing smooth typing of commas, spaces, and multi-word skills without premature trimming or state reset
- [x] T028c [P] [US2] Synchronize `skillGroups` and legacy `skills` in `frontend/src/lib/store.tsx` during `updateSkillGroups` to ensure complete removal persists across storage
- [ ] T029 [US2] Refactor `frontend/src/components/editor/CVForm.tsx` to assemble generic sections and support adding custom sections
- [x] T029a [P] [US2] Create `TemplateDefinition` interface and `TEMPLATE_CATALOG` metadata in `frontend/src/types/templates.ts`
- [x] T029b [P] [US2] Create dedicated `TemplateSelector` component with interactive cards, typography indicators, and store integration in `frontend/src/components/editor/TemplateSelector.tsx`
- [x] T029c [US2] Integrate `TemplateSelector` into `frontend/src/components/editor/CVForm.tsx` and add template navigation anchor to jump dropdown
- [x] T029d [US2] Synchronize `frontend/src/components/preview/LivePreview.tsx` template switcher with `TemplateSelector` state in `frontend/src/lib/store.tsx`
- [x] T029e [P] [US2] Create dedicated Template Gallery page in `frontend/src/app/editor/templates/page.tsx` retaining Stage 1 status with live filtering and fullscreen modal preview
- [ ] T030 [P] [US2] Refactor `frontend/src/components/editor/MobileViewToggle.tsx` to preserve state across form/preview switches
- [ ] T031 [US2] Refactor `frontend/src/components/editor/ContinueActionBar.tsx` to trigger the correct save path (localStorage for guests, MySQL for authenticated users)
- [ ] T032 [US2] Refactor `frontend/src/app/editor/page.tsx` to hydrate from localStorage for guests and from `GET /api/cvs/:id` for authenticated users
- [ ] T033 [US2] Refactor `frontend/src/lib/store.tsx` to autosave to localStorage for guests and to MySQL for authenticated users with conflict-safe merging

**Checkpoint**: Core CV Authoring editor is fully functional with real-time preview, dedicated template picker, mobile responsiveness, and correct dual persistence.

---

## Phase 5: User Story 3 - Job Role Autocomplete & Role-Specific Template Bullet Library (Priority: P2)

**Goal**: Students can search for a target career role and browse/import pre-curated bullet points, with the role catalog served from the seeded MySQL database.

**Independent Test**:
1. Type "Frontend" in the target role input -> dropdown shows matching roles from the database.
2. Open bullet library drawer -> click "Add to CV" on a starter bullet -> bullet inserts into the active section and renders in the preview.
3. Verify role suggestions and starter bullets come from MySQL, not mock data.

### Implementation for User Story 3

- [ ] T034 [P] [US3] Refactor `frontend/src/components/editor/RoleAutocomplete.tsx` to query `GET /api/job-roles` via `jobRoleApi.search()` and display loading/error states
- [ ] T035 [US3] Refactor `frontend/src/components/editor/TemplateBulletDrawer.tsx` to fetch starter bullets via `GET /api/job-roles/:id/bullets` and display category groupings
- [ ] T036 [US3] Refactor `frontend/src/components/editor/CVForm.tsx` to insert imported starter bullets into the active generic section item
- [ ] T037 [US3] Add debounced search with request cancellation to `frontend/src/components/editor/RoleAutocomplete.tsx` to avoid stale responses
- [ ] T038 [US3] Add empty-state and error-state handling in `frontend/src/components/editor/TemplateBulletDrawer.tsx` when the database catalog is unavailable

**Checkpoint**: Role search and starter bullet drawer are fully backed by the seeded MySQL catalog.

---

## Phase 6: User Story 4 - AI-Assisted Bullet Point Personalization & Wording Enhancement (Priority: P2)

**Goal**: Provide in-line AI assistance to rewrite bullet points into STAR/XYZ achievements, with the Gemini service reachable through the backend.

**Independent Test**:
1. Click "Enhance with AI" on a bullet point -> `AIEnhanceModal.tsx` opens with the draft bullet text.
2. Review 2-3 suggested variations -> accept one -> bullet replaces the original in the form and preview.
3. Verify the AI response comes from `POST /api/ai/enhance-bullet` and not from mock data.

### Implementation for User Story 4

- [ ] T039 [P] [US4] Refactor `frontend/src/components/editor/BulletInput.tsx` to trigger the real AI enhancement flow
- [ ] T040 [US4] Refactor `frontend/src/components/editor/AIEnhanceModal.tsx` to call `POST /api/ai/enhance-bullet` via `aiApi.enhanceBullet()` and display loading/error/retry states
- [ ] T041 [US4] Refactor `frontend/src/lib/mockAI.ts` to remove mock generation and rely exclusively on the backend Gemini service
- [ ] T042 [US4] Add structured error handling in `frontend/src/components/editor/AIEnhanceModal.tsx` for invalid input, network failures, and Gemini service disruptions
- [ ] T043 [US4] Verify the backend `backend/src/services/ai.service.ts` returns 2-3 structured STAR/XYZ suggestions with power verbs and metric slots

**Checkpoint**: AI wording assistance is fully connected to the live Gemini backend service.

---

## Phase 7: User Story 5 - Universal ATS Compatibility Scoring & Explainable Feedback (Priority: P3)

**Goal**: Dedicated ATS scoring stage evaluating the CV across 4 pillars with actionable findings and optional job description matching.

**Independent Test**:
1. Click "Continue to ATS Review" -> navigates to `/editor/ats` and loads the score.
2. Overall score (0-100) and 4 pillar cards display with clean flat badges.
3. Paste a job description -> keyword match percentage and missing skills update instantly.
4. Verify the score comes from `POST /api/ats/score` and not from mock data.

### Implementation for User Story 5

- [ ] T044 [P] [US5] Refactor `frontend/src/components/ats/ScoreGauge.tsx` to display the live score from `POST /api/ats/score`
- [ ] T045 [P] [US5] Refactor `frontend/src/components/ats/PillarBreakdown.tsx` to display live pillar scores from the backend response
- [ ] T046 [P] [US5] Refactor `frontend/src/components/ats/JobDescriptionInput.tsx` to submit the target job description to the backend and display live keyword matching
- [ ] T047 [US5] Refactor `frontend/src/components/ats/ActionableFindingsList.tsx` to render live findings from the backend response
- [ ] T048 [US5] Refactor `frontend/src/components/ats/StageActions.tsx` to navigate between editor, ATS review, and export stages with correct persistence state
- [ ] T049 [US5] Refactor `frontend/src/components/ats/ATSScoringStage.tsx` to call `POST /api/ats/score` via `atsApi.score()` and display loading/error states
- [ ] T050 [US5] Refactor `frontend/src/app/editor/ats/page.tsx` to load the CV from localStorage for guests or from MySQL for authenticated users before scoring
- [ ] T051 [US5] Verify the backend `backend/src/services/ats.service.ts` returns the 4-pillar breakdown and categorized findings in the expected contract shape

**Checkpoint**: Dedicated ATS review stage is fully operational for both guest and authenticated users with live backend scoring.

---

## Phase 8: User Story 6 - 1-Click Social Sign-In (Google OAuth) (Priority: P3)

**Goal**: Students can sign in with Google, and their local draft is promoted to MySQL upon authentication.

**Independent Test**:
1. Click "Sign in with Google" -> OAuth completes and session is established.
2. After sign-in, the current localStorage draft is automatically saved to MySQL.
3. After sign-out, the cloud session is cleared and the user continues with localStorage.

### Implementation for User Story 6

- [ ] T052 [P] [US6] Refactor `frontend/src/components/auth/AuthModal.tsx` to complete the Google OAuth token exchange via `POST /api/auth/google`
- [ ] T053 [US6] Refactor `frontend/src/lib/auth.tsx` to manage the authenticated session, persist user profile, and trigger draft promotion to MySQL on sign-in
- [ ] T054 [US6] Refactor `frontend/src/components/navigation/Header.tsx` to display the authenticated user profile and sign-out action from `/api/auth/me`
- [ ] T055 [US6] Refactor `frontend/src/lib/store.tsx` to migrate the guest localStorage draft to MySQL immediately after successful authentication
- [ ] T056 [US6] Refactor `frontend/src/lib/historyStore.ts` to switch from local history to cloud history after sign-in
- [ ] T057 [US6] Add a sign-out handler in `frontend/src/lib/auth.tsx` that clears the session cookie and falls back to localStorage persistence

**Checkpoint**: Google OAuth is fully functional and seamlessly promotes guest drafts to MySQL.

---

## Phase 9: User Story 7 - High-Fidelity ATS-Compliant PDF Export & Cloud Save (Priority: P4)

**Goal**: Export the finalized CV as a selectable-text PDF, and save completed versions to MySQL for authenticated users.

**Independent Test**:
1. Click "Download ATS PDF" -> browser downloads a clean `.pdf` file with selectable text.
2. Open the PDF -> verify text is selectable and layout matches the chosen template.
3. Click "Save CV" as an authenticated user -> the document is committed to MySQL with visual confirmation.

### Implementation for User Story 7

- [ ] T058 [P] [US7] Refactor `frontend/src/lib/pdf/ClassicPdfDocument.tsx` to render from the unified `CVData` structure
- [ ] T059 [P] [US7] Refactor `frontend/src/lib/pdf/ModernPdfDocument.tsx` to render from the unified `CVData` structure
- [ ] T060 [US7] Refactor `frontend/src/components/export/ExportPdfButton.tsx` to generate the PDF from the current store state
- [ ] T061 [US7] Refactor `frontend/src/components/export/ExportStage.tsx` to show the correct save status (local vs cloud)
- [ ] T062 [US7] Refactor `frontend/src/components/export/DraftViewModal.tsx` to render the full draft sheet with zoom and print support
- [ ] T063 [US7] Refactor `frontend/src/app/editor/export/page.tsx` to load the CV from the correct persistence layer before export
- [ ] T064 [US7] Refactor `frontend/src/components/editor/ContinueActionBar.tsx` to commit the complete CV to MySQL via `POST /api/cvs` or `PUT /api/cvs/:id` when authenticated

**Checkpoint**: PDF export works for both guest and authenticated users, and authenticated saves are committed to MySQL.

---

## Phase 10: User Story 8 - User Resume & Audit History Dashboard (Priority: P3)

**Goal**: Dedicated History dashboard showing saved drafts, ATS scores, and export snapshots, sourced from MySQL for authenticated users and localStorage for guests.

**Independent Test**:
1. Navigate to `/history` -> view saved drafts with role titles, timestamps, and ATS score badges.
2. Click "Edit" -> restores the snapshot into the editor.
3. Click "Duplicate" -> creates a copy.
4. Click "Delete" -> removes the entry from the correct persistence layer.
5. As a guest, history shows only localStorage drafts.

### Implementation for User Story 8

- [ ] T065 [P] [US8] Refactor `frontend/src/lib/historyStore.ts` to manage both localStorage and MySQL-backed history with a unified interface
- [ ] T066 [P] [US8] Refactor `frontend/src/components/history/HistoryCard.tsx` to display the correct source indicator (local vs cloud)
- [ ] T067 [US8] Refactor `frontend/src/app/history/page.tsx` to fetch from `GET /api/cvs` when authenticated and from localStorage when guest
- [ ] T068 [US8] Refactor `frontend/src/components/history/HistoryCard.tsx` to route "Edit", "Audit", "Duplicate", and "Delete" actions through the unified dispatcher
- [ ] T069 [US8] Refactor `frontend/src/lib/store.tsx` to hydrate the editor from the selected history item
- [ ] T070 [US8] Add empty-state CTAs in `frontend/src/app/history/page.tsx` for both guest and authenticated users

**Checkpoint**: History dashboard works seamlessly for both guest and authenticated users with correct persistence routing.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final integration validation, cleanup, and verification across the full stack.

- [ ] T071 [P] Remove all remaining mock data and mock service references from `frontend/src/lib/mockData.ts`, `frontend/src/lib/mockAI.ts`, and component fallbacks
- [ ] T072 [P] Verify `docker compose config` returns code 0 and `docker compose up -d` starts all services
- [ ] T073 [P] Verify the backend API responds on `http://localhost:5000/api` and the frontend loads on `http://localhost:3000`
- [ ] T074 [P] Verify `GET /api/auth/me` returns 401 for guests and 200 with user data for authenticated users
- [ ] T075 [P] Verify `GET /api/cvs` returns only the authenticated user's CVs and is empty for guests
- [ ] T076 [P] Verify `GET /api/job-roles?q=front` returns seeded roles from MySQL
- [ ] T077 [P] Verify `POST /api/ai/enhance-bullet` returns structured Gemini suggestions
- [ ] T078 [P] Verify `POST /api/ats/score` returns the 4-pillar breakdown
- [ ] T079 [P] Verify guest save -> localStorage only, and authenticated save -> MySQL only
- [ ] T080 [P] Verify sign-in promotes the guest draft to MySQL without data loss
- [ ] T081 [P] Verify sign-out falls back to localStorage without losing the draft
- [ ] T082 [P] Run `npm run build` in `frontend` and `npm run build` in `backend` and fix all compile errors
- [ ] T083 [P] Run `npm run test:api` in `backend` against the live server and fix all smoke test failures
- [ ] T084 [P] Verify the end-to-end user journey: onboarding -> editor -> ATS review -> export for both guest and authenticated flows
- [ ] T085 [P] Update `specs/001-cv-editor/quickstart.md` to reflect the dual persistence behavior and correct database verification steps
- [ ] T086 [P] Update `specs/001-cv-editor/contracts/cv-api.md` to document the guest localStorage vs authenticated MySQL save behavior
- [ ] T087 [P] Update `specs/001-cv-editor/data-model.md` to clarify which entities are persisted in MySQL vs localStorage

**Checkpoint**: Full-stack integration is verified, database is populated, and dual persistence works end-to-end.

---

## Phase 12: User Story 9 - Multi-Archetype Templates, Color Customization & Photo Support (Priority: P2)

**Goal**: Expand the template catalog to support 3 distinct archetypes (Minimalist ATS, Modern Color Accent, Visual / Photo-Enabled) with customizable professional color palettes and profile headshot support, with full MySQL and local persistence.

**Independent Test**:
1. Backend: Call `POST /api/cvs` and `PUT /api/cvs/:id` with `photoUrl` (up to 10MB) and `accentColor` -> database persists and returns both fields.
2. Open `/editor/templates` -> filter by `Minimalist ATS`, `Color Accent`, and `Photo / Visual`.
3. Select `Executive Accent` -> pick an accent color from the 6 palette swatches -> live preview tints header rules and titles with the selected color.
4. Select `Modern Photo` -> upload a profile photo (verify files > 10MB are rejected with validation error, files <= 10MB are accepted) -> live preview displays headshot in header.
5. Export PDF -> downloaded document reflects the chosen template, accent color, and photo with 100% selectable vector text.

### Phase 12A: Backend & Shared Schema (Assignable to Backend Developer)

- [ ] T088 [P] [US9] Update `shared/src/schemas/cv.schema.ts` to add `photoUrl` (with strict <= 10MB image validation) to `personalInfoSchema`, `accentColor` to `cvDataSchema`, and update `createCvSchema` & `updateCvSchema` preprocessing
- [ ] T089 [P] [US9] Update `backend/prisma/schema.prisma` to add `photoUrl String? @db.MediumText` and `accentColor String? @default("#0284c7") @db.VarChar(30)` to `model CV`
- [ ] T090 [US9] Execute Prisma schema migration and client generation (`npx prisma db push && npx prisma generate`) in `backend/`
- [ ] T091 [US9] Update `backend/src/services/cv.service.ts` to persist `photoUrl` and `accentColor` in `createCv` and `updateCv`, and include them in `getCvById` queries and responses
- [ ] T092 [P] [US9] Update `backend/test-backend.mjs` smoke tests to verify creating, updating, and fetching CVs with `photoUrl` (including large base64 data URIs up to 10MB) and custom `accentColor`

### Phase 12B: Frontend UI, Templates & PDF Export (Assignable to Frontend Developer)

- [X] T093 [P] [US9] Update `frontend/src/types/cv.ts` to include `photoUrl` in `PersonalInfo` and `accentColor` in `CVData`
- [X] T094 [P] [US9] Update `frontend/src/types/templates.ts` to add `archetype` (`"minimalist"` | `"color-accent"` | `"visual-photo"`), `COLOR_PALETTES`, and catalog entries (`classic`, `modern`, `executive-accent`, `modern-photo`)
- [X] T095 [US9] Update `frontend/src/lib/store.tsx` to add `setAccentColor` action and persist `accentColor` and `personalInfo.photoUrl` across local draft and MySQL cloud sync
- [X] T096 [P] [US9] Implement `ExecutiveAccent.tsx` in `frontend/src/components/preview/templates/ExecutiveAccent.tsx` (modern single-column layout with dynamic accent color rules and styled headings)
- [X] T097 [P] [US9] Implement `ModernPhoto.tsx` in `frontend/src/components/preview/templates/ModernPhoto.tsx` (visual template with circular/rounded headshot thumbnail and dynamic accent styling)
- [X] T098 [US9] Update `frontend/src/components/preview/LivePreview.tsx` to dynamically render the active template component based on `cvData.templateId`
- [X] T099 [P] [US9] Implement `ExecutiveAccentPdfDocument.tsx` in `frontend/src/lib/pdf/ExecutiveAccentPdfDocument.tsx` for `@react-pdf/renderer` vector PDF generation with accent colors
- [X] T100 [P] [US9] Implement `ModernPhotoPdfDocument.tsx` in `frontend/src/lib/pdf/ModernPhotoPdfDocument.tsx` for `@react-pdf/renderer` vector PDF generation with headshot photo
- [X] T101 [US9] Update `frontend/src/components/export/ExportPdfButton.tsx` to dispatch PDF generation to the matching PDF document component
- [X] T102 [P] [US9] Update `frontend/src/components/editor/sections/PersonalSection.tsx` to add profile photo upload with strict <= 10MB image size validation (PNG, JPEG, WebP) and avatar preview
- [X] T103 [US9] Update `frontend/src/app/editor/templates/page.tsx` with archetype category filters (`All Styles`, `Minimalist ATS`, `Color Accent`, `Photo / Visual`) and 6-swatch color palette picker for color-enabled templates
- [X] T104 [P] [US9] Validate end-to-end template switching, color selection, <= 10MB photo upload validation, live preview, and vector PDF download across all 4 templates with zero content loss

**Checkpoint**: Multi-archetype templates, color customization, and photo support are fully functional in both live preview and PDF export, backed by persistent MySQL and shared schemas.

---

## Phase 13: User Story 10 - Full-Stack ATS Report Persistence & History Audit Integration (Priority: P2)

**Goal**: Persist computed 4-pillar ATS audit reports directly into MySQL (`ats_reports` table), surface the latest overall ATS score on CV cards in `/history`, and enable students to inspect, review, and reload past ATS audits directly from their history dashboard without losing audit findings.

**Independent Test**:
1. Run ATS audit on an authenticated CV via `/editor/ats` -> verify record is inserted into MySQL `ats_reports` table with `cvId`, `userId`, `overallScore`, and `findings`.
2. Navigate to `/history` -> verify the CV card displays the ATS score badge (e.g. `Score: 88/100` with high/medium/low tint).
3. Click "Audit" on the history card -> verify navigation to `/editor/ats?id=<cvId>` immediately renders the saved 4-pillar audit report, keyword matches, and remediation findings without requiring a forced re-scan.
4. Guest flow: audit scores persist in localStorage and sync smoothly to MySQL upon account sign-in.

### Phase 13A: Backend & Shared Schema (Assignable to Backend Developer)

- [ ] T105 [P] [US10] Update `backend/src/services/ats.service.ts` to persist `ATSReport` in MySQL (`prisma.aTSReport.create`) when scoring authenticated CVs with `cvId` and `userId`
- [ ] T106 [P] [US10] Update `backend/src/services/cv.service.ts` in `listUserCvs` to join latest `atsReports: { orderBy: { createdAt: 'desc' }, take: 1 }` and return mapped `atsScore: number | null`
- [ ] T107 [P] [US10] Update `backend/src/services/cv.service.ts` in `getCvById` to return mapped `latestAtsReport` alongside `atsScore` in the response payload
- [ ] T108 [P] [US10] Create endpoint `GET /api/ats/:cvId/latest` in `backend/src/controllers/ats.controller.ts` and `backend/src/routes/ats.routes.ts` to fetch the most recent audit report for a given CV
- [ ] T109 [P] [US10] Update `shared/src/types/cv.types.ts` and `shared/src/types/ats.types.ts` to add `atsScore?: number | null` and `latestAtsReport?: ATSReportData | null` to shared schema definitions

### Phase 13B: Frontend API, Editor & History Integration (Assignable to Frontend Developer)

- [ ] T110 [P] [US10] Update `frontend/src/lib/api.ts` to add `atsScore?: number | null` to `CVListItem`, pass `cvId` in `atsApi.score`, and add `atsApi.getLatestReport(cvId)` method
- [ ] T111 [US10] Update `frontend/src/lib/store.tsx` to synchronize `atsScore` in `CVData` state and persist it during local draft and MySQL cloud saves
- [ ] T112 [US10] Update `frontend/src/app/editor/ats/page.tsx` and `frontend/src/components/ats/ATSScoringStage.tsx` to load and display persisted `ATSReport` from MySQL when opening an existing CV ID
- [ ] T113 [P] [US10] Update `frontend/src/app/history/page.tsx` and `frontend/src/lib/historyStore.ts` to map `atsScore` from `cvApi.list()` and supply it to history cards
- [ ] T114 [US10] Update `frontend/src/components/history/HistoryCard.tsx` to render dynamic ATS score badges (`Score: XX/100`) and ensure the "Audit" button routes directly to `/editor/ats?id=<cvId>`
- [ ] T115 [P] [US10] End-to-end verification of ATS audit flow: score CV -> check MySQL persistence -> check History badge -> inspect loaded audit report in `/editor/ats`

**Checkpoint**: ATS audit reports are fully persisted in MySQL, displayed on history cards, and restorable on-demand.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Must be completed first — the database must be populated before any API can be tested.
- **Foundational (Phase 2)**: Depends on Setup — dual persistence requires a working backend and database.
- **User Story 1 (Phase 3)**: Depends on Foundational — onboarding needs the persistence dispatcher.
- **User Story 2 (Phase 4)**: Depends on Foundational — the editor needs the persistence dispatcher.
- **User Story 3 (Phase 5)**: Depends on Setup — role autocomplete requires seeded database data.
- **User Story 4 (Phase 6)**: Depends on Setup — AI enhancement requires the backend Gemini service.
- **User Story 5 (Phase 7)**: Depends on Setup — ATS scoring requires the backend service.
- **User Story 6 (Phase 8)**: Depends on Foundational — sign-in triggers draft promotion to MySQL.
- **User Story 7 (Phase 9)**: Depends on Foundational — cloud save requires the persistence dispatcher.
- **User Story 8 (Phase 10)**: Depends on Foundational — history requires the persistence dispatcher.
- **Polish (Phase 11)**: Depends on all foundational stories being complete.
- **User Story 9 (Phase 12)**: Depends on User Story 2 (Phase 4) and Export pipeline (T028c/T029b).
- **User Story 10 (Phase 13)**: Depends on User Story 5 (Phase 7), User Story 8 (Phase 10), and User Story 7 (Phase 9) for MySQL `cvId` linkage. Phase 13A (Backend) and Phase 13B (Frontend) can proceed in parallel once shared schema (T109) is aligned.

### User Story Dependencies
- **User Story 1 (P1)**: Depends on Foundational — can start after Phase 2.
- **User Story 2 (P1)**: Depends on Foundational — can start after Phase 2.
- **User Story 3 (P2)**: Depends on Setup — can start after Phase 1.
- **User Story 4 (P2)**: Depends on Setup — can start after Phase 1.
- **User Story 5 (P3)**: Depends on Setup — can start after Phase 1.
- **User Story 6 (P3)**: Depends on Foundational — can start after Phase 2.
- **User Story 7 (P4)**: Depends on Foundational — can start after Phase 2.
- **User Story 8 (P3)**: Depends on Foundational — can start after Phase 2.
- **User Story 9 (P2)**: Depends on User Story 2 — builds on existing template catalog and PDF export.

### Within Each User Story
- Core implementation before integration
- Persistence routing before story completion
- Story complete before moving to the next priority

### Parallel Opportunities
- **Phase 1**: T005 and T006 can run in parallel.
- **Phase 2**: T007, T008, T009, T010, T011, T012, T013, T014, T015 can run in parallel (different files).
- **Phase 3**: T016, T017, T018, T019, T020 can run in parallel.
- **Phase 4**: T021, T022, T024, T025, T026, T027, T028, T028a, T028b, T028c, T029a, T029b, T029e, T030 can run in parallel.
- **Phase 5**: T034, T035, T036, T037, T038 can run in parallel.
- **Phase 6**: T039, T040, T041, T042, T043 can run in parallel.
- **Phase 7**: T044, T045, T046, T047, T048, T049, T050, T051 can run in parallel.
- **Phase 8**: T052, T053, T054, T055, T056, T057 can run in parallel.
- **Phase 9**: T058, T059, T060, T061, T062, T063, T064 can run in parallel.
- **Phase 10**: T065, T066, T067, T068, T069, T070 can run in parallel.
- **Phase 11**: T071, T072, T073, T074, T075, T076, T077, T078, T079, T080, T081, T082, T083, T084, T085, T086, T087 can run in parallel.
- **Phase 12A (Backend)**: T088, T089, T092 can run in parallel (different files).
- **Phase 12B (Frontend)**: T093, T094, T096, T097, T099, T100, T102, T104 can run in parallel (different files, independent components).
- **Phase 13A (Backend)**: T105, T106, T107, T108, T109 can run in parallel (independent service, query, and route files).
- **Phase 13B (Frontend)**: T110, T113, T115 can run in parallel (API, history list, and verification layers).

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch foundational tasks in parallel (different files, no dependencies):
Task: "Create a shared Zod schema package or synchronize backend/src/schemas/ with frontend/src/types/cv.ts"
Task: "Implement a reusable session/auth status resolver in frontend/src/lib/auth.tsx"
Task: "Implement a dual-persistence storage abstraction in frontend/src/lib/store.tsx"
Task: "Implement a unified save dispatcher in frontend/src/lib/store.tsx"
Task: "Implement a unified load dispatcher in frontend/src/lib/store.tsx"
Task: "Implement a unified delete dispatcher in frontend/src/lib/historyStore.ts"
Task: "Implement a unified list dispatcher in frontend/src/lib/historyStore.ts"
Task: "Add a persistent auth-state watcher in frontend/src/lib/auth.tsx"
Task: "Add clear UI feedback in frontend/src/components/editor/ContinueActionBar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (database migration + seed)
2. Complete Phase 2: Foundational (dual persistence dispatcher)
3. Complete Phase 3: User Story 1 (onboarding with correct persistence)
4. **STOP and VALIDATE**: Test guest save to localStorage and authenticated save to MySQL
5. Deploy/demo if ready

### Incremental Delivery
1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Add User Story 4 -> Test independently -> Deploy/Demo
6. Add User Story 5 -> Test independently -> Deploy/Demo
7. Add User Story 6 -> Test independently -> Deploy/Demo
8. Add User Story 7 -> Test independently -> Deploy/Demo
9. Add User Story 8 -> Test independently -> Deploy/Demo
10. Complete Polish phase -> Full-stack validation
11. Add User Story 9 -> Multi-archetype templates, color swatches & photo upload
12. Add User Story 10 -> Persist ATS reports in MySQL & display audit badges/reports in History

### Parallel Team Strategy
With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently
4. Multi-Archetype Templates & Photo (User Story 9):
   - **Backend Developer**: Assigned to **Phase 12A (T088–T092)** — Prisma schema migration (`photoUrl` MediumText & `accentColor`), `@careerprepster/shared` Zod schema validation (<= 10MB limit), `CvService` database persistence, and API smoke testing.
   - **Frontend Developer**: Assigned to **Phase 12B (T093–T104)** — Client state store, HTML live preview templates, PDF export generators, photo upload UI with <= 10MB validation, and template gallery swatches.
5. ATS Report Persistence & History Integration (User Story 10):
   - **Backend Developer**: Assigned to **Phase 13A (T105–T109)** — `ATSReport` creation in `ATSService`, joining latest report score in `listUserCvs` and `getCvById`, adding `GET /api/ats/:cvId/latest` route, and updating shared schema types.
   - **Frontend Developer**: Assigned to **Phase 13B (T110–T115)** — `atsApi.score` and `atsApi.getLatestReport` client endpoints, `store.tsx` score synchronization, `/editor/ats` report pre-loading, `/history` score badge rendering, and end-to-end audit inspection flow.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Guest users MUST save only to localStorage; authenticated users MUST save to MySQL
- Sign-in MUST promote the guest localStorage draft to MySQL without data loss
- Sign-out MUST fall back to localStorage without losing the draft
- All mock data and mock services must be removed
- Verify the database is populated before testing any API endpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
