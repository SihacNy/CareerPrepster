# CareerPrepster Backend Documentation

This document provides a comprehensive technical guide to the **CareerPrepster Backend API**, covering architecture, business logic (services), validation rules, frontend UI mappings, and Postman testing procedures.

---

## 1. System Architecture & Tech Stack

```text
┌───────────────────────────────┐
│     Client / Frontend App     │ (Next.js / React / Postman)
└───────────────┬───────────────┘
                │ HTTP Requests (JSON / Multipart Form Data)
                ▼
┌───────────────────────────────┐
│       Express API Server      │ Port: 5000
│  ├── Helmet (Security)        │
│  ├── CORS (Cross-Origin)      │
│  ├── Cookie-Parser & JWT Auth │
│  ├── Zod Request Validation   │
│  └── Centralized Error Handler│
└───────────────┬───────────────┘
                │
    ┌───────────┴───────────┬──────────────────────┬──────────────────────┐
    ▼                       ▼                      ▼                      ▼
┌──────────────┐     ┌──────────────┐      ┌──────────────┐       ┌──────────────┐
│  Controller  │     │   Service    │      │  Prisma ORM  │       │ Google Cloud │
│ (HTTP Router)│ ──> │(Logic Engine)│ ───> │   & MySQL    │       │  OAuth & AI  │
└──────────────┘     └──────────────┘      └──────────────┘       └──────────────┘
```

### Core Technologies
- **Runtime**: Node.js (ES Modules, TypeScript)
- **Web Framework**: Express.js
- **Database & ORM**: MySQL 8.0 with Prisma ORM v5
- **Authentication**: Google OAuth 2.0 (`google-auth-library`) with Stateless JWT (`jsonwebtoken`)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-3.6-flash`)
- **Document Parsers**: `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction), `multer` (file streaming)
- **Validation**: Zod schema validation

### API Endpoints Summary (14 Endpoints Total)
- 🏥 **System & Health**: 1 endpoint (`/api/health`)
- 🔐 **Authentication (Google OAuth)**: 3 endpoints (`/api/auth/*`)
- 📄 **CV Management & Import**: 6 endpoints (`/api/cvs/*`)
- 💼 **Job Role Catalog**: 2 endpoints (`/api/job-roles/*`)
- 🤖 **AI & ATS Services**: 2 endpoints (`/api/ai/*`, `/api/ats/*`)
- **Total: 14 Endpoints | 6 Controllers | 6 Services | 9 Database Tables**

---

## 2. Controller-Service Architecture Explained

The backend follows the **Separation of Concerns** principle:

1. **Routes & Middleware**: Intercept requests, enforce authentication (`requireAuth`), and validate inputs (`validate(schema)`).
2. **Controllers**: Act as the "Front Desk". They extract `req.body` and `req.params`, call the service function, and return standardized JSON responses (`{ success: true, data: ... }`).
3. **Services**: Act as the "Brain". They contain 100% of the business rules, SQL transactions, external API integrations (Gemini AI, Google OAuth), and security ownership validations.

---

## 3. Services & Business Logic (In Simple Terms)

### 1. `AuthService` ([`auth.service.ts`](file:///d:/Ai_project/CareerPrepster/backend/src/services/auth.service.ts))
- **Google OAuth Verification**: Accepts Google's encrypted `idToken` from the client and verifies its cryptographic signature with Google's public keys.
- **Smart Account Linking / Creation**: Extracts verified user details (`email`, `googleId`, `name`, `avatarUrl`). If the user exists in MySQL, it logs them in; if new, it creates their account.
- **JWT Session Issuance**: Issues an encrypted JSON Web Token (JWT) and sets it in an `httpOnly` secure cookie and authorization header.

### 2. `CvService` ([`cv.service.ts`](file:///d:/Ai_project/CareerPrepster/backend/src/services/cv.service.ts))
- **Starter Template Generation**: When creating a new CV, automatically seeds the 4 core sections (`EDUCATION`, `EXPERIENCE`, `PROJECTS`, `SKILLS`) and default skill groups.
- **Atomic `$transaction` Syncing**: When saving or updating a CV, performs an all-or-nothing database transaction that updates header fields, creates/deletes/reorders sections, updates items, and stores individual bullet points with their frameworks.
- **Strict Ownership Control**: Ensures a student can only read, update, or delete their own CVs (`cv.userId === userId`).

