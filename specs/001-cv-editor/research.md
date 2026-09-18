# Research & Technical Decisions: 001-cv-editor

**Feature**: Module 1 - CV Editor, Resume Import & Universal ATS Scoring  
**Date**: 2026-09-11 (Updated with Resume Import & Job Catalog)  
**Status**: Completed  

## 1. Database & Frontend State Architecture: Align Frontend with Backend Relational Schema (Alternative 3)

### Decision: Full 8-Table Relational Backend Schema + Frontend Store Refactoring (`sections` & `items`)
- **Rationale**:
  - **Backend Ground Truth**: The backend API is already built and validated with an 8-table normalized relational schema (`cvs`, `cv_sections`, `cv_items`, `bullet_points`, `skill_groups`, `job_roles`, `role_bullet_templates`, `ats_reports`).
  - **1-to-1 Contract Parity**: By refactoring the frontend `CVData` interface and `store.tsx` to match the backend's generic structure (`sections: Array<{ sectionType, items }>` and `skillGroups: Array<{ categoryName, skills }>`):
    - Frontend sends `cvData`, backend receives the exact relational payload directly without adapter overhead.
    - Zero translation/mapping layer needed between frontend state and backend API payloads.
  - **Extensible & Reorderable Sections**: Enables drag-and-drop section reordering (`orderIndex`) and arbitrary custom sections (e.g. "Volunteering", "Publications", "Certifications", "Awards") without requiring ad-hoc data models.
  - **Granular AI & ATS Targeting**: Allows backend services to operate directly on individual `bullet_points` (tracking `framework`, `hasMetric`, `actionVerb`) and specific sections.
- **Alternatives Evaluated**:
  - *Alternative 1: Complex Bidirectional Adapter Layer in Frontend (`cvDataToBackendPayload` / `backendPayloadToCVData`)*: Leaves the frontend state rigid and requires maintaining hundreds of lines of fragile transformation code.
  - *Alternative 2: Flattening Backend to a Single JSON Column in MySQL*: Would require completely tearing down the existing normalized backend endpoints, services, and Prisma migrations in `report_backend.md`.
  - *Chosen Path (Alternative 3)*: Refactor the frontend `CVData` type, `store.tsx`, and section components to consume generic `sections` and `items`. This aligns frontend directly with the production-ready backend.

---

## 2. Shared Type Safety & Validation

### Decision: Monorepo `shared/` package with Zod
- **Rationale**:
  - **Constitution Alignment**: Principle 1 mandates *"Strict schema validation using Zod at both API boundaries and form inputs"*.
  - By locating Zod schemas in `shared/src/schemas/`, both the Next.js frontend (React Hook Form + Zod resolver) and Express backend (validation middleware) consume the exact same contracts. Zero drift between client and server.
- **Alternatives Considered**:
  - *Duplicated types in frontend and backend*: High risk of schema desynchronization.
  - *Yup / Joi*: Less ergonomic TypeScript inference compared to Zod's `z.infer<typeof Schema>`.

---

## 3. Resume Import & Parsing Pipeline (PDF / DOCX)

### Decision: Text-Layer Extraction (`pdf-parse` / `mammoth`) + Gemini Structured Schema
- **Rationale**:
  - **Speed & Privacy**: Extracting raw text with `pdf-parse` (for PDFs) and `mammoth` (for Word DOCX) runs in under 150ms locally on the Node.js server with zero external file storage overhead.
  - **Semantic Structuring via Gemini**: The extracted raw text string is passed to Google Gemini with a strict Zod `responseSchema`. Gemini reliably identifies which lines belong to Education, Work Experience, Projects, and Skills, returning clean JSON in under 2 seconds.
  - **Image-Only Fallback Detection**: If `pdf-parse` returns fewer than 30 characters of text, the system immediately recognizes the PDF as an image-only scan and gracefully notifies the student to use digital text or our templates.
- **Alternatives Considered**:
  - *Heavy OCR engines (Tesseract in Docker)*: Extremely slow (10–15s per page), adds 500MB+ to Docker image size, unnecessary for 95% of digital student PDFs.

---

## 4. In-Line AI Wording Architecture (STAR/XYZ)

