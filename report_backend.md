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
