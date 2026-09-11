# Research & Technical Decisions: 001-cv-editor

**Feature**: Module 1 - CV Editor, Resume Import & Universal ATS Scoring  
**Date**: 2026-09-11 (Updated with Resume Import & Job Catalog)  
**Status**: Completed  

## 1. Database & ORM Strategy

### Decision: MySQL 8.0 + Prisma ORM
- **Rationale**:
  - **Constitution Alignment**: Principle 1 mandates MySQL with a type-safe ORM.
  - **Prisma Benefits**: Declarative `schema.prisma` provides immediate schema migrations, auto-generated TypeScript clients, and strong relation handling between `User`, `CV`, `CVSection`, `BulletPoint`, and `JobRole`.
  - **JSON/Relational Hybrid**: MySQL 8.0 natively supports JSON columns for flexible template styling and skill groups while maintaining strict relational integrity for core resume data.
- **Alternatives Considered**:
  - *Drizzle ORM*: Lightweight and fast SQL-like syntax, but Prisma offers superior automated schema migration generation for student/team collaboration.
  - *TypeORM*: More verbose decorators and historically prone to migration drift compared to Prisma schema-first definitions.

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
