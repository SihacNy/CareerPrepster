# Technical Research & Architecture Decisions: Module 2 - Backend API

**Branch**: `module/backend-api` | **Date**: 2026-09-12 | **Status**: Complete

---

## 1. Executive Summary & Goals

Module 2 delivers the full production Express backend for CareerPrepster, orchestrating MySQL 8.0, Prisma ORM, Google Gemini AI, deterministic rule-based ATS scoring, in-memory PDF/DOCX text extraction, and secure JWT authentication.

This document details the architectural choices, library selections, performance budgets, and security strategies adopted for this backend.

---

## 2. Technology Stack Evaluation & Decisions

### 2.1 Backend Runtime & Framework

- **Selected**: Node.js 20 LTS + Express.js 4.x + TypeScript 5.x
- **Rationale**:
  - Express is lightweight, battle-tested, and has minimal overhead for JSON REST APIs.
  - End-to-end TypeScript parity with Next.js frontend enables sharing Zod validation schemas without code duplication.
  - Native ES module / TypeScript build pipeline with `tsx` (dev) and `tsc` (prod).
- **Alternatives Considered & Rejected**:
  - *NestJS*: Excessive boilerplate, heavy decorator overhead, and unnecessary complexity for our 6 focused domain controllers.
  - *Fastify*: Slightly higher raw throughput, but smaller ecosystem and ecosystem plugin idiosyncrasies with standard middleware stacks.

### 2.2 Database & ORM

- **Selected**: MySQL 8.0 + Prisma ORM 5.x
- **Rationale**:
  - Relational schema guarantees strict relational integrity across `User → CV → CVSection → CVItem → BulletPoint` with cascade deletes.
  - Prisma provides type-safe query generation directly derived from `schema.prisma`.
  - Prisma `$transaction` handles atomic updates of deeply nested CV structures in a single database round-trip.
  - Indexing on `(userId, createdAt)`, `jobRole.title`, and `jobRole.industry` guarantees < 5ms query resolution.
- **Alternatives Considered & Rejected**:
  - *MongoDB / Mongoose*: Schema flexibility would complicate relational integrity for future Module 2 (Mock Interviews) and Module 3 (Job Board) extensions that reference CV items.
  - *TypeORM / Drizzle*: Drizzle is high-performance but lacks the mature schema migration, introspection, and seed tooling of Prisma in team environments.

### 2.3 Document Parsing Engine (PDF & DOCX)

- **Selected**: `pdf-parse` (PDF) + `mammoth` (DOCX) running **in-process** inside the Express backend.
- **Rationale**:
  - `pdf-parse` extracts raw text from PDF text layers in ~50ms using Node.js `Buffer`.
  - `mammoth` extracts raw text from DOCX XML archives in ~30ms without requiring Microsoft Office binaries or libreoffice.
  - Multer memory storage (`multer.memoryStorage()`) processes uploads in RAM with zero disk I/O, preventing orphaned temporary files and meeting student privacy requirements.
  - Raw extracted text is sent directly to Google Gemini with a structured JSON schema for layout classification.
- **Scanned PDF Handling**:
  - Scanned image PDFs contain 0 extractable text characters.
  - The parser implements a character count threshold: `< 30` characters triggers an immediate `422 Unprocessable Entity` with a clear actionable message ("Scanned image PDF detected. Please upload a digital PDF with selectable text").
- **Alternatives Considered & Rejected**:
  - *Tesseract OCR / Python Service*: Scanned OCR requires 500MB+ trained model data, high CPU/RAM overhead, and 8-15s processing times. Out of scope for MVP; digital vector PDFs are industry standard.
  - *Frontend Parsing*: `pdf-parse` and `mammoth` require Node.js `fs`/`Buffer`/`stream` APIs and cannot execute client-side in browser sandboxes.

### 2.4 AI Integration (Google Gemini)

- **Selected**: Google Gemini 2.5 Flash API via `@google/genai` (or `@google/generative-ai`) SDK with structured `responseSchema`.
- **Rationale**:
  - **Stateless Architecture**: Zero session state or chat history stored in backend memory. Every prompt is a self-contained one-shot instruction.
  - **Deterministic JSON Output**: Uses Gemini's native `responseSchema` (JSON schema mode) to guarantee syntactically valid JSON responses matching TypeScript contracts.
  - **Persona Engineering**: Injects the `ats_architect` system instruction:
    > "You are an elite career coach and ATS optimization engineer. Rewrite bullet points using active power verbs and quantifiable impact metrics (STAR/XYZ methodology)."
  - **Resilience & Fallbacks**: Exponential backoff retry loop (1s, 2s, 4s) with a 10s timeout budget.