### Decision: Google Gemini 1.5 Flash API with Structured JSON Schema Output
- **Rationale**:
  - **Speed & Latency**: Sub-second generation time essential for in-line interactive UX (target < 3s in SC-004).
  - **Structured Outputs**: Gemini's native `responseSchema` forces the model to return typed JSON objects containing:
    1. Action verb used
    2. Accomplishment (X)
    3. Measurable outcome slot (Y)
    4. Action/context taken (Z)
    5. Full suggested bullet point string
  - **Non-Destructive User Agency**: Matches Principle 2; suggestions are returned as advisory candidates for the user to accept, edit, or reject.
- **Alternatives Considered**:
  - *Unstructured free-form text prompting*: Prone to conversational fluff ("Here are three options for you..."), requiring brittle regex parsing.

---

## 5. Universal ATS Scoring Engine Architecture

### Decision: Hybrid Rule-Based Deterministic Scoring + Semantic Nuance
- **Rationale**:
  - **Constitution Alignment**: Principle 2 mandates *"Transparent ATS Scoring: CV scoring algorithms must be explainable and actionable rather than opaque black-box ratings."*
  - **4-Pillar Composite Rubric (100 Points Total)**:
    1. *Parsability & Structure (25 pts)*: Standard section headers, contact completeness, single-column reading hierarchy.
    2. *Impact & Action-Oriented Phrasing (30 pts)*: Power verb detection (via curated action verb taxonomy), quantifiable metrics detection (numbers, percentages, metrics regex), and XYZ format adherence.
    3. *Skills Depth & Categorization (25 pts)*: Categorized skills validation (Languages, Frameworks, Tools), skill-to-experience keyword correlation.
    4. *Readability & Length (20 pts)*: Word count target (450–750 words), bullet point length sanity (10–30 words per bullet), buzzword penalties.
  - Generates clear categories: `criticalIssues` (red), `suggestions` (yellow), `passedChecks` (green).
- **Alternatives Considered**:
  - *Pure LLM scoring prompt ("Grade this resume from 1 to 100")*: Fails transparency requirements; generates nondeterministic, fluctuating scores that frustrate users.

---

## 6. Seeded Job Roles & Starter Bullet Library

### Decision: Pre-seeded Relational Tables in MySQL (`job_roles` & `role_bullet_templates`)
- **Rationale**:
  - **Instant & Token-Free**: Autocomplete query runs in < 10ms via standard MySQL indexing (`WHERE title LIKE ?`).
  - **Zero AI Cost for Discovery**: Students browse and import pre-authored, industry-vetted achievement bullets without invoking Gemini API calls until they choose to personalize with AI.
  - **Initial Seed Volume**: 15–20 core graduate job titles covering Software Engineering, Frontend, Backend, Full-Stack, Data Analyst, Machine Learning, UI/UX, and Product Management.

---

## 7. ATS-Compliant PDF Export

### Decision: `@react-pdf/renderer`
- **Rationale**:
  - **Selectable Text & ATS Compliance**: `@react-pdf/renderer` outputs real vector text (not image snapshots or flattened canvases), ensuring 100% parsability by commercial ATS readers.
  - **Single Source of Layout**: Renders directly from the structured CV data model, preserving the single-column ATS layout defined in templates.
- **Alternatives Considered**:
  - *`html2canvas` + `jsPDF`*: Renders the DOM as an image inside a PDF. ATS parsers cannot read images; immediate rejection by real ATS systems.

---

## 8. Containerization & Docker Orchestration

### Decision: Multi-Stage Dockerfiles + Root `docker-compose.yml`
- **Rationale**:
  - **Constitution Alignment**: Principle 5 mandates Docker-first development and environment parity.
  - Services defined:
    - `mysql`: MySQL 8.0 container with persistent named volume `mysql_data`.
    - `backend`: Node.js Express API running on port 5000.
    - `frontend`: Next.js web application running on port 3000.

---

## 9. Authentication Architecture: Passwordless OAuth 2.0 (Google OAuth Primary)

### Decision: Strictly OAuth 2.0 (Google OAuth Primary), Zero Passwords Stored
- **Rationale**:
  - **Constitution Alignment**: Principle 4 mandates *"Student Privacy & Data Minimization"*. Storing and hashing raw passwords adds significant attack surfaces (credential stuffing, brute forcing, password spraying) and requires complex reset/verification workflows.
  - **Zero Friction for University Students**: Students and new graduates already possess verified institutional or personal Google accounts. A single-click OAuth flow eliminates registration drop-off.
  - **Token & Session Integrity**: Identity verification is delegated to Google's cryptographic token validation endpoint. The backend exchanges verified Google ID tokens for signed, `HttpOnly, SameSite=Lax` session JWT cookies, preventing XSS access to authentication credentials.
  - **Database Simplicity**: The `users` table only requires `email`, `googleId`, `name`, and `avatarUrl` without password hash fields or salt columns.