### 3. `ATSService` ([`ats.service.ts`](file:///d:/Ai_project/CareerPrepster/backend/src/services/ats.service.ts))
- **4-Pillar Deterministic Scoring Engine** (0 – 100 Score):
  - **Parsability & Header Structure (25 pts)**: Checks legal full name, valid email format, phone, location, and standard section headings.
  - **Impact & Quantification (30 pts)**: Audits bullet points for power action verbs (e.g. *Architected*, *Spearheaded*) and measurable metrics (percentages, dollar amounts, scale).
  - **Skill Relevance & Keywords (25 pts)**: Evaluates categorized skill density and matches against target job descriptions.
  - **Brevity & Formatting (20 pts)**: Penalizes run-on sentences (>250 chars) and overly short bullets (<20 chars).
- **Dual-Mode Scoring**: Can score a CV from a stored database ID (`cvId`) or from raw in-memory JSON (`cvData`) for guest visitors.
- **Report Persistence**: Automatically saves audit findings and scores to the `ats_reports` table.

### 4. `AIService` ([`ai.service.ts`](file:///d:/Ai_project/CareerPrepster/backend/src/services/ai.service.ts))
- **Google Gemini Prompt Engineering**: Takes a student's rough draft bullet point and rewrites it into high-impact recruiter formulas:
  - **XYZ Formula**: *Accomplished [X], as measured by [Y], by doing [Z]*.
  - **STAR Formula**: *Situation, Task, Action, Result*.
- **Structured JSON Output**: Uses Gemini's JSON schema mode to guarantee return of structured suggestions containing `{ id, actionVerb, framework, enhancedText, explanation }`.

### 5. `ImportService` ([`import.service.ts`](file:///d:/Ai_project/CareerPrepster/backend/src/services/import.service.ts))
- **Document Parsing**: Accepts uploaded `.pdf`, `.docx`, or `.txt` files up to 5MB via Multer.
- **Text Extraction & Heuristics**: Uses regex patterns to automatically parse candidate name, email, phone, university degrees, past companies, and categorized skills into a draft CV ready for the editor.

### 6. `JobRoleService` ([`job-role.service.ts`](file:///d:/Ai_project/CareerPrepster/backend/src/services/job-role.service.ts))
- **Role Catalog**: Lists curated tech job roles (e.g., *Frontend Engineer*, *Backend Developer*, *Data Engineer*).
- **Starter Bullet Library**: Returns pre-authored STAR and XYZ bullet templates organized by industry and skill category.

---

## 4. Route Mapping: What Serves What in the Frontend (14 Endpoints)

| # | HTTP Method | Route URL | Auth Required | Purpose / Frontend Screen Served |
| :-: | :--- | :--- | :---: | :--- |
| **1** | **`GET`** | `/api/health` | No | System health check / Docker health monitor |
| **2** | **`POST`** | `/api/auth/google` | No | **Sign In with Google Modal** (`AuthModal.tsx`): Authenticates user & issues session cookie |
| **3** | **`GET`** | `/api/auth/me` | **Yes** | **App Header & Profile** (`Header.tsx`): Displays user name, avatar, and login status |
| **4** | **`POST`** | `/api/auth/logout` | No | **Header Logout Button**: Destroys session cookie |
| **5** | **`POST`** | `/api/cvs/import` | No | **Onboarding Dropzone** (`UploadDropzone.tsx`): Uploads resume file and pre-fills editor |
| **6** | **`GET`** | `/api/cvs` | **Yes** | **User Dashboard**: Lists all CVs saved by the logged-in user |
| **7** | **`POST`** | `/api/cvs` | **Yes** | **Editor Initialization** (`/editor`): Creates new blank CV and generates starter sections |
| **8** | **`GET`** | `/api/cvs/:id` | **Yes** | **CV Editor Loading** (`/editor?id=...`): Loads full CV with sections and latest ATS score |
| **9** | **`PUT`** | `/api/cvs/:id` | **Yes** | **Save / Auto-Save Bar** (`ContinueActionBar.tsx`): Saves all sections, items, and bullets |
| **10** | **`DELETE`**| `/api/cvs/:id` | **Yes** | **Dashboard Delete Action**: Permanently deletes a CV and its relations |
| **11** | **`GET`** | `/api/job-roles` | No | **Role Selector** (`RoleAutocomplete.tsx`): Autocompletes target roles and skills |
| **12** | **`GET`** | `/api/job-roles/:id/bullets`| No | **Template Drawer** (`TemplateBulletDrawer.tsx`): Displays pre-written bullet suggestions |
| **13** | **`POST`** | `/api/ai/enhance-bullet` | Optional | **AI Enhance Modal** (`AIEnhanceModal.tsx`): Generates 3 XYZ/STAR bullet variations via Gemini |
| **14** | **`POST`** | `/api/ats/score` | Optional | **ATS Review Stage** (`ATSScoringStage.tsx`): Calculates score gauge & actionable findings |