- **Alternatives Considered & Rejected**:
  - *OpenAI GPT-4o*: Higher latency, higher cost per token, and requires separate billing setup compared to Google Gemini.
  - *LangChain / LlamaIndex*: Massive dependency overhead; unnecessary for simple one-shot structured prompts.

### 2.5 ATS Scoring Engine

- **Selected**: 100% Deterministic Rule-Based Algorithm (Pure TypeScript).
- **Rationale**:
  - ATS scoring must be **reproducible**: evaluating the same CV twice must yield the exact same 0-100 score.
  - Zero token cost, zero network latency (< 5ms execution time).
  - 4 Pillars:
    1. **Parsability & Structure (25 pts)**: Contact info completeness, standard section titles, template compatibility.
    2. **Impact & Action Phrasing (30 pts)**: Regex scanning against 250+ curated power verbs (e.g., *Spearheaded, Engineered, Orchestrated*) and numeric impact patterns (`\d+%`, `\$\d+`, `\d+x`).
    3. **Skills Depth & Categorization (25 pts)**: Grouped categories (Languages, Frameworks, Tools) and total skill count (ideal: 8–25 items).
    4. **Brevity & Readability (20 pts)**: Total word count (450–700 words), bullet length (12–28 words per bullet).
- **Job Description Keyword Matcher**:
  - When a target JD is supplied, the engine tokenizes the JD using NLP stop-word filtering, computes intersection with CV skill terms, and outputs a match percentage with matched vs missing keywords.

### 2.6 Authentication & Session Security

- **Selected**: JWT in `HttpOnly, Secure, SameSite=Lax` Cookie.
- **Rationale**:
  - Storing JWTs in `localStorage` makes them vulnerable to Cross-Site Scripting (XSS).
  - `HttpOnly` cookies are inaccessible via JavaScript `document.cookie`, preventing token exfiltration.
  - `SameSite=Lax` prevents Cross-Site Request Forgery (CSRF) on cross-origin POST requests while allowing top-level navigation.
  - Passwords hashed with `bcryptjs` (salt rounds = 10).

---

## 3. Performance & Resource Budgets

| Metric | Target | Enforced By |
| :--- | :--- | :--- |
| **Auth Verification (`requireAuth`)** | `< 1ms` | In-memory JWT cryptographic verification |
| **Job Role Search (`GET /api/job-roles`)** | `< 50ms` | MySQL indexed query (`title`, `industry`) |
| **CV Fetch (`GET /api/cvs/:id`)** | `< 30ms` | Single Prisma query with `include` joins |
| **ATS Scoring (`POST /api/ats/score`)** | `< 10ms` | In-memory deterministic rule evaluation |
| **Resume Extraction (PDF/DOCX)** | `< 100ms` | `pdf-parse` / `mammoth` buffer stream processing |
| **AI Bullet Enhancement (Gemini)** | `< 2.5s` | Gemini 2.5 Flash + structured output schema |
| **AI Resume Structuring (Gemini)** | `< 3.5s` | Gemini 2.5 Flash + structured schema |
| **Max Upload File Size** | `5MB` | Multer `limits: { fileSize: 5 * 1024 * 1024 }` |
| **Container RAM Limit** | `< 256MB` | Docker Compose resource limits |

---

## 4. Error Handling & Standardization

All API endpoints strictly adhere to the unified envelope contract:

### Success Envelope
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation.",
    "details": [ ... ]
  }
}
```

### Standard Error Codes
- `UNAUTHORIZED` (401): Missing or invalid JWT session cookie.
- `FORBIDDEN` (403): User attempting to access another user's CV.
- `NOT_FOUND` (404): Requested entity does not exist.
- `VALIDATION_ERROR` (400): Zod schema violation; details contain field-level issues.
- `FILE_TOO_LARGE` (413): Upload exceeds 5MB limit.
- `INVALID_FILE_TYPE` (400): File is not `.pdf` or `.docx`.
- `SCANNED_PDF_NO_TEXT` (422): Uploaded PDF lacks selectable text layer.
- `AI_UNAVAILABLE` (503): Gemini API rate limit or outage after 3 retries.
- `INTERNAL_SERVER_ERROR` (500): Unexpected runtime exception.