- **Alternatives Evaluated & Rejected**:
  - *Email + Password Authentication*: Evaluated and explicitly rejected per user directive. Introducing password forms creates friction, requires salt/hash/reset pipelines, and duplicates existing verified Google identity systems without adding value for student users.

---

## 10. Dedicated Template Selection Experience Within Author CV (Stage 1)

### Decision: Dedicated Template Picker Section/Studio Within Stage 1 ("Author CV"), Preserving 3-Stage Pipeline
- **Rationale**:
  - **User Directive**: Do not add a 4th stage to the pipeline. Stage progression remains strictly:
    - **Stage 1: Author CV** (`/editor`): Comprehensive section authoring, role setup, STAR/XYZ in-line enhancement, starter bullets, and dedicated template selection.
    - **Stage 2: ATS Review** (`/editor/ats`): 4-pillar ATS audit, critical issue remediations, and optional targeted job description alignment.
    - **Stage 3: Export PDF** (`/editor/export`): Vector PDF document preview, page-budget audit, and download deliverable.
  - **Embedded Dedicated Template Selection**:
    - Instead of a tiny, obscure toggle inside the preview toolbar, provide a prominent, dedicated template picker within the Author CV stage (e.g., a top collapsible or expandable Template card section in the editor form and/or a prominent switcher with rich cards, typography tags, and recommended industry guidance).
    - Preserves user workflow: users can switch templates right where they are typing and seeing live updates, without page transitions or breaking the 3-step mental model.
- **Alternatives Evaluated & Rejected**:
  - *Adding a separate route & 4th stage in the stepper*: Rejected per user instruction. Adding another stage creates unnecessary friction and fragments the authoring process.

---

## 11. Multi-Archetype Template System: Minimalist, Color Accent, and Photo/Visual Templates

### Decision: Curated 3-Archetype Catalog with Dynamic Color Theming and Optional Headshot Support
- **Rationale**:
  - **Diverse Industry Needs**: Students apply across different sectors with distinct expectations:
    1. **Minimalist ATS** (`classic` Harvard Classic, `modern` Jake's Tech): Standard black-and-white, zero tables, 100% vector text for traditional corporate, finance, software engineering, and US/UK enterprise ATS filters.
    2. **Modern Color Accent** (`executive-accent`, `modern-slate`): Subtle professional color accents (divider rules, section header titles, skill badges) tailored for consulting, modern tech, startups, and marketing, while strictly maintaining single-column linear text flow for ATS compliance.
    3. **Visual / Photo-Enabled** (`modern-photo`, `creative-visual`): Profile image / avatar thumbnail placed in the header alongside name and contact info. Ideal for creative roles, portfolios, and international job markets (e.g. EU, Middle East, Asia) where photos are standard or expected.
  - **User-Selectable Color System**:
    - Users can select their desired accent color from a curated palette of 6 accessible, high-contrast professional hex codes (`#0284c7` Sky Blue, `#1e3a8a` Executive Navy, `#0f766e` Emerald Teal, `#334155` Slate Steel, `#b91c1c` Crimson Burgundy, `#4338ca` Royal Indigo) or custom hex.
    - Colors dynamically style header accents, divider rules, and category labels across both the web preview and `@react-pdf/renderer` exports.
  - **ATS Transparency & Student Guidance**:
    - The Template Gallery explicitly tags each archetype (e.g., `100% ATS Corporate Standard` for Minimalist vs. `International / Creative` for Photo-enabled) so students make informed choices depending on their target country and industry.
  - **Synchronized Dual-Engine Rendering**:
    - Every template is implemented as a paired set: an interactive HTML/Tailwind component for the real-time editor preview, and a matching `@react-pdf/renderer` component for crisp vector PDF export.
- **Alternatives Evaluated & Rejected**:
  - *Free-form Drag-and-Drop Page Builder*: Rejected per Principle 2 of the Constitution. Generative unconstrained layouts break ATS text extraction order and introduce parsing bugs.
  - *Hard-coded Fixed Colors*: Rejected because students want agency to match their personal brand or target company branding.