---

## 5. Input Validation (Zod Schemas)

Every endpoint strictly validates incoming payloads before execution. If validation fails, a `400 VALIDATION_ERROR` response is returned with specific field errors.

### 1. `googleAuthSchema`
```typescript
{
  idToken: string (min 10 characters) // Cryptographic token from Google Sign-In
}
```

### 2. `createCvSchema`
```typescript
{
  title: string (default: "Untitled CV"),
  templateId: string (default: "classic-ats"),
  fullName: string (required),
  email: string (valid email format),
  phone: string? (optional),
  location: string? (optional),
  websiteUrl: string? (optional),
  linkedinUrl: string? (optional),
  githubUrl: string? (optional),
  summary: string? (optional)
}
```

### 3. `enhanceBulletSchema`
```typescript
{
  rawBullet: string (min 5, max 500 characters),
  sectionContext: {
    roleTitle?: string,
    organization?: string,
    technologies?: string[]
  }?,
  framework: "STAR" | "XYZ" | "AUTO" (default: "XYZ")
}
```

### 4. `scoreCvSchema`
```typescript
{
  cvId?: string (UUID of saved CV in MySQL),
  cvData?: object (Raw in-memory CV data for guest mode),
  targetJobDescription?: string (max 10,000 characters)
}
```

---

## 6. Postman Testing Guide

Two test files are provided in the repository:
1. **Collection**: [`CareerPrepster.postman_collection.json`](file:///d:/Ai_project/CareerPrepster/backend/CareerPrepster.postman_collection.json)
2. **Environment**: [`CareerPrepster.postman_environment.json`](file:///d:/Ai_project/CareerPrepster/backend/CareerPrepster.postman_environment.json)

### Standard Testing Flow:

```text
1. Health Check (GET /api/health)
      │
      ▼
2. Google OAuth Login (POST /api/auth/google) ──> Auto-saves {{token}}
      │
      ▼
3. Create CV (POST /api/cvs) ───────────────────> Auto-saves {{cvId}}
      │
      ▼
4. Enhance a Bullet (POST /api/ai/enhance-bullet)
      │
      ▼
5. Update CV with Enhanced Bullet (PUT /api/cvs/{{cvId}})
      │
      ▼
6. Run ATS Audit (POST /api/ats/score using {{cvId}})
      │
      ▼
7. Verify in Database (GET /api/cvs/{{cvId}} or Prisma Studio)
```

---

## 7. Database Schema & Tables

```prisma
// 1. User & Authentication
model User {
  id        String      @id @default(uuid())
  email     String      @unique
  name      String?     @db.VarChar(100)
  avatarUrl String?     @db.VarChar(500)
  googleId  String?     @unique @db.VarChar(100)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  cvs       CV[]
  atsReports ATSReport[]
  @@map("users")
}

// 2. CV Document Root
model CV {
  id           String        @id @default(uuid())
  userId       String
  title        String        @default("Untitled CV")
  templateId   String        @default("classic-ats")
  fullName     String
  email        String
  phone        String?
  location     String?
  summary      String?       @db.Text
  sections     CVSection[]
  skillGroups  SkillGroup[]
  atsReports   ATSReport[]
  @@map("cvs")
}

// 3. Sections & Items
model CVSection {
  id          String      @id @default(uuid())
  cvId        String
  sectionType SectionType // EXPERIENCE, EDUCATION, PROJECTS, SKILLS, etc.
  customTitle String?
  orderIndex  Int         @default(0)
  isVisible   Boolean     @default(true)
  items       CVItem[]
  @@map("cv_sections")
}

// 4. Section Items & Bullets
model CVItem {
  id          String        @id @default(uuid())
  sectionId   String
  title       String        // Job title, Degree name, Project name
  subtitle    String?       // Company, University
  startDate   String?
  endDate     String?
  isCurrent   Boolean       @default(false)
  bulletPoints BulletPoint[]
  @@map("cv_items")
}

model BulletPoint {
  id         String          @id @default(uuid())
  itemId     String
  text       String          @db.Text
  actionVerb String?
  hasMetric  Boolean         @default(false)
  framework  BulletFramework @default(STANDARD) // STAR, XYZ, STANDARD
  @@map("bullet_points")
}
```

---

## 8. Running the Backend Locally

### Option A: With Docker (Recommended)
```powershell
# Start MySQL & Backend containers
docker compose up -d

# View live logs
docker compose logs -f backend
```

### Option B: Local Node.js Development
```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Database Visualizer:
```powershell
cd backend
npx prisma studio
# Opens web interface at http://localhost:5555
```
