# Implementation Plan: Module 1 - CV Editor, Resume Import & Universal ATS Scoring

**Branch**: `module/cv-editor` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-cv-editor/spec.md`

## Summary

Module 1 establishes the foundational full-stack architecture for CareerPrepster and implements the complete CV authoring, resume import, and ATS scoring pipeline. The system provides an onboarding entry fork ("Create from Scratch" vs "Upload Existing Resume"), text-layer document extraction for PDF/DOCX files, a curated database catalog of job roles with pre-authored starter bullet points, a dual-pane editor with live ATS preview, in-line AI wording assistance (STAR/XYZ methodology), an explainable 4-pillar ATS scoring engine, and high-fidelity vector PDF export.

All services are containerized via Docker and backed by MySQL with Prisma ORM using an 8-table relational schema (`cvs`, `cv_sections`, `cv_items`, `bullet_points`, `skill_groups`, `job_roles`, `role_bullet_templates`, `ats_reports`). Following **Alternative 3**, the frontend state store (`frontend/src/lib/store.tsx`) is refactored to adopt this generic `sections` and `skillGroups` architecture directly, achieving 1:1 parity with the backend and eliminating the need for bidirectional translation adapters.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS  
**Frontend Framework**: Next.js 14+ (App Router), React 18, Tailwind CSS  
**Backend Framework**: Node.js + Express.js  
**Database & ORM**: MySQL 8.0, Prisma ORM 5.x (8 relational tables)  
**State Architecture**: Generic relational section tree (`sections: CVSection[]`, `skillGroups: SkillGroup[]`) matching backend schema 1:1 (Alternative 3)  
**Authentication & Security**: Strictly OAuth 2.0 (Google OAuth 2.0 primary, passwordless), JWT in `HttpOnly, Secure, SameSite=Lax` Cookie, `cookie-parser`  
**Validation**: Zod 3.x (shared client & server contracts)  
**File Parsing & Upload**: `multer` (streaming uploads, 5MB limit), `pdf-parse` (PDF text layer), `mammoth` (Word DOCX text)  
**AI Service Integration**: Google Gemini 1.5 Flash API (structured JSON output for resume parsing & STAR/XYZ wording)  
**PDF Generation**: `@react-pdf/renderer` (pure vector ATS selectable text)  
**Containerization**: Docker, Docker Compose, Multi-stage builds  
**Testing**: Jest, Supertest (API), React Testing Library  
**Target Platform**: Linux containers, Desktop web (modern evergreen browsers)  
**Performance Goals**: 
- Auth check (cookie verification) < 1ms
- Resume PDF/DOCX parsing < 3.0s (p95)
- Role autocomplete search < 150ms
- In-line AI wording generation < 3.0s
- Full ATS score scan < 2.0s
- Document preview rendering < 100ms
**Constraints**: 
- Passwordless authentication: No passwords stored or processed; all identity verification handled via OAuth 2.0 provider tokens
- All external API payloads strictly validated with Zod
- Resumes strictly constrained to ATS-safe single-column layout templates

---

## Constitution Check

*GATE: All principles from [.specify/memory/constitution.md](file:///c:/Users/Yup%202/Documents/Camtech/CareerPrepster/.specify/memory/constitution.md) verified.*

| Principle | Compliance Assessment | Status |
| :--- | :--- | :--- |
| **Principle 1: Full-Stack Architecture & Separation of Concerns** | Next.js frontend, Express API backend, MySQL database with Prisma ORM, and shared Zod validation. | **PASS** |
| **Principle 2: Staged AI Workflow (CV Editor → ATS)** | Scoped to template selection, role starter bullets, in-line STAR/XYZ wording assistance, and explainable ATS checks. AI is advisory; user agency preserved. | **PASS** |
| **Principle 3: Modular Downstream Extensions** | CV data models (`CV`, `CVSection`, `BulletPoint`) and Job Catalog (`JobRole`) are self-contained and expose relational foreign keys for future Module 2 (Interviews) and Module 3 (Jobs). | **PASS** |
| **Principle 4: Student Privacy & Data Minimization** | PII fields structured; uploaded files parsed in-memory without persistent disk caching; AI prompt payloads sanitize external calls. | **PASS** |
| **Principle 5: Containerization (Docker-First)** | Root `docker-compose.yml` orchestrates frontend, backend, and MySQL with volume persistence and multi-stage Dockerfiles. | **PASS** |

---

## Project Structure

### Documentation & Specifications (this feature)

```text
specs/001-cv-editor/
├── spec.md              # Feature specification
├── plan.md              # Technical implementation plan (this document)
├── research.md          # Technical decisions and rationale
├── data-model.md        # Database schema & Prisma models
├── quickstart.md        # End-to-end validation guide
├── contracts/           # API contracts & Zod schemas
│   ├── auth-api.md      # User authentication (register, login, logout)
│   ├── cv-api.md        # CRUD CV operations
│   ├── import-cv-api.md # PDF/DOCX file upload & parsing
│   ├── job-roles-api.md # Autocomplete & starter bullet library
│   ├── ai-enhance-api.md# STAR/XYZ bullet enhancement
│   └── ats-score-api.md # 4-pillar ATS scoring engine
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── tasks.md             # Actionable coding tasks (generated by /speckit-tasks)
```

### Source Code Layout (Repository Monorepo)

```text
CareerPrepster/
├── docker-compose.yml             # MySQL, Backend API, Frontend
├── .env.example
├── package.json                   # Root npm workspaces config
│
├── shared/                        # Shared TypeScript types & Zod schemas
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       └── schemas/
│           ├── auth.schema.ts     # Register & login validation
│           ├── cv.schema.ts       # CV, Section, & Bullet schemas
│           ├── import.schema.ts   # Upload & extracted data schemas
│           ├── job-role.schema.ts # Job role & starter bullet schemas
│           ├── ai.schema.ts       # STAR/XYZ enhance request/response
│           └── ats.schema.ts      # ATS 4-pillar score schemas
│
├── backend/                       # Node.js + Express API
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma          # MySQL schema (Users, CVs, Sections, Roles, Bullets, Reports)
│   │   └── seed.ts                # Initial seed data for 15+ job roles & starter bullets
│   └── src/
│       ├── index.ts               # Express server entrypoint
│       ├── routes/
│       │   ├── auth.routes.ts     # Register, Login, Logout, Me endpoints
│       │   ├── cv.routes.ts       # CRUD endpoints
│       │   ├── import.routes.ts   # POST /api/cvs/import (multer upload)
│       │   ├── job-role.routes.ts # GET /api/job-roles (autocomplete & bullets)
│       │   ├── ai.routes.ts       # Bullet enhancement endpoint
│       │   └── ats.routes.ts      # ATS scoring engine endpoint
│       ├── services/
│       │   ├── auth.service.ts    # OAuth token verification & HttpOnly JWT cookie issuance
│       │   ├── parser.service.ts  # PDF/DOCX text extraction + Gemini structuring
│       │   ├── ai.service.ts      # Gemini API STAR/XYZ prompt client
│       │   ├── ats.service.ts     # 4-pillar scoring algorithm
│       │   └── pdf.service.ts     # ATS PDF exporter
│       └── middlewares/
│           ├── requireAuth.ts     # HttpOnly cookie JWT verification middleware
│           ├── validate.ts        # Zod request validation middleware
│           └── errorHandler.ts
│
└── frontend/                      # Next.js 14 (App Router) + Tailwind CSS
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx           # Landing / Dashboard with symmetrical hero illustrations & FAQ
        │   ├── history/
        │   │   └── page.tsx       # Dedicated User History Dashboard (Drafts, ATS Scores, Export Snapshots)
        │   ├── globals.css        # Core typography, scrollbars, checkmark draw & pop keyframe animations
        │   ├── api/
        │   │   └── cvs/
        │   │       └── import/
        │   │           └── route.ts  # [TEMP] Server-side PDF/DOCX text extraction (migrates to Express)
        │   └── editor/
        │       ├── page.tsx       # Stage 1: Dual-pane CV Editor (Form + Live Preview + Desktop Workspace Switcher)
        │       ├── job-match/
        │       │   └── page.tsx   # Dedicated Target Role Job Description Matcher (Spacious JD textarea + Keyword matcher)
        │       ├── ats/
        │       │   └── page.tsx   # Stage 2: Dedicated ATS Scoring Stage (Audit, 4 Pillars, In-dashboard JD matcher)
        │       └── export/
        │           └── page.tsx   # Stage 3: Dedicated Final Review & Vector PDF Export Stage
        ├── components/
        │   ├── navigation/
        │   │   ├── EditorStepper.tsx     # Progress indicator: [1. Author CV] -> [2. ATS Review] -> [3. Export PDF]
        │   │   ├── Header.tsx            # Logo, Draft Status indicator, Profile & Primary Sign In button
        │   │   └── Footer.tsx            # Multi-column footer with brand, resources, and privacy guarantees
        │   ├── auth/
        │   │   └── AuthModal.tsx         # 1-Click Google & GitHub OAuth modal with clean ShieldCheck icon
        │   ├── onboarding/
        │   │   ├── OnboardingModal.tsx   # "Create from Scratch" vs "Upload Existing"
        │   │   └── UploadDropzone.tsx    # Drag-and-drop PDF/DOCX file uploader
        │   ├── landing/
        │   │   └── FAQSection.tsx        # Interactive FAQ accordion with ambient dark theme
        │   ├── editor/
        │   │   ├── CVForm.tsx            # Main editor container (Clean Jump to section, Collapse All, Clear All)
        │   │   ├── RoleAutocomplete.tsx  # Target role search & catalog selection
        │   │   ├── DateRangePicker.tsx   # Standardized date picker with "Present" toggle (42px height, rounded-xl)
        │   │   ├── RichBulletEditor.tsx  # WYSIWYG ContentEditable bullet editor with animated sky-blue checkmark
        │   │   ├── BulletInput.tsx       # Legacy achievement bullet row with explicit 'Refine with AI' button
        │   │   ├── TemplateBulletDrawer.tsx # Role starter bullets with animated sky-blue checkmark insertion
        │   │   ├── AIEnhanceModal.tsx    # STAR/XYZ suggestion review & accept modal (p-4 cards, rounded-xl buttons)
        │   │   ├── MobileViewToggle.tsx  # Mobile switcher: [ Edit Form ] vs [ Live Preview ]
        │   │   ├── ContinueActionBar.tsx # Sticky bottom bar: [Save Draft] and [Continue to ATS Review →]
        │   │   └── sections/             # Modular structured form sections:
        │   │       ├── PersonalSection.tsx   # Personal Info, Email, Phone, Location, Portfolio, Bio
        │   │       ├── EducationSection.tsx  # Institution, Degree, Major, GPA, DateRangePicker, Bullets
        │   │       ├── ExperienceSection.tsx # Company, Role, Location, DateRangePicker, Bullets
        │   │       ├── ProjectsSection.tsx   # Project Name, Tech Stack, Repo Link, DateRangePicker, Bullets
        │   │       └── SkillsSection.tsx     # Categorized Technical Skills (Languages, Frameworks, Tools)
        │   ├── history/
        │   │   └── HistoryCard.tsx       # Interactive CV version history card with ATS score ring and actions
        │   ├── preview/
        │   │   ├── LivePreview.tsx       # Live rendered resume viewport with template switcher
        │   │   └── templates/            # ATS-compliant layout templates
        │   │       ├── ClassicAts.tsx
        │   │       └── ModernCompact.tsx
        │   ├── ats/
        │   │   ├── ATSScoringStage.tsx    # Main Stage 2 review layout
        │   │   ├── ScoreGauge.tsx         # 0-100 animated score ring
        │   │   ├── PillarBreakdown.tsx    # 4-pillar cards (Parsability, Impact, Skills, Brevity)
        │   │   ├── JobDescriptionInput.tsx# Target JD text input & keyword matcher with draft state
        │   │   ├── ActionableFindingsList.tsx # Categorized issues (Critical, Suggestions, Passed)
        │   │   └── StageActions.tsx       # [← Back to Edit] and [Continue to Export PDF →]
        │   └── export/
        │       ├── ExportStage.tsx        # Stage 3 final draft sheet layout & actions
        │       ├── ExportPdfButton.tsx    # @react-pdf client generator with loading state
        │       └── DraftViewModal.tsx     # Fullscreen interactive draft modal with zoom & print
        └── lib/
            ├── api.ts                    # Fetch client for backend
            ├── auth.tsx                  # Client auth state & OAuth mock/live integration
            ├── historyStore.ts           # LocalStorage CV draft versioning & snapshot management
            ├── store.tsx                 # Client CV state & localStorage draft caching
            └── pdf/
                ├── ClassicPdfDocument.tsx # Vector PDF layout for Harvard Classic
                └── ModernPdfDocument.tsx  # Vector PDF layout for Jake's Tech
