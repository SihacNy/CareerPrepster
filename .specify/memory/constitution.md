<!--
Sync Impact Report:
- Version change: 1.3.0 → 1.3.1
- List of modified principles:
  - Principle 2: Clarified CV Editor scope to user template selection with AI-assisted wording suggestions (STAR/XYZ framing) rather than open-ended layout generation
- Added sections: None
- Removed sections: None
- Follow-up TODOs: None
-->

# CareerPrepster Constitution

## Problem Statement
Graduating university students frequently possess valuable academic coursework, capstone projects, internships, and extracurricular achievements, but struggle to articulate these experiences into industry-standard, high-impact CV bullet points. Consequently:
1. **The Translation Gap**: Students undersell their competencies, listing basic task descriptions rather than quantifiable achievements and employer-aligned outcomes (e.g., STAR/XYZ frameworks).
2. **The ATS Filter Barrier**: Non-optimized formats and missing industry keywords result in premature screening rejections by Applicant Tracking Systems (ATS).
3. **Interview Unpreparedness**: Without targeted interview drills connected to their specific CV claims, students struggle to confidently defend and elaborate on their projects during live interviews.

CareerPrepster solves this by acting as an AI-powered career coach that bridges the gap between raw student experience and compelling employer appeal.

## Core Principles

### Principle 1: Full-Stack Architecture & Separation of Concerns
- **Frontend**: Next.js with React and Tailwind CSS for responsive, modern UI/UX tailored to university students.
- **Backend API**: Node.js + Express handling business logic, CV parsing pipelines, and AI orchestrations.
- **Data Layer**: MySQL database paired with a type-safe ORM (such as Prisma or Drizzle) for structured persistence (user profiles, CV history, interview sessions).
- **Validation**: Strict schema validation using **Zod** at both API boundaries and form inputs to prevent invalid payloads.

### Principle 2: Staged AI Workflow (Core CV Editor → ATS Pipeline)
- **Primary Sequential Workflow**: The AI user journey MUST be structured as a sequential core pipeline: **CV Editing (Template Selection + AI Word Suggestions) → ATS Optimization & Keyword Scoring**.
- **Template-First CV Editor Scope**: The CV editor experience is strictly scoped to **user template selection** and **AI-driven wording suggestions**:
  - The user selects their preferred CV layout from a curated set of structured, ATS-friendly templates.
  - The AI acts as an in-line phrasing and vocabulary assistant rather than an unconstrained generative page builder, suggesting power verbs, quantifiable impact metrics, and phrasing options (e.g., STAR/XYZ frameworks) for users to populate and refine template sections.
- **Deterministic Validation Before AI Generation**: All user inputs, CV sections, and parsed CV data must pass Zod schema validation before being dispatched to LLM prompt pipelines.
- **Transparent ATS Scoring**: CV scoring algorithms must be explainable and actionable, delivering concrete suggestions (keyword density, formatting checks, section flow) rather than opaque black-box ratings.
- **User Agency & Non-Destructive Preservation**: AI suggestions are advisory; the user maintains full control over accepting, modifying, or rejecting proposed wording within their selected template.

### Principle 3: Modular Downstream Extensions (Interview Drills & Job Matching)
- **Decoupled Optional Modules**: Features beyond the core CV-to-ATS pipeline—specifically **AI Mock Interview Drills** and **Job Matching**—MUST be designed as modular, opt-in extensions. Completion of these modules is strictly optional and must never gate or block core CV drafting and ATS optimization.
- **Contextual CV Ingestion**: When activated by the user, optional modules consume the polished, validated CV data as contextual baseline to tailor interview question banks or job recommendation algorithms.
- **Interactive Interview Drill Realism**: AI Mock Interview drills maintain conversational context, deliver rubric-based constructive feedback, and simulate realistic technical and behavioral scenarios tailored to the student's CV claims.
- **Targeted Job Matching**: Job recommendation algorithms, when invoked, evaluate alignment against extracted skills and target role aspirations without forcing participation.

### Principle 4: Student Privacy & Data Minimization
- Resumes contain personally identifiable information (PII). Raw CV files and extracted PII must be securely stored, access-controlled, and never logged in plain text or shared with third parties outside explicit AI processing agreements.

### Principle 5: Containerization & Environment Parity (Docker-First)
- **Containerized Development & Deployment**: All services (Next.js frontend, Express backend, MySQL database, and background workers) MUST be fully containerized using Docker and orchestratable via `docker-compose`.
- **Environment Parity**: Local development, CI/CD automated test environments, and production deployments MUST use matching container configurations and environment variable contracts to eliminate "works on my machine" defects.
- **Production-Grade Images**: Dockerfiles MUST utilize multi-stage builds, slim base images (e.g., `node:alpine` or `distroless`), non-root execution privileges, and clean `.dockerignore` filters to ensure small footprint, security, and fast build times.
- **Stateless Services & Persistent Volumes**: Application containers must remain stateless; persistent storage (e.g., MySQL data, temporary file uploads) MUST be handled via explicit named volumes or external object stores.

## Governance & Amendments
- **Amendments**: Changes to principles require version bumps and team consensus.
- **Versioning**: Follows Semantic Versioning (`MAJOR.MINOR.PATCH`).
  - *MAJOR*: Architectural or fundamental principle changes.
  - *MINOR*: Adding new feature guidelines, problem scopes, or principles.
  - *PATCH*: Clarifications, typos, formatting.
- **Compliance**: All feature specifications (`/speckit-specify`), architectural plans (`/speckit-plan`), and task breakdowns (`/speckit-tasks`) must comply with this constitution.

**Version**: v1.3.1 | **Ratified**: 2026-08-24 | **Last Amended**: 2026-09-10
