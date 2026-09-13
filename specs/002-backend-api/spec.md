# Feature Specification: Module 2 - Backend API (Express + MySQL + Prisma + Google Gemini)

**Feature Branch**: `module/backend-api`

**Created**: 2026-09-12

**Status**: Ready for Planning

**Input**: User description: "Implement the full production Express backend for CareerPrepster Module 1 (CV Editor). This includes Docker Compose orchestration (MySQL, Express, Next.js), standard JWT authentication (email + password), CV CRUD with Prisma transactions, PDF/DOCX resume import (pdf-parse + mammoth text extraction on Express server, Gemini for semantic layout structuring), stateless AI wording assistant (Google Gemini, STAR/XYZ bullet enhancement, zero in-memory context), deterministic 4-pillar ATS scoring engine, pre-seeded Job Role catalog, and frontend integration to replace all mock data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration & Authentication (Priority: P1)

As a student, I want to create an account with my email and password and stay logged in across browser sessions, so that my CVs and ATS reports are securely stored and accessible only to me.

**Why this priority**: Every other backend feature (CV CRUD, AI enhancement, ATS scoring) requires an authenticated user. Authentication is the foundation that all protected endpoints depend on.

**Independent Test**: Can be tested by sending `POST /api/auth/register` with email and password via Postman/curl, verifying a JWT HttpOnly cookie is set, then calling `GET /api/auth/me` with that cookie and confirming the user profile is returned.

**Acceptance Scenarios**:

1. **Given** a new student, **When** they submit `POST /api/auth/register` with a valid email and password (min 8 characters), **Then** the system hashes the password with `bcryptjs`, creates a `User` row in MySQL, signs a JWT containing `userId`, sets it as an `HttpOnly, Secure, SameSite=Lax` cookie, and returns `{ success: true, data: { id, email, name } }`.
2. **Given** an existing student, **When** they submit `POST /api/auth/login` with correct credentials, **Then** the system compares the password hash, issues a new JWT cookie, and returns the user profile.
3. **Given** an existing student, **When** they submit `POST /api/auth/login` with an incorrect password, **Then** the system returns `401 { success: false, error: { code: "INVALID_CREDENTIALS" } }` without revealing whether the email exists.
4. **Given** an authenticated student, **When** they call `GET /api/auth/me`, **Then** the `requireAuth` middleware verifies the JWT cookie and returns the user profile.
5. **Given** an authenticated student, **When** they call `POST /api/auth/logout`, **Then** the JWT cookie is cleared and subsequent calls to `GET /api/auth/me` return `401`.
6. **Given** a request with a missing, expired, or tampered JWT, **When** any protected endpoint is called, **Then** the `requireAuth` middleware returns `401 { code: "UNAUTHORIZED" }`.

---

### User Story 2 - CV CRUD & Persistent Storage (Priority: P1)

As an authenticated student, I want to create, read, update, and delete my CV documents on the server so that my resume data persists across devices and browser sessions, not just in localStorage.

**Why this priority**: Persistent server-side storage is the core data layer that all other features (AI enhancement, ATS scoring, import) build upon. Without CV CRUD, nothing can be saved or retrieved.

**Independent Test**: Can be tested by creating a CV via `POST /api/cvs`, fetching it with `GET /api/cvs/:id` to verify nested sections/items/bullets are returned, updating it with `PUT /api/cvs/:id`, and deleting it with `DELETE /api/cvs/:id`.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit `POST /api/cvs` with title, templateId, fullName, and email, **Then** the system creates a `CV` row with 4 default `CVSection` rows (Education, Experience, Projects, Skills) and returns the complete CV tree with section IDs.
2. **Given** an existing CV owned by the user, **When** they call `GET /api/cvs/:id`, **Then** the system returns the full nested tree: `CV → sections (ordered by orderIndex) → items (ordered) → bulletPoints (ordered)` plus `skillGroups`.
3. **Given** an existing CV, **When** the user submits `PUT /api/cvs/:id` with modified sections, added items, updated bullets, and deleted entries, **Then** the system executes a Prisma `$transaction` that atomically upserts sections, items, bullets, and skill groups while deleting removed entries.
4. **Given** an existing CV, **When** the user calls `DELETE /api/cvs/:id`, **Then** the system cascade-deletes the CV and all child rows (sections, items, bullets, skill groups, ATS reports).
5. **Given** a user trying to access another user's CV, **When** they call `GET /api/cvs/:id` or `PUT /api/cvs/:id`, **Then** the system returns `403 Forbidden`.