```

---

## Frontend UI/UX Design System & Styling Guidelines

To ensure a modern, polished, and student-friendly experience, the frontend adheres to the following curated design system:

### 1. Visual Aesthetics & Strict Design Rules
- **Core Aesthetic**: Clean, professional, academic & modern tech aesthetic. Crisp, flat-to-subtle borders, high contrast, and generous whitespace.
- **Strict Anti-Cliché Rules**:
  - **NEVER USE EMOJIS FOR ICONS**: Strictly banned from using Unicode emojis (e.g., 🚀, 🤖, ✨, 📝, 💡, ❌, ✅, etc.) for UI buttons, section headers, list bullets, or status indicators. Emojis render inconsistently across OSs and degrade professional credibility.
  - **NO glowing effects**: Strictly no neon blurs, no glowing box-shadows, and no high-intensity illumination.
  - **NO colorful "AI-looking" motifs**: Strictly no rainbow gradients, no purple/pink magic sparkles, and no holographic or psychedelic badges. AI suggestions are treated as serious, editorial writing tools (clean light-blue accents, crisp monochrome badges).
  - **NO CSS Zoom Hacks**: No artificial `style={{ zoom: ... }}` properties. Sizing is handled natively via responsive Tailwind CSS utility classes.
  - **NO Decorative Eyebrow Pill Badges**: Strictly ban floating pill badges, tag chips, or eyebrow pills (e.g., `rounded-full` pills like "User Dashboard", "Get Started", "Overview" floating above headings). Section headings and page titles must remain clean, direct, and uncluttered without redundant pill ornaments.
  - **NO Boxed Icon Containers**: Strictly ban enclosing standalone icons inside decorative rounded or squared background tile boxes (e.g., `w-10 h-10 rounded-xl bg-sky-50 border border-sky-100` wrappers) unless explicitly instructed by the user. Icons must sit cleanly, unboxed, and naturally beside their labels or metrics without artificial background box ornamentation.
- **Color Palette (White & Light Sky Blue)**:
  - **Base Canvas**: Clean Crisp White (`#FFFFFF`) and Soft Slate canvas (`#F8FAFC`)
  - **Card / Container Surfaces**: Pure White (`#FFFFFF`) with subtle 1px border (`border-slate-200` / `#E2E8F0`)
  - **Primary Brand Accent**: Light Sky Blue (`#0284C7` / `#0EA5E9` / Tailwind `sky-600` / `sky-500`) for primary buttons, active steps, checkmark indicators, and links.
  - **Secondary Accent & Background Fills**: Ice Blue (`#E0F2FE` / `#F0F9FF` / Tailwind `sky-100` / `sky-50`) for active tabs, selected states, and gentle highlight chips.
  - **Form Controls & Action Buttons**: Pure Sky Blue (`bg-sky-600 text-white hover:bg-sky-700 shadow-sky-500/30`). **Zero green accents on bullet suggestion actions or form elements**.
  - **Text Hierarchy**: Dark Slate (`#0F172A` / `text-slate-900`) for headings, Muted Slate (`#475569` / `text-slate-600`) for body/labels, Light Slate (`#94A3B8`) for placeholders.
  - **ATS Health Indicators (Clean Flat Badges, No Glow)**:
    - **Passed (80–100)**: Clean Emerald (`text-emerald-700 bg-emerald-50 border-emerald-200`)
    - **Suggestion (50–79)**: Clean Amber (`text-amber-700 bg-amber-50 border-amber-200`)
    - **Critical (0–49)**: Clean Rose (`text-rose-700 bg-rose-50 border-rose-200`)

