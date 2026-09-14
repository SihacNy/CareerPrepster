# Tasks: 001-cv-editor (Frontend Standalone)

**Feature**: CV Authoring & ATS Optimization Stage  
**Target Scope**: Frontend Only (Next.js 14 + Tailwind CSS + Lucide Icons + Local Draft Storage & Mock Services; Backend Integration Deferred)  
**Design Tokens**: White & Light Sky Blue (`#0284C7` / `#38BDF8` / `#E0F2FE`), Kantumruy Pro & Plus Jakarta Sans, Zero Glow, Zero Emojis, Zero Rainbow AI Clichés.

---

## Phase 1: Setup (Frontend Project & Design System)

**Purpose**: Scaffolding the Next.js App Router project, design tokens, typography, and core client state foundation.

- [x] T001 Initialize Next.js 14 App Router project in `frontend/` with TypeScript and Tailwind CSS
- [x] T002 Configure Google Fonts (`Kantumruy Pro` and `Plus Jakarta Sans`) and root layout in `frontend/src/app/layout.tsx`
- [x] T003 Configure Tailwind CSS design tokens (White & Light Blue palette, no glow utilities, border standards) in `frontend/tailwind.config.ts`
- [x] T004 [P] Install UI dependencies (`lucide-react`, `clsx`, `tailwind-merge`, `zod`, `@react-pdf/renderer`) in `frontend/package.json`
- [x] T005 [P] Create shared TypeScript types and Zod schemas for CV, Sections, Bullets, Roles, and ATS reports in `frontend/src/types/cv.ts`
- [x] T006 Create client state store with `localStorage` draft autosave and hydration in `frontend/src/lib/store.tsx`
- [x] T007 [P] Create mock data generator for sample CVs, job roles, starter bullets, and ATS audits in `frontend/src/lib/mockData.ts`

---

## Phase 2: Foundational (Navigation & App Shell)

**Purpose**: Layout primitives, navigation header, and stepped workflow indicator.

- [x] T008 Implement top application header with logo, draft save indicator, and profile button in `frontend/src/components/navigation/Header.tsx`
- [x] T009 Implement multi-stage workflow stepper (`[1. Author CV] -> [2. ATS Review] -> [3. Export]`) in `frontend/src/components/navigation/EditorStepper.tsx`
- [x] T010 [P] Implement 1-click Google and GitHub authentication modal UI in `frontend/src/components/auth/AuthModal.tsx`
- [x] T011 Create landing / workspace entry page in `frontend/src/app/page.tsx`

**Checkpoint**: Shell ready. Stepper navigation and state store operational.

---

## Phase 3: User Story 1 - Two-Path Onboarding & Flow Selection (Priority: P1) 🎯 MVP

**Goal**: Students can start fresh with "Create from Scratch" or upload an existing PDF/DOCX to get an instant ATS diagnostic report.

**Independent Test**:
1. Open onboarding modal, click "Create from Scratch" -> successfully route to `/editor` with a blank template.
2. Open onboarding modal, drop a resume file -> system parses mock data and immediately transitions to `/editor/ats?from=upload` showing the baseline score.

- [x] T012 [P] [US1] Build drag-and-drop resume uploader with PDF/DOCX format validation in `frontend/src/components/onboarding/UploadDropzone.tsx`
- [x] T013 [US1] Build onboarding fork modal ("Create from Scratch" vs "Upload Existing Resume") in `frontend/src/components/onboarding/OnboardingModal.tsx`
- [x] T014 [US1] Wire onboarding state transitions to route to `/editor` (Scratch) or `/editor/ats?from=upload` (Upload Diagnostic) in `frontend/src/app/page.tsx`
- [x] T014a [P] [US1] Build client-side CV file parser and structural normalizer mapping extracted PDF/DOCX text to `CVData` in `frontend/src/lib/cvParser.ts`
- [x] T014b [US1] Integrate structural CV parser into `OnboardingModal.tsx` and `UploadDropzone.tsx` to populate full sections (`personalInfo`, `education`, `experience`, `projects`, `skills`)
- [x] T014c [US1] Compute baseline ATS diagnostic report from imported CV content and route seamlessly to `/editor/ats?from=upload` or `/editor`

**Checkpoint**: Two-path onboarding modal fully operational.

---

## Phase 4: User Story 2 - Structured CV Form & Live ATS Preview (Priority: P1) 🎯 MVP