---

### User Story 3 - Job Role Catalog & Starter Bullet Library (Priority: P2)

As a student setting up my CV, I want to search for my target career role and browse pre-curated, high-impact bullet points so that I don't stare at a blank page trying to articulate my achievements.

**Why this priority**: Provides immediate content value without requiring AI API calls. The seeded database catalog is fast (< 10ms queries) and free (zero token cost).

**Independent Test**: Can be tested by calling `GET /api/job-roles?q=front` and verifying "Frontend Developer" appears, then calling `GET /api/job-roles/:id/bullets` and verifying starter bullet templates are returned with power verbs and skill categories.

**Acceptance Scenarios**:

1. **Given** a database seeded with 15+ graduate job roles, **When** the user calls `GET /api/job-roles?q=front`, **Then** the system queries MySQL with an indexed `LIKE` search and returns matching roles (e.g., "Frontend Developer") in under 150ms.
2. **Given** a selected job role, **When** the user calls `GET /api/job-roles/:id/bullets`, **Then** the system returns an array of `RoleBulletTemplate` objects containing `bulletText`, `powerVerb`, `skillCategory`, and `framework` (STAR or XYZ).
3. **Given** the bullet endpoint, **When** the user passes an optional `?category=Technical Implementation` query parameter, **Then** only bullets matching that skill category are returned.
4. **Given** a search query with no matches, **When** the user calls `GET /api/job-roles?q=xyznotreal`, **Then** the system returns an empty array with `200 OK`.

---

### User Story 4 - Stateless AI Bullet Enhancement via Google Gemini (Priority: P2)

As a student with a weak or generic bullet point, I want to send it to the AI assistant and receive 2-3 professionally rewritten STAR/XYZ achievement statements so that my resume uses power verbs and quantifiable metrics that impress recruiters.

**Why this priority**: The AI wording assistant is the core differentiator of CareerPrepster. It transforms raw student descriptions into executive-quality bullet points.

**Independent Test**: Can be tested by calling `POST /api/ai/enhance-bullet` with a raw bullet string and verifying the response contains 2-3 structured suggestion objects with `actionVerb`, `enhancedText`, `accomplishedX`, `measuredY`, and `byDoingZ` fields.

**Acceptance Scenarios**:

1. **Given** a raw bullet text (min 5 characters, max 500), optional section context (role title, organization, technologies), and optional framework preference (XYZ or STAR), **When** the user calls `POST /api/ai/enhance-bullet`, **Then** the backend builds a one-shot prompt with the `ats_architect` persona, calls Google Gemini with structured `responseSchema`, and returns `{ success: true, data: { originalBullet, suggestions: [...] } }`.
2. **Given** a valid request, **When** Gemini returns structured JSON, **Then** each suggestion contains: `id`, `actionVerb`, `framework`, `enhancedText`, `accomplishedX`, `measuredY`, `byDoingZ`, and `explanation`.
3. **Given** a raw bullet shorter than 5 characters, **When** the user calls the endpoint, **Then** the system returns `400 { code: "VALIDATION_ERROR", message: "Input is too short (minimum 5 characters)" }`.
4. **Given** a Gemini API timeout or rate limit, **When** the backend retries up to 3 times with exponential backoff (1s, 2s, 4s), **Then** if all retries fail, it returns `503 { code: "AI_UNAVAILABLE", message: "AI assistant is temporarily busy. Your draft has been preserved." }`.
5. **Given** any call to this endpoint, **When** the response is returned, **Then** the backend stores zero conversation history in server RAM. Each call is completely independent and stateless.

---