### 2. Native Form Scaling Standards
All CV editor form sections, inputs, and action buttons follow a standardized native scale:
- **Card Containers**: `p-6 rounded-2xl mb-6 bg-white border border-slate-200` for all section wrappers.
- **Input Fields & Textareas**: `text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs`.
- **Field Labels**: `text-xs sm:text-[13px] font-semibold text-slate-700 mb-2`.
- **Section Headers**: `text-sm sm:text-base font-semibold text-slate-800` with `w-4 h-4` vector category icons.
- **Date Range Pickers**: Dropdown buttons and ongoing/present badges standardized to `h-[42px] text-sm px-3.5 rounded-xl`.
- **Top Action Controls**: "Jump to section...", "Collapse All / Expand All", and "Clear All" styled uniformly to `px-3 py-1.5 rounded-lg text-xs font-semibold` with `w-3.5 h-3.5` icons, harmonizing identically with the desktop workspace switcher.
- **Desktop Workspace Switcher**: 3-mode selector (`[Dual Mode]`, `[Editor only]`, `[Preview Mode]`) styled with `bg-slate-100 border border-slate-200/80 p-1 rounded-xl text-xs font-semibold shadow-2xs`.

### 3. Tactile Micro-Animations
- **Checkmark Button Pop (`animate-checkmark-pop`)**: On bullet recommendation click, button bounces from `scale(0.65)` to `scale(1.22)` to resting `scale(1.0)` with spring cubic-bezier curves.
- **Checkmark Stroke Draw (`animate-checkmark-draw`)**: White vector checkmark dynamically draws from the left tip across to the right flourish using animated `stroke-dashoffset` path.
- **Card Highlight**: Soft sky blue border and background pulse (`bg-sky-50 border-sky-400 ring-1 ring-sky-300`) during selection.