**Goal**: Dual-pane editor with structured inputs (Personal Info, Education, Experience, Projects, Skills) and real-time live preview with responsive mobile view switcher.

**Independent Test**:
1. Type into personal info or education fields on the left -> right-pane preview updates in under 100ms.
2. Toggle between `ClassicAts` (Harvard style) and `ModernCompact` (Jake's style) -> layout refreshes cleanly with zero data loss.
3. Shrink screen to mobile (< 1024px) -> dual-pane collapses and `MobileViewToggle.tsx` switches seamlessly between Form and Preview.

- [x] T015 [P] [US2] Implement Harvard-style classic single-column ATS resume layout in `frontend/src/components/preview/templates/ClassicAts.tsx`
- [x] T016 [P] [US2] Implement Jake's Resume compact tech ATS layout in `frontend/src/components/preview/templates/ModernCompact.tsx`
- [x] T017 [US2] Build live preview container with template switcher in `frontend/src/components/preview/LivePreview.tsx`
- [x] T018 [P] [US2] Build Personal Info and Contact Details form section in `frontend/src/components/editor/sections/PersonalSection.tsx`
- [x] T019 [P] [US2] Build Education entries form section with GPA, degree, and date pickers in `frontend/src/components/editor/sections/EducationSection.tsx`
- [x] T020 [P] [US2] Build Work Experience entries form section in `frontend/src/components/editor/sections/ExperienceSection.tsx`
- [x] T021 [P] [US2] Build Project entries form section with tech stack tags in `frontend/src/components/editor/sections/ProjectsSection.tsx`
- [x] T022 [P] [US2] Build Categorized Technical Skills form section in `frontend/src/components/editor/sections/SkillsSection.tsx`
- [x] T023 [US2] Build composite CV editor form assembling all sections in `frontend/src/components/editor/CVForm.tsx`
- [x] T024 [P] [US2] Build mobile view switcher toggle (`[ Edit Form ]` vs `[ Live Preview ]`) and floating quick-switch pill in `frontend/src/components/editor/MobileViewToggle.tsx`
- [x] T025 [US2] Build sticky bottom action bar with `[Save Draft]` indicator and `[Continue to ATS Review →]` button in `frontend/src/components/editor/ContinueActionBar.tsx`
- [x] T026 [US2] Assemble Stage 1 dual-pane CV Editor page with responsive layout in `frontend/src/app/editor/page.tsx`

**Checkpoint**: Core CV Authoring editor fully functional with real-time live preview, template switching, and mobile responsiveness.

---

## Phase 5: User Story 3 - Role Autocomplete & Starter Bullet Library (Priority: P2)

**Goal**: Students can search for a target career role and browse/import pre-curated, high-impact bullet points into their experience or projects.

**Independent Test**:
1. Type "Frontend" in the target role input -> dropdown shows matching roles (e.g. "Frontend Developer").
2. Open bullet library drawer -> click "Add to CV" on a starter bullet -> bullet inserts immediately into active project/experience section and renders live in preview.

- [x] T027 [P] [US3] Build role search input with debounced autocomplete dropdown in `frontend/src/components/editor/RoleAutocomplete.tsx`
- [x] T028 [US3] Build slide-over drawer to browse pre-authored role bullet templates with category filters in `frontend/src/components/editor/TemplateBulletDrawer.tsx`
- [x] T029 [US3] Connect bullet insertion action to active section store in `frontend/src/components/editor/CVForm.tsx`

**Checkpoint**: Role search and starter bullet drawer integrated into editor.

---

## Phase 6: User Story 4 - In-Line AI STAR/XYZ Wording Assistant (Priority: P2)

**Goal**: Provide students with in-line AI assistance to rewrite weak bullet points into high-impact STAR/XYZ achievements without flashy AI clichés.

**Independent Test**:
1. Hover or focus on a bullet point -> click the dedicated **"Refine with AI"** button -> `AIEnhanceModal.tsx` opens with the draft bullet text.
2. Select an enhancement option (Action-Oriented, Quantified Metrics, STAR framework) -> review side-by-side diff -> click "Apply to CV" -> bullet replaces original in form and preview.

- [x] T030 [P] [US4] Build bullet point input row with explicit **"Refine with AI"** button (vector `<PenLine />` + light blue badge) in `frontend/src/components/editor/BulletInput.tsx`
- [x] T031 [US4] Build clean editorial AI wording review modal with side-by-side diff and STAR/XYZ options in `frontend/src/components/editor/AIEnhanceModal.tsx`
- [x] T032 [US4] Wire mock AI generation pipeline with simulated delay and structured suggestions in `frontend/src/lib/mockAI.ts`

**Checkpoint**: Dedicated "Refine with AI" button and STAR/XYZ wording assistance operational.

---

## Phase 7: User Story 5 - Dedicated ATS Scoring Review Stage (Priority: P3)

**Goal**: Dedicated Stage 2 screen evaluating the CV across 4 universal ATS pillars with actionable findings and optional Job Description keyword matcher.

**Independent Test**:
1. From `/editor`, click "Continue to ATS Review" -> navigates to `/editor/ats`.
2. Overall score (0-100) and 4 pillar cards (Parsability, Impact, Skills, Brevity) display with clean flat badges.
3. Paste a job description -> keyword match percentage and missing skills update instantly.
4. Click "Fix in Editor" on an issue -> navigates back to `/editor` focused on the offending section.
5. In Flow B (Upload), page loads with "Improve in Editor →" primary button that transitions into `/editor`.

- [x] T033 [P] [US5] Build 0-100 animated score ring with health tier color coding (Emerald, Amber, Rose) in `frontend/src/components/ats/ScoreGauge.tsx`
- [x] T034 [P] [US5] Build 4-pillar cards (Parsability 25, Impact 30, Skills 25, Brevity 20) with sub-scores in `frontend/src/components/ats/PillarBreakdown.tsx`
- [x] T035 [P] [US5] Build target Job Description textarea with keyword match percentage and missing chips in `frontend/src/components/ats/JobDescriptionInput.tsx`
- [x] T036 [US5] Build categorized findings list (Critical Issues, Suggestions, Passed Checks) with "Fix in Editor" deep-links in `frontend/src/components/ats/ActionableFindingsList.tsx`
- [x] T037 [US5] Build Stage 2 footer navigation (`[← Back to Editor]`, `[Improve in Editor →]`, `[Download ATS PDF →]`) in `frontend/src/components/ats/StageActions.tsx`
- [x] T038 [US5] Assemble dedicated ATS review screen layout in `frontend/src/components/ats/ATSScoringStage.tsx`
- [x] T039 [US5] Create Stage 2 ATS review route in `frontend/src/app/editor/ats/page.tsx`

**Checkpoint**: Dedicated Stage 2 ATS review fully operational for both Flow A and Flow B.

---

## Phase 8: User Story 7 - ATS-Compliant PDF Export (Priority: P4)

**Goal**: Export the finalized CV as a clean, selectable-text vector PDF matching the active ATS template layout.

**Independent Test**:
1. Click "Download ATS PDF" from editor or ATS review stage -> browser downloads a clean `.pdf` file.
2. Open PDF in reader -> verify text is selectable, headers are aligned, and font matches the chosen template.

- [x] T040 [P] [US7] Implement `@react-pdf/renderer` document definition for `ClassicAts` layout in `frontend/src/lib/pdf/ClassicPdfDocument.tsx`
- [x] T041 [P] [US7] Implement `@react-pdf/renderer` document definition for `ModernCompact` layout in `frontend/src/lib/pdf/ModernPdfDocument.tsx`
- [x] T042 [US7] Build client-side PDF download trigger component with loading feedback in `frontend/src/components/export/ExportPdfButton.tsx`
- [x] T043 [US7] Wire export trigger into `Header.tsx` and `StageActions.tsx`
- [x] T043a [US7] Create dedicated Stage 3 final review & export page at `frontend/src/app/editor/export/page.tsx` and `frontend/src/components/export/ExportStage.tsx`
- [x] T043b [US7] Build fullscreen interactive draft view modal with zoom controls and print support in `frontend/src/components/export/DraftViewModal.tsx`

**Checkpoint**: Client-side vector PDF generation working across both templates with dedicated Stage 3 export screen and full-page preview modal.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive polish, accessibility, keyboard navigation, landing page features, and demo validation.

- [x] T044 [P] Verify responsive viewport styling across mobile (375px), tablet (768px), and desktop (1280px+)
- [x] T045 [P] Audit all icons to ensure zero Unicode emojis are used and all icons originate from `lucide-react`
- [x] T046 Verify color consistency across all screens (pure white cards, `#0284C7` light blue accents, no glow effects)
- [x] T047 Test end-to-end user journeys for both Flow A (Scratch) and Flow B (Upload & Audit) with sample data
- [x] T048 [P] Build interactive FAQ accordion in `frontend/src/components/landing/FAQSection.tsx` with brand theme and collapsed default state
- [x] T049 [P] Build multi-column responsive footer in `frontend/src/components/navigation/Footer.tsx`
- [x] T050 [P] Enhance landing page with symmetrical hero illustrations (`hire.svg`, `resume.svg`) and interactive 3-pillar feature cards in `frontend/src/app/page.tsx`

---

## Phase 10: User Story 8 - User Resume & Audit History Dashboard (Priority: P3)

**Goal**: Dedicated History dashboard allowing students to review, restore, duplicate, and delete their saved CV drafts, previous ATS diagnostic scans, and exported PDF snapshots.

**Independent Test**:
1. Navigate to `/history` -> view all saved drafts and export snapshots with ATS score badges, role titles, and last modified timestamps.
2. Click "Edit" on a card -> restores snapshot into active CV editor and navigates to `/editor`.
3. Click "Audit" on a card -> restores snapshot and navigates to `/editor/ats`.
4. Click "Duplicate" -> instantly creates a copy with `(Copy)` suffix and adds it to history list.
5. Click "Delete" -> prompts confirmation and removes the resume from history.
6. Type in search bar or filter by tab (`All`, `Drafts`, `Audited`, `Exported`) -> grid updates reactively.

- [x] T051 [P] [US8] Define `CVHistoryItem` and `CVHistoryStatus` types in `frontend/src/types/cv.ts`
- [x] T052 [P] [US8] Build history storage manager with seed generator and CRUD operations in `frontend/src/lib/historyStore.ts`
- [x] T053 [US8] Integrate `loadFromHistory` and auto-recording in `frontend/src/lib/store.tsx`
- [x] T054 [P] [US8] Build interactive `HistoryCard` component with brand sky-blue hover styling (`border-sky-300`, `hover:bg-sky-50`), clean text actions (`Edit`, `Audit`), and duplicate/delete triggers in `frontend/src/components/history/HistoryCard.tsx`
- [x] T055 [US8] Build dedicated User History page at `frontend/src/app/history/page.tsx` with search, category tabs, and stat cards
- [x] T056 [US8] Connect History access exclusively via user profile dropdown in `frontend/src/components/navigation/Header.tsx`

---

---

## Phase 11: User Story 9 - Frontend State Refactoring to Generic Relational Sections (Alternative 3)

**Goal**: Transition frontend state from rigid isolated arrays (`education[]`, `experience[]`, `projects[]`) to the backend's generic relational structure (`sections: CVSection[]`, `skillGroups: SkillGroup[]`), enabling arbitrary custom sections and eliminating client-server translation adapters.

**Independent Test**:
1. Open `/editor` -> existing draft loads cleanly into `sections` array without runtime errors.
2. Edit Education, Experience, Projects, Skills -> updates reflect instantly in `LivePreview.tsx`.
3. Add a Custom section (e.g., "Volunteering" or "Certifications") -> renders in form and live preview with real-time editing.

- [x] T057 [P] [US9] Refactor TypeScript data contracts in `frontend/src/types/cv.ts` to generic `CVSection`, `CVItem`, `BulletPoint`, `SkillGroup`, and `CVData`
- [x] T058 [US9] Refactor client state store and `localStorage` persistence in `frontend/src/lib/store.tsx` to manage `sections` and `skillGroups`
- [x] T059 [P] [US9] Update `frontend/src/components/editor/sections/EducationSection.tsx` to consume and mutate generic `sectionType: "EDUCATION"` items
- [x] T060 [P] [US9] Update `frontend/src/components/editor/sections/ExperienceSection.tsx` to consume and mutate generic `sectionType: "EXPERIENCE"` items
- [x] T061 [P] [US9] Update `frontend/src/components/editor/sections/ProjectsSection.tsx` to consume and mutate generic `sectionType: "PROJECTS"` items
- [x] T062 [P] [US9] Update `frontend/src/components/editor/sections/SkillsSection.tsx` to consume and mutate `skillGroups` array
- [x] T063 [US9] Update composite form container `frontend/src/components/editor/CVForm.tsx` to assemble generic sections and support adding custom sections
- [x] T064 [US9] Update Harvard Classic and Jake's Modern preview templates in `frontend/src/components/preview/templates/ClassicAts.tsx` and `frontend/src/components/preview/templates/ModernCompact.tsx` to iterate over generic `sections` and `skillGroups`
- [x] T065 [P] [US9] Update vector PDF documents in `frontend/src/lib/pdf/ClassicPdfDocument.tsx` and `frontend/src/lib/pdf/ModernPdfDocument.tsx` to render generic `sections` and `skillGroups`
- [x] T066 [US9] Update `frontend/src/lib/cvParser.ts` to map parsed PDF/DOCX resumes directly to generic `sections` and `skillGroups`

**Checkpoint**: Frontend state store fully refactored to generic `sections` and `skillGroups`. 100% 1-to-1 schema parity with backend MySQL schema.

---

## Phase 12: User Story 10 - Full-Stack Backend Integration (15 Endpoints from COVERAGE_MATRIX.md)

**Goal**: Connect frontend to live backend Express API (`http://localhost:5000/api`) with typed fetch client, session authentication, live role templates, Gemini bullet refine, 4-pillar ATS scoring, and cloud history syncing.

**Independent Test**:
1. Open auth modal -> click "Continue with Google" -> exchanges OAuth token for backend `HttpOnly` cookie, header displays user profile from `/api/auth/me`.
2. Type role in editor -> role suggestions fetch from `/api/job-roles`; bullet drawer loads starter bullets from `/api/job-roles/:id/bullets`.
3. Click "Refine with AI" -> sends bullet to `/api/ai/enhance-bullet` and returns Gemini 3.6 Flash suggestions.
4. Click "ATS Review" -> calculates 4-pillar score from `/api/ats/score`.
5. Save draft -> sends `POST /api/cvs` or `PUT /api/cvs/:id`; `/history` fetches live CV list from `/api/cvs` and deletes via `DELETE /api/cvs/:id`.

- [ ] T067 [P] [US10] Create typed API client with credentials support and error boundary in `frontend/src/lib/api.ts` covering all 15 endpoints
- [ ] T068 [US10] Connect Google OAuth flow in `frontend/src/components/auth/AuthModal.tsx` to backend token exchange endpoint to issue `HttpOnly` session cookie (Zero password forms)
- [ ] T069 [US10] Connect `frontend/src/lib/auth.tsx` and `frontend/src/components/navigation/Header.tsx` to `/api/auth/me` and `/api/auth/logout`
- [ ] T070 [US10] Add parametric `?id=[id]` query parameter support in `frontend/src/app/editor/page.tsx` to hydrate state from `GET /api/cvs/:id`
- [ ] T071 [US10] Connect autosave and continue button in `frontend/src/components/editor/ContinueActionBar.tsx` to `POST /api/cvs` (create) and `PUT /api/cvs/:id` (update)
- [ ] T072 [US10] Connect `frontend/src/components/editor/RoleAutocomplete.tsx` and `frontend/src/components/editor/TemplateBulletDrawer.tsx` to `GET /api/job-roles` and `GET /api/job-roles/:id/bullets`
- [ ] T073 [US10] Connect `frontend/src/components/editor/AIEnhanceModal.tsx` to `POST /api/ai/enhance-bullet` (Gemini 3.6 Flash)
- [ ] T074 [US10] Connect `frontend/src/app/editor/ats/page.tsx` and `frontend/src/app/editor/job-match/page.tsx` to `POST /api/ats/score`
- [ ] T075 [US10] Connect `frontend/src/app/history/page.tsx` and `frontend/src/components/history/HistoryCard.tsx` to `GET /api/cvs` and `DELETE /api/cvs/:id`
- [ ] T076 [US10] Wire resume upload in `frontend/src/components/onboarding/UploadDropzone.tsx` to `POST /api/cvs/import` via multipart `FormData`

**Checkpoint**: All 15 backend API endpoints integrated with the frontend. Full-stack end-to-end user workflow validated.

---

## Phase 13: Full-Stack Docker Containerization & Orchestration

**Goal**: Full multi-container development and deployment environment orchestrating `frontend` (Next.js 14 on port 3000), `backend` (Express on port 5000), and `mysql` (MySQL 8.0 on port 3307/3306) via Docker Compose per Constitution Principle 5.

**Independent Test**:
1. Run `docker compose config` -> returns code 0 with valid service definitions for `mysql`, `backend`, and `frontend`.
2. Run `docker compose up -d` -> all three containers start, health checks pass, frontend loads on `http://localhost:3000`, and communicates with backend API on `http://localhost:5000/api`.

- [x] T077 [P] Create `frontend/Dockerfile` (Node.js 20 Alpine with libc6-compat) and `frontend/.dockerignore` (excluding node_modules, .next, .env*.local)
- [x] T078 Update `docker-compose.yml` to declare `frontend` service with bind mounts, anonymous volume caching (`/app/node_modules`, `/app/.next`), and dependency on `backend`
- [x] T079 Configure non-conflicting host port mapping (`${MYSQL_PORT:-3307}:3306`) and environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)
- [x] T080 Verify full-stack container build with `docker compose build frontend` and test end-to-end multi-container runtime