### User Story 5 - Deterministic 4-Pillar ATS Scoring Engine (Priority: P3)

As a student reviewing my CV before applying, I want a transparent, reproducible ATS score (0-100) broken down across 4 pillars with actionable findings, so that I know exactly what to fix and can verify improvements produce consistent score increases.

**Why this priority**: The ATS scoring engine closes the feedback loop. Students edit their CV, score it, fix issues, and score again — seeing deterministic improvement.

**Independent Test**: Can be tested by calling `POST /api/ats/score` with a `cvId`, verifying the response contains `overallScore`, `breakdown` (4 sub-scores), and `findings[]`. Calling it again with the same CV should produce the exact same score (deterministic).

**Acceptance Scenarios**:

1. **Given** a valid `cvId`, **When** the user calls `POST /api/ats/score`, **Then** the backend fetches the full CV from MySQL and calculates scores using pure rule-based logic (no AI):
   - Parsability & Structure (max 25 pts): Standard section headers, contact completeness, single-column template.
   - Impact & Action Phrasing (max 30 pts): Power verb detection, quantifiable metric scanning.
   - Skills Depth & Categorization (max 25 pts): Categorized skills, count hygiene (8-25 items).
   - Brevity & Readability (max 20 pts): Word count (450-700 ideal), bullet length (12-28 words).
2. **Given** a target job description is provided in the request body, **When** the scoring runs, **Then** the system tokenizes the JD, extracts keywords, computes `matchPercentage`, and returns `matchedKeywords[]` and `missingKeywords[]`.
3. **Given** the scoring result, **When** findings are generated, **Then** each finding is categorized as `CRITICAL`, `SUGGESTION`, or `PASSED` with a `title`, `message`, `sectionRef`, and remediation advice.
4. **Given** the scoring completes, **When** the result is ready, **Then** the system saves an `ATSReport` row in MySQL for audit history and returns the full report.
5. **Given** the same CV content, **When** the scoring endpoint is called multiple times, **Then** the `overallScore` and all sub-scores are identical every time (100% deterministic).

---

### User Story 6 - Resume Import: PDF/DOCX Parsing & AI Layout Structuring (Priority: P3)

As a student with an existing resume in PDF or DOCX format, I want to upload it and have the backend extract the text and intelligently map it into structured CV fields, so that I don't have to retype everything manually.

**Why this priority**: Resume import is one of two onboarding paths ("Upload Existing"). It requires both traditional text extraction (pdf-parse/mammoth running on the Express server) and AI semantic reasoning (Gemini mapping jumbled layout text into structured sections).

**Independent Test**: Can be tested by uploading a sample PDF via `POST /api/cvs/import` (multipart/form-data) and verifying the response contains structured `personalInfo`, `education[]`, `experience[]`, `projects[]`, and `skills[]` fields correctly mapped from the document.

**Acceptance Scenarios**:

1. **Given** a valid PDF file (≤ 5MB), **When** submitted to `POST /api/cvs/import`, **Then** the backend receives it via Multer into a RAM buffer, extracts text using `pdf-parse` (~50ms), sends the raw text to Gemini with a structured `responseSchema`, and returns the structured `CVData` JSON.
2. **Given** a valid DOCX file (≤ 5MB), **When** submitted, **Then** the backend extracts text using `mammoth` (~30ms) and follows the same Gemini structuring pipeline.
3. **Given** a scanned image-only PDF with fewer than 30 characters of extractable text, **When** submitted, **Then** the backend returns `422 { code: "SCANNED_PDF_NO_TEXT", message: "Could not detect selectable text in this PDF." }`.
4. **Given** a file larger than 5MB, **When** submitted, **Then** the backend returns `413 { code: "FILE_TOO_LARGE" }`.
5. **Given** a file that is not PDF or DOCX (e.g., .jpg, .txt), **When** submitted, **Then** the backend returns `400 { code: "INVALID_FILE_TYPE" }`.
6. **Given** a successfully parsed resume, **When** the structuring completes, **Then** the backend creates a new `CV` in MySQL with `isImported = true` and all sections pre-populated.