### 4. Typography
- **Khmer & Primary Font**: `Kantumruy Pro` (Google Fonts: Modern, elegant bilingual Khmer + Latin sans-serif font standard for academic and tech platforms in Cambodia)
- **Secondary / Fallback Sans-Serif**: `Inter` / `Plus Jakarta Sans`
- **Typographic Rules**:
  - Headings: `font-semibold` / `font-medium`, tight letter-spacing (`tracking-tight`)
  - Body & Form Inputs: Regular (400), clean line height (`leading-relaxed`)
  - Metrics & Dates: Tabular numbers / clean sans-serif for alignment consistency

### 5. Icons & Symbol System
- **Library Standard**: Exclusively use **`lucide-react`** vector SVG icons with a consistent stroke width (`strokeWidth={1.75}`).
- **Key Icon Mappings**:
  - Upload / Dropzone: `<UploadCloud />`, `<FileText />`
  - ATS Health Status: `<CheckCircle2 />` (Passed), `<AlertTriangle />` (Suggestion), `<XCircle />` (Critical)
  - Navigation / Actions: `<ArrowRight />`, `<ArrowLeft />`, `<Download />`, `<Plus />`, `<Trash2 />`, `<Compass />`, `<ChevronsUpDown />`
  - AI Assistant: `<PenLine />` or `<Sparkles />` (styled in clean sky blue, no rainbow effect)
  - Search / Filter: `<Search />`, `<Check />`