---

## Dependencies & Execution Order

### Phase Dependencies
1. **Setup (Phase 1)**: Must be completed first to establish the Next.js app and design tokens.
2. **Foundational (Phase 2)**: Layout, Header, and Stepper needed before editor screens.
3. **User Story 1 (Phase 3)**: Onboarding modal and routing logic.
4. **User Story 2 (Phase 4)**: The core CV Editor, Form sections, Templates, and Live Preview (**MVP Deliverable**).
5. **User Story 3 (Phase 5)**: Role Autocomplete & Bullet Drawer (enhances US2 form).
6. **User Story 4 (Phase 6)**: AI STAR/XYZ Assistant (enhances US2 bullet rows).
7. **User Story 5 (Phase 7)**: Dedicated ATS Scoring Stage (receives data from US1 or US2).
8. **User Story 7 (Phase 8)**: PDF Export (consumes completed CV data).
9. **Polish (Phase 9)**: Cross-cutting aesthetic and responsive polish.
10. **User Story 8 (Phase 10)**: User Resume & Audit History Dashboard (consumes saved drafts & export snapshots).
11. **User Story 9 (Phase 11)**: Frontend Generic State Refactoring (Alternative 3 - prerequisite for backend integration).
12. **User Story 10 (Phase 12)**: Full-Stack Backend Integration (connects refactored frontend to 15 Express endpoints).

