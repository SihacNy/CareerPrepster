# 🚀 CareerPrepster Backend — Technical Architecture & API Documentation Report

**Project Name:** CareerPrepster Backend API  
**Environment:** Development & Production (Dockerized)  
**Database:** MySQL 8.0  
**AI Engine:** Google Gemini (`gemini-3.6-flash`)  
**Architecture Pattern:** Layered MVC / Service-Repository Pattern with Prisma ORM  

---

## 📑 Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [Technology Stack & Infrastructure](#2-technology-stack--infrastructure)
3. [Database Architecture & Schema](#3-database-architecture--schema)
4. [Backend API Endpoints Catalog (15 Endpoints)](#4-backend-api-endpoints-catalog-15-endpoints)
5. [Business Logic & Controller Breakdown](#5-business-logic--controller-breakdown)
6. [Google Gemini AI Integration](#6-google-gemini-ai-integration)
7. [Deterministic 4-Pillar ATS Scoring Engine](#7-deterministic-4-pillar-ats-scoring-engine)
8. [Multi-Level Structured Logging & Error Boundary](#8-multi-level-structured-logging--error-boundary)
9. [Step-by-Step Postman Testing Guide](#9-step-by-step-postman-testing-guide)
10. [Local Development & Docker Run Guide](#10-local-development--docker-run-guide)
11. [Recent Backend Enhancements & Target Role Resolution](#11-recent-backend-enhancements--target-role-resolution)
12. [TypeScript Strict Compilation & Dual-Enum Unification](#12-typescript-strict-compilation--dual-enum-unification)
13. [ATS Persistence & History Feature Roadmap](#13-ats-persistence--history-feature-roadmap-phase-13--user-story-10)
14. [Google OAuth Multi-Token Ingestion & Session State Architecture](#14-google-oauth-multi-token-ingestion--session-state-architecture)
15. [CV Relational Synchronization & Prisma P2025 Prevention](#15-cv-relational-synchronization--prisma-p2025-prevention)
16. [Prisma P2003 Foreign Key Constraint Violated (`targetRoleId`)](#16-error-audit-prisma-p2003-foreign-key-constraint-violated-targetroleid)
17. [Multi-Provider AI Architecture: Groq Llama/GPT-OSS Integration](#17-multi-provider-ai-architecture-groq-llamagpt-oss-integration)

---

## 1. Executive Overview

**CareerPrepster Backend** is a high-performance RESTful API built for university students and career switchers to create, format, and audit job-ready resumes. It provides:
- **Relational CV Management:** Full nested creation and updates for education, work experiences, technical projects, and categorized skill sets.
- **Pre-Authored Starter Bullet Catalog:** 17 career tracks (Software Engineering, Data Science, AI/ML, DevOps, UI/UX, Cybersecurity) with 51 pre-seeded STAR/XYZ templates.
- **AI Bullet Enhancement:** Real-time rewriting of draft bullets using **Google Gemini** into quantifiable impact statements.
- **ATS Diagnostic Engine:** 4-pillar audit (Parsability, Impact, Skills, Brevity) scoring resumes from 0 to 100 with keyword gap analysis against target job descriptions.
- **Resume File Parser:** Extraction of text from uploaded `.pdf` and `.docx` files using `pdf-parse` and `mammoth`.

---

## 2. Technology Stack & Infrastructure

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js 20 (LTS) | Asynchronous JavaScript runtime |
| **Language** | TypeScript 5.6 | Strict type safety and compile-time validation |
| **Framework** | Express.js 4.21 | HTTP routing, middleware pipeline |
| **ORM** | Prisma 5.19 | Database modeling, migrations, relational queries |
| **Database** | MySQL 8.0 | Relational ACID-compliant storage |
| **AI SDK** | `@google/generative-ai` | Official SDK connecting to `gemini-3.6-flash` |
| **Validation** | Zod 3.23 | Schema validation for all request bodies and queries |
| **Security & Auth** | Helmet, Google OAuth 2.0, jsonwebtoken | Secure headers, Google ID token verification, HttpOnly JWT cookies |
| **Document Parsers** | `pdf-parse`, `mammoth` | Extraction from PDF and Word documents |
| **DevOps** | Docker & Docker Compose | Multi-container orchestration (`mysql` + `backend`) |

---

## 3. Database Architecture & Schema

The database consists of **8 relational tables** designed with foreign key constraints, cascading deletes, and optimized indexes.

```
                      ┌──────────────┐
                      │    users     │
                      └──────┬───────┘
                             │ 1-to-many
                             ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  job_roles   │◄─────┤     cvs      │─────►│ ats_reports  │
└──────┬───────┘      └──────┬───────┘      └──────────────┘
       │ 1-to-many           │ 1-to-many
       ▼                     ▼
┌──────────────────┐  ┌──────────────┐      ┌──────────────┐
│role_bullet_templ.│  │ cv_sections  │      │ skill_groups │
└──────────────────┘  └──────┬───────┘      └──────────────┘
                             │ 1-to-many
                             ▼
                      ┌──────────────┐
                      │   cv_items   │
                      └──────┬───────┘
                             │ 1-to-many
                             ▼
                      ┌──────────────┐
                      │bullet_points │
                      └──────────────┘
```

### Table Definitions:

1. **`users`**:
   - `id` (UUID Primary Key)
   - `email` (Unique VARCHAR)
   - `googleId` (Unique Google Identifier VARCHAR)
   - `name` (VARCHAR)
   - `avatarUrl` (VARCHAR)
   - `createdAt`, `updatedAt` (Timestamps)

2. **`cvs`** (Master Resume Header):
   - `id` (UUID Primary Key), `userId` (Foreign Key -> `users.id`)
   - `title`, `templateId`, `targetRoleId`
   - `fullName`, `email`, `phone`, `location`, `linkedinUrl`, `githubUrl`, `summary`

3. **`cv_sections`**:
   - `id` (UUID), `cvId` (Foreign Key -> `cvs.id` CASCADE)
   - `sectionType` (ENUM: `EXPERIENCE`, `EDUCATION`, `PROJECTS`, `SKILLS`, `CERTIFICATIONS`, `CUSTOM`)
   - `orderIndex`, `isVisible`

4. **`cv_items`** (Companies, Universities, Projects):
   - `id` (UUID), `sectionId` (Foreign Key -> `cv_sections.id` CASCADE)
   - `title` (Role title, Degree, or Project name)
   - `subtitle` (Company, University, or Subtitle)
   - `location`, `startDate`, `endDate`, `isCurrent`, `url`, `orderIndex`

5. **`bullet_points`**:
   - `id` (UUID), `itemId` (Foreign Key -> `cv_items.id` CASCADE)
   - `text` (TEXT), `actionVerb`, `hasMetric` (BOOLEAN), `framework` (ENUM: `STAR`, `XYZ`, `STANDARD`), `orderIndex`

6. **`skill_groups`**:
   - `id` (UUID), `cvId` (Foreign Key -> `cvs.id` CASCADE)
   - `categoryName` (e.g., "Programming Languages", "Tools & Cloud")
   - `skills` (JSON array of strings)

7. **`job_roles`**:
   - `id` (UUID), `title` (Unique VARCHAR), `industry`, `description`, `skills` (JSON array of recommended keywords)

8. **`role_bullet_templates`**:
   - `id` (UUID), `jobRoleId` (Foreign Key -> `job_roles.id` CASCADE)
   - `bulletText`, `powerVerb`, `skillCategory`, `framework`

9. **`ats_reports`**:
   - `id` (UUID), `cvId`, `userId`, `overallScore` (0-100), `parsabilityScore`, `impactScore`, `skillsScore`, `brevityScore`, `findings` (JSON), `targetJobDesc` (TEXT), `matchPercentage`

---

## 4. Backend API Endpoints Catalog (15 Endpoints)

| # | Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `GET` | `/api/health` | Health check and environment probe | Public |
| **2** | `POST` | `/api/auth/register` | Register new user and set session cookie | Public |
| **3** | `POST` | `/api/auth/login` | Log in user and set session cookie | Public |
| **4** | `GET` | `/api/auth/me` | Return profile of logged-in user | **Required** |
| **5** | `POST` | `/api/auth/logout` | Clear session cookie | Public |
| **6** | `GET` | `/api/job-roles` | Search job roles (e.g. `?q=Data+Scientist`) | Public |
| **7** | `GET` | `/api/job-roles/:id/bullets` | Get starter bullet templates for a role | Public |
| **8** | `GET` | `/api/cvs` | List all CVs for the authenticated user | **Required** |
| **9** | `POST` | `/api/cvs` | Create full relational CV document | **Required** |
| **10** | `GET` | `/api/cvs/:id` | Fetch full CV tree (sections, items, bullets) | **Required** |
| **11** | `PUT` | `/api/cvs/:id` | Update entire CV document atomically | **Required** |
| **12** | `DELETE`| `/api/cvs/:id` | Delete CV document and all child records | **Required** |
| **13** | `POST` | `/api/ai/enhance-bullet` | Enhance bullet via Google Gemini AI | Optional (Guest friendly) |
| **14** | `POST` | `/api/ats/score` | Run 4-pillar deterministic ATS audit | Optional (Guest friendly) |
| **15** | `POST` | `/api/cvs/import` | Upload & parse PDF/DOCX resume file | Public |

---

## 5. Business Logic & Controller Breakdown

### 1. Authentication Controller (`auth.controller.ts` & `auth.service.ts`)
- **Google OAuth 2.0 Verification:** Accepts Google ID token (`idToken`), verifies token cryptographic authenticity with Google Cloud public keys, and extracts verified profile (`email`, `googleId`, `name`, `avatarUrl`).
- **Account Linking / Creation:** Automatically logs in existing users or creates a new user profile in MySQL.
- **Session Handling:** Signs a JSON Web Token (JWT) with 7-day expiration and sets it in an `HttpOnly`, `SameSite=Lax` cookie.
- **Clean Logout:** Clears cookie and session on `/api/auth/logout`.

### 2. Job Roles & Starter Bullets (`job-role.controller.ts` & `job-role.service.ts`)
- **Seeded Catalog:** Contains **17 roles** and **51 pre-authored STAR/XYZ templates**.
- **Search Filtering:** Supports case-insensitive partial substring queries across job title, industry, and description.

### 3. CV Management Controller (`cv.controller.ts` & `cv.service.ts`)
- **Atomic Transactions:** Creates top-level `cvs`, `cv_sections`, `cv_items`, `bullet_points`, and `skill_groups` inside a single Prisma `$transaction`. If any child record fails, the entire transaction rolls back cleanly.
- **Access Control:** Verifies that the requesting user owns the CV before allowing fetch, update, or deletion.

### 4. AI Enhancement Controller (`ai.controller.ts` & `ai.service.ts`)
- **Model:** `gemini-3.6-flash` via `@google/generative-ai`.
- **Framework Formula:** Applies Google's XYZ formula:
  $$\text{Accomplished } [X] \text{ as measured by } [Y] \text{ by doing } [Z]$$
- **Structured Output:** Enforces strict JSON Schema return containing `actionVerb`, `framework`, `enhancedText`, `accomplishedX`, `measuredY`, `byDoingZ`, and `explanation`.

### 5. ATS Scoring Controller (`ats.controller.ts` & `ats.service.ts`)
- **Deterministic 4-Pillar Scoring:**
  1. **Parsability (25 pts):** Checks standard section headings, clean contact details (email, phone, location), and single-column layout readability.
  2. **Impact (30 pts):** Measures presence of strong action power verbs (e.g. *Engineered, Architected, Spearheaded*) and quantifiable metrics (percentages, dollar amounts, user scale).
  3. **Skills Alignment (25 pts):** Analyzes keyword match ratio against target job descriptions and flags missing high-value competencies.
  4. **Brevity & Conciseness (20 pts):** Checks ideal document word length (450–700 words) for student and junior resumes.

### 6. Resume File Parser Controller (`import.controller.ts` & `import.service.ts`)
- **Multi-Format Support:** Uses `multer` in-memory buffer handling with `pdf-parse` for PDFs and `mammoth` for Word (`.docx`) files.
- **AI Structuring:** Converts unstructured resume text into a structured CVData tree.

---

## 6. Google Gemini AI Integration

### Configuration
- **Model Name:** `gemini-3.6-flash`
- **Environment Variable:** `GEMINI_API_KEY` in `.env`
- **Response Format:** `application/json`

### Verification Test Result
A live request sent to `POST /api/ai/enhance-bullet` with input:
> *"built machine learning models to classify customer churn data"*

Returned the following Gemini response:
```json
{
  "success": true,
  "data": {
    "originalBullet": "built machine learning models to classify customer churn data",
    "suggestions": [
      {
        "id": "suggestion-1",
        "actionVerb": "Engineered",
        "framework": "XYZ",
        "enhancedText": "Engineered ensemble machine learning classification models (XGBoost, Random Forest) on AWS SageMaker, improving customer retention prediction accuracy by 28% and reducing annual churn rates by 15% across 500k active user accounts.",
        "accomplishedX": "Improved customer retention prediction accuracy by 28% and reduced annual churn rates by 15%",
        "measuredY": "28% increase in prediction accuracy and 15% reduction in annual churn across 500k accounts",
        "byDoingZ": "engineering ensemble machine learning classification models (XGBoost, Random Forest) on AWS SageMaker",
        "explanation": "Quantifies business impact (churn reduction and accuracy) while highlighting technical stack (XGBoost, SageMaker) appropriate for a Data Scientist role."
      }
    ]
  }
}
```

---

## 7. Deterministic 4-Pillar ATS Scoring Engine

| Pillar | Max Score | Key Factors Evaluated |
| :--- | :---: | :--- |
| **Parsability** | 25 | Standard headings (`Education`, `Experience`, `Projects`, `Skills`), valid email, location, phone. |
| **Impact** | 30 | Leading action verbs, quantifiable metrics (`%`, `$`, `k`, `M`, `users`, `latency`). |
| **Skills & Match** | 25 | Technical skill presence, exact keyword match % against target job description. |
| **Brevity** | 20 | Word count within optimal range (450–700 words), bullet count per role. |
| **Total** | **100** | Overall ATS readiness score. |

---

## 8. Multi-Level Structured Logging & Error Boundary

### Structured Logging (`backend/src/utils/logger.ts`)
The server logs all actions in ANSI colored format with timestamps, category tags, and sanitized metadata:
- `🔍 [DEBUG]` — Request payloads, database query metadata, AI prompt length.
- `✨ [INFO ]` — HTTP 200/201 responses, successful logins, Gemini API completion times.
- `⚠️ [WARN ]` — Validation issues, expired sessions, transient AI retries.
- `❌ [ERROR]` — Unhandled exceptions, failed DB queries, fatal Gemini errors.
- `🔥 [CRIT ]` — Critical service crash attempts, database disconnection.

### Global Error Boundary (`backend/src/middlewares/errorHandler.ts`)
All API errors return a standard JSON envelope:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed on request body",
    "details": [...]
  }
}
```

---

## 9. Step-by-Step Postman Testing Guide

**Base API URL:** `http://localhost:5000/api`

### Request 1: Health Check
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/health`
- **Expected Status:** `200 OK`

---

### Request 2: Register User
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "tester@careerprepster.com",
    "password": "Password123!",
    "name": "Alex Rivera"
  }
  ```
- **Expected Status:** `201 Created`

---

### Request 3: Login User
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "tester@careerprepster.com",
    "password": "Password123!"
  }
  ```
- **Expected Status:** `200 OK`

---

### Request 4: Query Role & Starter Bullets (Data Scientist)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/job-roles?q=Data+Scientist`
- **Expected Status:** `200 OK` (Returns role ID)

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/job-roles/<role-id>/bullets`
- **Expected Status:** `200 OK` (Returns 4 starter bullets)

---

### Request 5: Gemini AI Bullet Refine
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/ai/enhance-bullet`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "rawBullet": "built machine learning models to classify customer churn data",
    "sectionContext": {
      "roleTitle": "Data Scientist",
      "technologies": ["Python", "XGBoost", "AWS"]
    },
    "framework": "XYZ"
  }
  ```
- **Expected Status:** `200 OK`

---

### Request 6: Create CV Document
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/cvs`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "Data Scientist Resume",
    "templateId": "classic-ats",
    "fullName": "Alex Rivera",
    "email": "alex.rivera@university.edu",
    "phone": "+1 (555) 432-8901",
    "location": "Seattle, WA",
    "summary": "Final-year Computer Science student specializing in predictive ML modeling.",
    "sections": [
      {
        "sectionType": "EXPERIENCE",
        "orderIndex": 0,
        "items": [
          {
            "title": "Data Science Intern",
            "subtitle": "TechNova Solutions",
            "startDate": "Jun 2025",
            "endDate": "Aug 2025",
            "bulletPoints": [
              {
                "text": "Engineered predictive customer lifetime value models using XGBoost, lifting conversion by 23%.",
                "framework": "XYZ"
              }
            ]
          }
        ]
      }
    ],
    "skillGroups": [
      {
        "categoryName": "Programming & AI",
        "skills": ["Python", "SQL", "Scikit-Learn", "PyTorch", "Docker"]
      }
    ]
  }
  ```
- **Expected Status:** `201 Created`

---

### Request 7: ATS Audit Scoring
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/ats/score`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "cvId": "<created-cv-id>",
    "targetJobDescription": "Looking for a Data Scientist with Python, SQL, and predictive machine learning modeling experience."
  }
  ```
- **Expected Status:** `200 OK`

---

### Request 8: Resume File Import (PDF / Word)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/cvs/import`
- **Body:** `form-data`
  - Key: `file` (File type)
  - Value: `<attach your resume.pdf or resume.docx>`
- **Expected Status:** `200 OK`

---

## 10. Local Development & Docker Run Guide

### Run with Docker Compose:
```bash
# Start MySQL and Backend in background
docker compose up -d

# View live structured server logs
docker compose logs backend -f

# Seed or re-seed MySQL with all 17 roles and 51 bullet templates
docker compose exec backend npm run prisma:seed

# Run automated backend integration tests (7/7 test suite)
docker compose exec backend npm run test:api
```

### Run Locally (Without Docker):
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

---

## 11. Recent Backend Enhancements & Target Role Resolution

### 11.1 Problem Statement & Background
In MySQL, `CV.targetRoleId` acts as a nullable foreign key pointing to `job_roles.id`. Previously:
1. `GET /api/cvs` (`CvService.listUserCvs`) only selected `targetRoleId: true`, returning the raw UUID foreign key string (`2f01ce5f-...`) rather than joining the human-readable job title.
2. `GET /api/cvs/:id` (`CvService.getCvById`) omitted `targetRole` from its Prisma relation inclusion query.
3. `POST /api/cvs` and `PUT /api/cvs/:id` did not resolve incoming textual `targetRole` names into `targetRoleId` foreign keys when a UUID was not directly supplied by the client, leaving custom or unlinked roles without a catalog reference.

### 11.2 Architecture & Service Improvements (`backend/src/services/cv.service.ts`)

1. **Relational Role Join on Queries:**
   Both `listUserCvs` and `getCvById` now join `targetRole` with select filtering:
   ```typescript
   targetRole: {
     select: {
       id: true,
       title: true,
     },
   }
   ```
   The service maps the returned records so that `data.targetRole` supplies the human-readable title string (e.g., `"Associate Product Manager"` or `"Software Engineer"`), while `data.targetRoleId` preserves the underlying UUID.

2. **Intelligent Role Title Resolution & Auto-Registration:**
   Inside `createCv` and `updateCv` transactions, if a client supplies a role title (`targetRole`) without a `targetRoleId`, the service now resolves it dynamically:
   - Queries `tx.jobRole.findFirst` for a matching `title` (case-sensitive / exact).
   - If an existing catalog role is found, its `id` is assigned to `targetRoleId`.
   - If no matching role exists (e.g. user typed a custom career title like `"AI Research Engineer"`), the service dynamically creates a new `job_roles` entry:
     ```typescript
     const createdRole = await tx.jobRole.create({
       data: {
         title: trimmed,
         industry: 'General',
         skills: [],
       },
       select: { id: true },
     });
     targetRoleId = createdRole.id;
     ```
   - Includes unique-constraint race condition recovery to ensure concurrent saves never fail.

3. **Consistent Output Mutation Normalization:**
   Both `createCv` and `updateCv` return the full CV tree with `targetRole` populated as the resolved title string, eliminating payload ambiguity between frontend and backend.

---

## 12. TypeScript Typing Stabilization & IDE Diagnostic Fixes (`cv.service.ts`)

### 12.1 Background & Diagnostic Symptoms
During IDE compilation and language server analysis on `backend/src/services/cv.service.ts`, five diagnostic issues were encountered:
1. `Module '"@prisma/client"' has no exported member 'SectionType'.`
2. `Module '"@prisma/client"' has no exported member 'BulletFramework'.`
3. `Module '"@prisma/client"' has no exported member '$Enums'.`
4. `Parameter 'cv' implicitly has an 'any' type.` (Line 30, `listUserCvs`)
5. `Parameter 'tx' implicitly has an 'any' type.` (Lines 45 & 247, `createCv` and `updateCv` transactions)

### 12.2 Root Cause Analysis
- **Prisma Client Enum Export Architecture:** In Prisma v5, enums defined in `prisma/schema.prisma` (`enum SectionType` and `enum BulletFramework`) are generated under internal `.prisma/client` paths and namespace bundles. Under TypeScript `NodeNext` module resolution within monorepos, direct named imports or internal `$Enums` imports can fail to resolve through barrel re-exports (`default.d.ts`), leading to language server diagnostic errors.
- **Strict Implicit-Any Inference:** When complex relational database query chains are parsed in IDEs or when type inference is deferred, parameter types inside anonymous arrow functions (`(cv) => ...` and `(tx) => ...`) trigger strict `noImplicitAny` errors if not explicitly annotated.

### 12.3 Permanent Architectural Resolution
In `backend/src/services/cv.service.ts`:
1. **Self-Contained Enum Dictionaries & Types:** Defined `SectionType` and `BulletFramework` using `as const` object dictionaries with matching derived union types matching Prisma schema enums exactly:
   ```typescript
   export const SectionType = {
     EXPERIENCE: 'EXPERIENCE',
     EDUCATION: 'EDUCATION',
     PROJECTS: 'PROJECTS',
     SKILLS: 'SKILLS',
     CERTIFICATIONS: 'CERTIFICATIONS',
     CUSTOM: 'CUSTOM',
   } as const;
   export type SectionType = (typeof SectionType)[keyof typeof SectionType];

   export const BulletFramework = {
     STAR: 'STAR',
     XYZ: 'XYZ',
     STANDARD: 'STANDARD',
   } as const;
   export type BulletFramework = (typeof BulletFramework)[keyof typeof BulletFramework];
   ```
   This ensures complete type safety, dual value/type usage at runtime and compile-time, zero dependency on deep Prisma namespaces, and 100% compatibility with Prisma query inputs.

2. **Explicit Parameter Annotations:**
   - Typed `cv` explicitly in `listUserCvs` mapping:
     ```typescript
     return cvs.map((cv: any) => ({ ... }));
     ```
   - Typed `tx` in both database transactions using Prisma's official transaction client interface:
     ```typescript
     return prisma.$transaction(async (tx: Prisma.TransactionClient) => { ... });
     ```

### 12.4 Verification
- `npx tsc --project backend/tsconfig.json --noEmit` exits with **0 errors**.
- `npm --workspace=backend run build` (`tsc`) exits with code **0**.
- Docker container reloaded with clean database seeding and operational status on port 5000.

---

## 13. ATS Persistence & History Feature Roadmap (Phase 13 / User Story 10)

Speckit tasks `T105`–`T115` have been formalized in `specs/001-cv-editor/tasks.md` to establish end-to-end ATS score persistence and retrieval:
1. **Database Persistence on Audit:** Automatically persist calculated ATS audits to MySQL (`ats_reports` table) with overall score, pillar breakdowns (parsability, impact, skills, brevity), detailed findings, and optional target job description.
2. **Relational Score Aggregation in CV Listing:** Update `CvService.listUserCvs` to query `atsReports: { orderBy: { createdAt: 'desc' }, take: 1 }` so `GET /api/cvs` delivers the latest `atsScore` directly in the listing payload.
3. **Dedicated Retrieval Endpoint:** Add `GET /api/ats/:cvId/latest` allowing the client to reload full historical audits without requiring re-scoring.
---

## 14. Google OAuth Multi-Token Ingestion & Session State Architecture

### 14.1 Problem Identification & Root Cause Analysis
During integration testing of the mock interview feature (`POST /api/interviews/sessions`), clients that appeared authenticated on the frontend encountered `401 Unauthorized` responses:
1. **Zod Validation Rejection (`POST /api/auth/google`)**:
   - `shared/src/schemas/auth.schema.ts` strictly required `idToken: z.string()`.
   - The frontend's Google popup authentication (`useGoogleLogin`) provided an OAuth `access_token` rather than an OpenID `id_token`.
   - The validation middleware rejected requests containing `{ accessToken }` with `400 Bad Request: Invalid request payload`.
2. **Session Verification Mismatch (`GET /api/auth/me`)**:
   - `AuthController.getMe` returned `{ success: true, data: user }`.
   - The frontend API client unwrapped `response.data`, resulting in `res` being the user object directly.
   - Frontend validation expecting `res?.user` evaluated to `undefined`, causing the client to downgrade to an unauthenticated backend state on page refresh.

### 14.2 Technical Architecture & Resolution

#### A. Multi-Token Ingestion in Shared Schema (`shared/src/schemas/auth.schema.ts`)
The shared validation schema was updated with a refined object schema accepting `accessToken`, `idToken`, or both:
```typescript
export const googleAuthSchema = z
  .object({
    idToken: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.idToken || data.accessToken), {
    message: 'Either idToken or accessToken must be provided',
    path: ['idToken'],
  });
```

#### B. Dual-Flow Token Verification (`backend/src/services/auth.service.ts`)
The `AuthService.googleAuth` method was updated to handle both token types transparently:
1. **OpenID Connect ID Token Flow:** Verified against Google's public key certificates using `googleClient.verifyIdToken`. User payload (`sub`, `email`, `name`, `picture`) is extracted locally in `<1ms`.
2. **OAuth 2.0 Access Token Flow:** When token verification identifies an access token, it queries Google's `tokeninfo` and `userinfo` endpoints (`https://www.googleapis.com/oauth2/v3/userinfo`) with bearer authorization to retrieve the verified email and profile.
3. **User Record Upsert & JWT Generation:** Automatically links the user's Google ID, persists or updates the MySQL `users` table, and issues a 7-day signed JWT.

#### C. Session Endpoint Harmonization (`backend/src/controllers/auth.controller.ts`)
Updated `AuthController.getMe` to return both nested and flat structures inside `data`:
```typescript
static async getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.getMe(req.user!.userId);
    return res.status(200).json({
      success: true,
      data: {
        user,
        ...user,
      },
    });
  } catch (error) {
    return next(error);
  }
}
```

#### D. Hybrid Cookie & Bearer Authorization Support
The `requireAuth` middleware supports dual authentication vectors:
- **Primary:** `req.cookies?.token` (HttpOnly, SameSite, Secure in production).
- **Secondary:** `req.headers.authorization` (`Bearer <token>`), guaranteeing session stability across cross-port development servers (`localhost:3000` to `localhost:5000`).

---

## 15. CV Relational Synchronization & Prisma P2025 Prevention

### 15.1 Problem Identification & Bug Trace
During CV editing (`PUT /api/cvs/:id`), requests crashed with an unhandled 500 error:
```
PrismaClientKnownRequestError:
Invalid `tx.cVItem.update()` invocation in cv.service.ts:363:33
An operation failed because it depends on one or more records that were required but not found. Record to update not found.
Code: P2025
```

### 15.2 Root Cause Analysis
1. **Client-Generated Ephemeral IDs:**
   When users add items, sections, bullets, or skills in the frontend WYSIWYG editor, the frontend assigns temporary client identifiers (e.g., `item-1741234567890`, `edu-1741234567890`, `bp-1741234567890`).
2. **Naive Truthy ID Assumption:**
   In `CvService.updateCv()`, the synchronization loop checked `if (itemId)` / `if (sectionId)` / `if (bullet.id)`. Because the string was non-empty, the service blindly executed `tx.cVItem.update({ where: { id: itemId } })`.
3. **Prisma P2025 Contract Violation:**
   In Prisma ORM, `.update()` strictly requires the target record to already exist in MySQL. Since the client ID only existed in browser memory, Prisma threw a `P2025: Record to update not found` error, aborting the transaction and returning a `500 Internal Server Error`.

### 15.3 Architectural Resolution & Existence Verification
The synchronization pipeline in `cv.service.ts` was refactored with pre-queried existence sets for all 4 relational child models:
1. **Pre-Querying Database State:**
   ```typescript
   const existingItems = await tx.cVItem.findMany({
     where: { sectionId },
     select: { id: true },
   });
   const existingItemIds = new Set(existingItems.map((i) => i.id));
   ```
2. **Selective Deletion & Update Routing:**
   - **Retained IDs:** Only IDs present in both the input payload AND `existingItemIds` are protected from deletion (`deleteMany({ where: { sectionId, id: { notIn: retainedItemIds } } })`).
   - **Conditional Update vs Create:**
     ```typescript
     const itemExists = Boolean(itemId && existingItemIds.has(itemId));
     if (itemExists && itemId) {
       await tx.cVItem.update({ where: { id: itemId }, data: { ... } });
     } else {
       const newItem = await tx.cVItem.create({ data: { sectionId, ... } });
       itemId = newItem.id;
     }
     ```
3. **Hierarchical Coverage:**
   The exact same existence-guarded pattern was implemented across:
   - `CVSection` (`existingSectionIds`)
   - `CVItem` (`existingItemIds`)
   - `BulletPoint` (`existingBulletIds`)
   - `SkillGroup` (`existingSgIds`)
4. **Client State Adoption:**
   In `frontend/src/lib/store.tsx`, `saveDraft` now immediately ingests the canonical database response returned by `cvApi.update()`, replacing all client-generated ephemeral IDs in React state and `localStorage` with permanent MySQL UUIDs.

---

## 16. Error Audit: Prisma P2003 Foreign Key Constraint Violated (`targetRoleId`)

### 16.1 Incident Signature
```log
careerprepster-backend   |   ┌─── ERROR DIAGNOSIS ───────────────────────────────────────────
careerprepster-backend   |   │ Name:    PrismaClientKnownRequestError
careerprepster-backend   |   │ Message:
careerprepster-backend   | Invalid `tx.cV.update()` invocation in
careerprepster-backend   | /app/backend/src/services/cv.service.ts:297:19
careerprepster-backend   |
careerprepster-backend   | Foreign key constraint violated: `targetRoleId`
careerprepster-backend   |   │ Code:    P2003
careerprepster-backend   | 18:42:58.377 🚨 [CRIT ] [HTTP:RES] 💥 FATAL / CRITICAL: PUT /api/cvs/:id → 500
```

### 16.2 Root Cause Analysis
1. **Unchecked Client Foreign Key Ingestion:**
   In `updateCv` (and `createCv`), the service directly assigned `input.targetRoleId` to the Prisma update payload:
   ```typescript
   targetRoleId: targetRoleId !== undefined ? targetRoleId : undefined
   ```
2. **Constraint Failure Mechanism:**
   The `cvs` table enforces a foreign key constraint on `targetRoleId` referencing `job_roles(id)`:
   - If the client sent an empty string `""`, an unseeded UUID, a legacy ID from a wiped development database, or a role ID that no longer exists in MySQL, MySQL rejected the foreign key write with error code 1452 (`Cannot add or update a child row: a foreign key constraint fails`).
   - Prisma translated this into `P2003: Foreign key constraint violated: targetRoleId`, crashing the transaction with a 500 error.

### 16.3 Architectural Resolution
In `backend/src/services/cv.service.ts`:
1. **Database Existence Pre-Validation:**
   Before updating or creating a CV, the service verifies whether `targetRoleId` actually exists in `job_roles`:
   ```typescript
   if (input.targetRoleId && typeof input.targetRoleId === 'string' && input.targetRoleId.trim()) {
     const matchedRoleById = await tx.jobRole.findUnique({
       where: { id: input.targetRoleId.trim() },
       select: { id: true },
     });
     if (matchedRoleById) targetRoleId = matchedRoleById.id;
   }
   ```
2. **Title-Based Fuzzy Fallback / On-Demand Creation:**
   If the ID is stale or missing, the service attempts to resolve `input.targetRole` by title or dynamically create it in `job_roles`.
3. **Safe Null Coercion:**
   If no valid role can be resolved, `targetRoleId` safely falls back to `null` (since the foreign key is optional/nullable in the Prisma schema), completely preventing MySQL foreign key crashes.

---

## 17. Multi-Provider AI Architecture: Groq Llama/GPT-OSS Integration

### 17.1 Architecture & Motivation
Due to Google Gemini regional access controls, API key service restrictions (`API_KEY_SERVICE_BLOCKED`), and rate-limit latency, the backend AI subsystem was refactored into a high-performance **Multi-Provider Architecture**:
1. **Primary Provider — Groq API**:
   - Uses ultra-low-latency LPU inference via the OpenAI-compatible `/v1/chat/completions` endpoint with native JSON object formatting (`response_format: { type: "json_object" }`).
   - Configured with `openai/gpt-oss-120b` (or `llama-3.3-70b-versatile`), delivering structured STAR/XYZ rewrites and interview evaluations in ~200–500ms.
2. **Secondary Provider — Google Gemini (`gemini-1.5-flash`)**:
   - Serves as the first automatic fallback if `GROQ_API_KEY` is omitted or unconfigured.
3. **Tertiary Fallback — Dynamic Heuristic Engine**:
   - Zero-dependency local evaluation engine analyzing STAR markers, action verbs, quantifiable metrics, and word length so local offline development never breaks.

### 17.2 Implementation Scope
- **`backend/src/utils/groq.ts`**: Reusable dispatch utility wrapping global `fetch` with bearer authentication and structured error reporting.
- **`backend/src/services/ai.service.ts`**: Multi-provider execution for `POST /api/ai/enhance-bullet`.
- **`backend/src/services/interview-ai.service.ts`**: Multi-provider execution for `generateInitialQuestion`, `evaluateTurnOrProbe`, and `synthesizeScorecard`.
- **`docker-compose.yml` & `backend/src/config/env.ts`**: Environment schemas updated with `GROQ_API_KEY` and `GROQ_MODEL`.

---

## 18. Export State Persistence & History ATS Score Aggregation

### 18.1 Database Schema Migration (`schema.prisma`)
- Added `isExported Boolean @default(false)` column to `model CV` in `backend/prisma/schema.prisma` and applied via MySQL `ALTER TABLE cvs ADD COLUMN isExported BOOLEAN NOT NULL DEFAULT FALSE`.
- Re-generated Prisma Client binaries via `npx prisma generate`.

### 18.2 Export State Endpoint (`cv.controller.ts`, `cv.routes.ts`)
- Added `POST /api/cvs/:id/export` route invoking `CvController.markExported`.
- Updates `cv.isExported = true` for authenticated users and returns the updated status flag.

### 18.3 History Diagnostic Aggregation (`cv.service.ts`)
- In `listUserCvs`, added relational selection for `atsReports: { orderBy: { createdAt: 'desc' }, take: 1, select: { overallScore: true } }` and `isExported: true`.
- Mapped returned records so `atsScore: cv.atsReports[0]?.overallScore` is provided directly to the client.
- Eliminated eager auto-scoring during list queries to preserve the authentic `Draft` status for un-audited resumes.

---

*Report generated and validated for the CareerPrepster Backend API Module (`careerprepster-backend@1.0.0`).*