- **Missing / Custom Icons**: Never substitute a missing icon with an emoji. Always use a proper SVG icon from `lucide-react` or prompt the user for an approved asset.
- **Unboxed Vector Icon Standard**: Render all vector icons cleanly and directly beside or above labels without surrounding them in colored tile boxes, rounded card squares, or decorative container wrappers unless explicitly requested. While unboxed, icons retain their distinct semantic and brand accent colors (e.g. brand sky blue `text-sky-600`, success emerald `text-emerald-600`) to maintain visual clarity and hierarchy.
- **Interactive Icon Hover Synchrony**: On hover of any interactive link, dropdown row, or navigation item where the label changes to brand blue (`hover:text-sky-600`), the accompanying vector icon MUST synchronize and turn blue (`group-hover:text-sky-600 transition-colors`) rather than remaining statically gray.

### 6. Progressive Workflows & Stage Transitions

The platform supports two distinct user onboarding pathways with seamless transitions:

#### Flow A: "Create from Scratch" (Author-First Flow)
```text
[Landing / Onboarding]
   │  Select "Create from Scratch"
   ▼
[Stage 1: CV Editor (/editor)]
   │  Fill sections, explore role starter bullets, WYSIWYG editing, AI STAR/XYZ assistance
   │  User clicks sticky bottom action "Continue to ATS Review →"
   ▼
[Dedicated Job Description Matcher (/editor/job-match)]
   │  Spacious target JD input with circular hover back arrow button
   │  Extract role keywords, compute target match percentage
   │  User clicks "Match Keywords & Proceed to ATS Score →"
   ▼
[Stage 2: Dedicated ATS Review (/editor/ats)]
   │  Review 0-100 Score Gauge, 4 Pillar breakdown, in-dashboard JD matcher
   │  Use "Fix in Editor" or "← Back to Editor" if adjustments needed
   ▼
[Stage 3: Final Review & Export (/editor/export)]
   │  Inspect full-screen draft preview sheet with zoom & print
   │  Click "Download ATS PDF" for selectable-text vector PDF output
```