---

### User Story 7 - Docker Compose Multi-Service Orchestration (Priority: P1)

As a developer, I want to run `docker-compose up` and have all 3 services (MySQL database, Express backend, Next.js frontend) start automatically with proper health checks and networking, so that the entire stack is reproducible and portable.

**Why this priority**: Docker Compose is the deployment and development foundation. Without it, the MySQL database, Prisma migrations, and Express server cannot be reliably started by any team member.

**Independent Test**: Can be tested by running `docker-compose up --build` from the project root and verifying: MySQL is healthy on port 3306, Express responds on `http://localhost:5000/api/health`, and Next.js loads on `http://localhost:3000`.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** the developer runs `docker-compose up --build`, **Then** MySQL 8.0 starts with a persistent volume, Express waits for MySQL health check before starting, and Next.js starts after the backend is ready.
2. **Given** the MySQL container, **When** it starts, **Then** it automatically creates the `careerprepster` database and uses a persistent named volume (`mysql_data`) so data survives container restarts.
3. **Given** the backend container, **When** it starts, **Then** it runs Prisma migrations (`npx prisma migrate deploy`) and seeds the database before starting the Express server.
4. **Given** a developer wants to reset, **When** they run `docker-compose down -v`, **Then** all containers and volumes are removed for a clean restart.

---

### Edge Cases

- **Duplicate Email Registration**: If a user attempts to register with an email already in the `users` table, the system returns `409 { code: "EMAIL_ALREADY_EXISTS" }`.
- **Expired JWT Tokens**: JWTs are signed with a configurable expiry (default 7 days). Expired tokens are rejected by the `requireAuth` middleware with `401`.
- **Concurrent CV Updates**: If two browser tabs attempt `PUT /api/cvs/:id` simultaneously, Prisma transactions ensure atomic writes. The last write wins; no partial state corruption occurs.
- **Gemini API Key Not Configured**: If `GEMINI_API_KEY` is missing from the environment, the AI enhancement endpoint returns `500 { code: "AI_NOT_CONFIGURED" }` while all non-AI endpoints continue functioning normally.
- **Empty CV Scoring**: If a CV has zero bullet points or zero sections, the ATS engine returns a low score with `CRITICAL` findings explaining which sections are missing, rather than crashing.
- **Malicious File Uploads**: Multer enforces strict MIME type checking and 5MB size limits. Files are processed in-memory only and never written to disk.
- **SQL Injection / XSS**: Prisma ORM uses parameterized queries. All user inputs are validated through Zod schemas before reaching the database layer.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide email + password registration and login with bcryptjs password hashing and JWT cookie authentication.
- **FR-002**: System MUST protect all CV, AI, ATS, and import endpoints with `requireAuth` JWT middleware.
- **FR-003**: System MUST validate all incoming request payloads using Zod schemas before processing.
- **FR-004**: System MUST support creating, reading, updating, and deleting CV documents with full nested relational data (sections, items, bullets, skill groups).
- **FR-005**: System MUST execute CV updates as atomic Prisma `$transaction` operations to prevent partial state corruption.
- **FR-006**: System MUST provide a pre-seeded database catalog of 15+ graduate job roles with 50+ curated STAR/XYZ starter bullet templates.
- **FR-007**: System MUST provide autocomplete job role search via indexed MySQL `LIKE` queries.
- **FR-008**: System MUST accept PDF and DOCX file uploads (max 5MB) via Multer in-memory storage on the Express server.
- **FR-009**: System MUST extract text from PDFs using `pdf-parse` and from DOCX using `mammoth`, both running on the Express backend server (not the frontend client).
- **FR-010**: System MUST detect scanned/image-only PDFs (< 30 chars extracted) and return a clear error.
- **FR-011**: System MUST use Google Gemini with structured `responseSchema` to map extracted resume text into structured `CVData` JSON fields.
- **FR-012**: System MUST provide a stateless AI bullet enhancement endpoint that calls Gemini with zero in-memory conversation history.
- **FR-013**: System MUST enforce structured JSON output from Gemini containing `actionVerb`, `framework`, `enhancedText`, `accomplishedX`, `measuredY`, `byDoingZ` fields.
- **FR-014**: System MUST implement exponential backoff retry (max 3 retries) for Gemini API calls.
- **FR-015**: System MUST calculate ATS scores using a deterministic, rule-based 4-pillar algorithm (no AI) producing identical scores for identical input.
- **FR-016**: System MUST support optional Job Description keyword matching with `matchPercentage`, `matchedKeywords[]`, and `missingKeywords[]`.
- **FR-017**: System MUST persist ATS scoring reports in MySQL for audit history.
- **FR-018**: System MUST return standardized error responses: `{ success: false, error: { code: string, message: string } }`.
- **FR-019**: System MUST be fully containerized via Docker Compose with MySQL, Express, and Next.js services.
- **FR-020**: System MUST never expose `GEMINI_API_KEY` or `JWT_SECRET` to the frontend client.

