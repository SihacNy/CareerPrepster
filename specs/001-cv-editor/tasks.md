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

**Checkpoint**: Client-side vector PDF generation working across both templates.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive polish, accessibility, keyboard navigation, and demo validation.

- [x] T044 [P] Verify responsive viewport styling across mobile (375px), tablet (768px), and desktop (1280px+)
- [x] T045 [P] Audit all icons to ensure zero Unicode emojis are used and all icons originate from `lucide-react`
- [x] T046 Verify color consistency across all screens (pure white cards, `#0284C7` light blue accents, no glow effects)
- [x] T047 Test end-to-end user journeys for both Flow A (Scratch) and Flow B (Upload & Audit) with sample data

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
9. **Polish (Phase 9)**: Final aesthetic check.

### Parallel Opportunities per Phase
- **Phase 1**: T004, T005, T007 can be built in parallel.
- **Phase 2**: T010 can be built in parallel with T008/T009.
- **Phase 4**: T015 (Classic) and T016 (Modern) templates can be built in parallel with T018-T022 (Form sections).
- **Phase 7**: T033 (Gauge), T034 (Pillars), and T035 (JD Input) can be built in parallel.
- **Phase 8**: T040 and T041 can be built in parallel.

---

## Implementation Strategy (MVP First)

1. **Step 1 (MVP Foundation)**: Complete Phases 1, 2, 3, and 4.
   - *Deliverable*: Working interactive dual-pane CV editor with live preview, mobile toggle, template switching, and local storage auto-saving.
2. **Step 2 (Content Guidance)**: Complete Phases 5 and 6.
   - *Deliverable*: Role search, starter bullet library, and AI STAR/XYZ re-writing assistant.
3. **Step 3 (Audit & Export)**: Complete Phases 7 and 8.
   - *Deliverable*: Dedicated ATS Scoring Review stage with 4 pillars, JD matching, and PDF download.