#### Flow B: "Upload Existing Resume" (Audit-First Diagnostic Flow)
```text
[Landing / Onboarding]
   │  Drop existing PDF / DOCX file
   │  Backend parses text + computes baseline 4-pillar ATS audit
   ▼
[Stage 2: Instant ATS Diagnostic (/editor/ats?from=upload)]
   │  Immediate gratification: Student sees current score (e.g. 58/100)
   │  See parsing health, weak impact verbs, and missing sections
   │  User clicks primary CTA: "Improve & Edit in ATS Template →"
   ▼
[Stage 1: CV Editor (/editor)]
   │  All extracted resume data is pre-populated in structured fields
   │  Student enhances bullets, updates metrics, and adjusts layout
   │  User clicks "Continue to ATS Review →"
   ▼
[Dedicated Job Description Matcher (/editor/job-match)]
   │  Match against target job description or skip directly to scoring
   ▼
[Stage 2: Post-Improvement ATS Score (/editor/ats)]
   │  Score updates in real time (e.g., 58 -> 88!)
   ▼
[Stage 3: Final Review & Export (/editor/export)]
   │  Inspect full-screen draft preview sheet with zoom & print
   │  Click "Download ATS PDF" for selectable-text vector PDF output
```

### 7. Responsive Design & Mobile Screen Adaptation

Because resumes require high horizontal precision and mobile screens have limited viewport width:
- **Desktop & Large Tablets (`lg:` breakpoint / >= 1024px)**:
  - Desktop view switcher: `[Dual Mode]` (55% scrollable structured form inputs; 45% sticky live preview), `[Editor only]` (100% focused authoring), or `[Preview Mode]`.
- **Mobile & Small Screens (`< 1024px`)**:
  - **Single-Pane Focus Mode**: Replaces the cramped dual-pane with a full-width interface.
  - **Segmented View Switcher (`MobileViewToggle.tsx`)**:
    - Sticky top bar or bottom floating pill control: `[ Edit Form ]` vs `[ Live Preview ]`.
    - **Edit Mode**: Full-width comfortable touch targets for input fields, section reordering, and bullet creation without horizontal scrolling.
    - **Preview Mode**: The resume preview dynamically scales to fit the mobile device width with zero state loss.
    - **Preview Mode**: The resume preview dynamically scales to fit the mobile device width (with clean pinch/zoom) so students can inspect layout fidelity on the go.
  - **1-Tap Quick Switch**: Floating badge button (`<Eye /> Preview` while editing, `<PenLine /> Edit Form` while previewing) allows instant switching with zero state loss.

---

## Implementation Notes

### Resume Import: Phased Backend Migration

The resume import parsing pipeline (`POST /api/cvs/import`) is being implemented in two phases:

**Phase 1 (Current)**: Text extraction via `pdf-parse` (PDF) and `mammoth` (DOCX) is implemented as a **Next.js API Route** at `frontend/src/app/api/cvs/import/route.ts`. This is a temporary location since the Express backend does not exist yet. The regex-based structurer in `frontend/src/lib/cvParser.ts` maps the extracted text to `CVData`.

**Phase 2 (Express Migration)**: When the Express backend is added, the parsing logic should be migrated to `backend/src/routes/import.routes.ts` + `backend/src/services/parser.service.ts` as outlined in the project structure above. The Gemini structured schema parsing replaces the regex structurer at that time. The client call in `cvParser.ts` only needs its URL updated (or use `next.config.js` rewrites to proxy `/api/*` → Express).

**Phase 3 (Gemini)**: Replace the regex-based `parseResumeTextToCVData()` with Gemini structured output parsing using a strict Zod `responseSchema` for semantic section identification. This happens on the Express backend.

---

## Complexity Tracking

> Zero constitution violations detected. Architecture strictly adheres to Principles 1 through 5.