### Parallel Opportunities per Phase
- **Phase 1**: T004, T005, T007 can be built in parallel.
- **Phase 2**: T010 can be built in parallel with T008/T009.
- **Phase 4**: T015 (Classic) and T016 (Modern) templates can be built in parallel with T018-T022 (Form sections).
- **Phase 7**: T033 (Gauge), T034 (Pillars), and T035 (JD Input) can be built in parallel.
- **Phase 8**: T040 and T041 can be built in parallel.
- **Phase 10**: T051, T052, and T054 can be built in parallel.
- **Phase 11**: T057, T059, T060, T061, T062, and T065 can be built in parallel.
- **Phase 12**: T067 (API client) can be built in parallel with T068 (Auth forms).

---

## Parallel Example: User Story 9 (Alternative 3 Refactoring)

```bash
# Refactor types and section components in parallel:
Task: "Refactor TypeScript data contracts in frontend/src/types/cv.ts"
Task: "Update frontend/src/components/editor/sections/EducationSection.tsx"
Task: "Update frontend/src/components/editor/sections/ExperienceSection.tsx"
Task: "Update frontend/src/components/editor/sections/ProjectsSection.tsx"
Task: "Update frontend/src/components/editor/sections/SkillsSection.tsx"
Task: "Update vector PDF documents in frontend/src/lib/pdf/ClassicPdfDocument.tsx"
```

---

## Parallel Example: User Story 10 (Backend Integration)

```bash
# Build API client and Auth session connection in parallel:
Task: "Create typed API client with credentials support in frontend/src/lib/api.ts"
Task: "Connect Google OAuth token flow to backend session cookie in frontend/src/components/auth/AuthModal.tsx"
```

---

## Implementation Strategy

1. **Step 1 (Standalone UI MVP)**: Completed in Phases 1–10. All screens, templates, mock AI, and local history working.
2. **Step 2 (Generic Relational State Refactor - Phase 11)**: Refactor `CVData`, `store.tsx`, and section components to generic `sections` and `skillGroups` (Alternative 3).
3. **Step 3 (Live Backend Integration - Phase 12)**: Connect all 15 endpoints from `COVERAGE_MATRIX.md` to live MySQL + Express backend.