### Key Entities

- **User**: Authenticated student account (`email`, `passwordHash`, `name`, `avatarUrl`).
- **CV**: Resume document owned by a User (`title`, `templateId`, `targetRoleName`, contact fields, `isImported`).
- **CVSection**: Ordered, typed resume section (`sectionType`: Education, Experience, Project, Skill, etc.).
- **CVItem**: Entry within a section (degree, job role, project with dates and location).
- **BulletPoint**: Achievement statement with metadata (`isAiEnhanced`, `hasActionVerb`, `hasMetric`).
- **SkillGroup**: Categorized technical skills stored as JSON array.
- **ATSReport**: Historical audit record (overall score, 4 sub-scores, findings, keyword analysis).
- **JobRole**: Pre-seeded career role catalog entry (`title`, `industryTrack`).
- **RoleBulletTemplate**: Pre-curated starter bullet linked to a JobRole (`bulletText`, `powerVerb`, `framework`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `docker-compose up --build` starts all 3 services (MySQL, Express, Next.js) with zero errors in under 60 seconds.
- **SC-002**: User registration and login complete in under 500ms, with password hash verification under 100ms.
- **SC-003**: `GET /api/cvs/:id` returns the full nested CV tree in under 200ms.
- **SC-004**: `PUT /api/cvs/:id` with a complete CV payload (sections, items, bullets) completes atomically in under 500ms.
- **SC-005**: `GET /api/job-roles?q=` autocomplete search returns results in under 150ms.
- **SC-006**: `POST /api/ai/enhance-bullet` returns 2-3 structured STAR/XYZ suggestions in under 3 seconds (p95).
- **SC-007**: `POST /api/ats/score` calculates the full 4-pillar score and generates findings in under 500ms (deterministic, no AI).
- **SC-008**: `POST /api/cvs/import` extracts text from a 2-page PDF and returns structured CV JSON in under 5 seconds (includes Gemini structuring).
- **SC-009**: All Zod validation errors return structured `400` responses with field-level error details.
- **SC-010**: After frontend integration, all mock files (`mockAI.ts`, `mockData.ts`, temporary Next.js API route) are deleted and replaced with live backend calls.

---

## Assumptions

- **Existing Frontend**: The Next.js 14 frontend from `specs/001-cv-editor` is complete and running. The backend's job is to replace mock data and provide persistent storage.
- **API Contracts**: The backend implements the exact request/response formats defined in `specs/001-cv-editor/contracts/` (auth-api.md, cv-api.md, import-cv-api.md, job-roles-api.md, ai-enhance-api.md, ats-score-api.md).
- **Google Gemini Access**: A valid `GEMINI_API_KEY` from Google AI Studio is available for AI features. Non-AI features (auth, CV CRUD, ATS scoring, job roles) work without it.
- **MySQL via Docker**: MySQL 8.0 runs as a Docker container with persistent volume. No local MySQL installation is required.
- **Downstream Decoupling**: This backend serves Module 1 (CV Editor) only. Module 2 (Mock Interviews) and Module 3 (Job Matching) will extend the same Express server with additional routes and services in future feature specs.
