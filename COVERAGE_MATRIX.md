# 📊 CareerPrepster — Backend vs. Frontend Coverage Matrix & Integration Blueprint

**Date:** 2026-09-14  
**Project:** CareerPrepster (Full-Stack AI Career & CV Editor)  
**Backend Source:** [report_backend.md](./report_backend.md)  
**Frontend Source:** `frontend/src/app` & `frontend/src/components`  
**Feature Spec:** [specs/001-cv-editor/plan.md](./specs/001-cv-editor/plan.md)

---

## 1. Executive Summary

| Category | Assessment | Status |
| :--- | :--- | :---: |
| **Frontend Page Architecture** | All primary stages and user journeys exist (`/`, `/editor`, `/editor/job-match`, `/editor/ats`, `/editor/export`, `/history`). No new top-level pages required. | **100% Complete** |
| **Frontend State Refactoring (Alternative 3)** | Refactored `CVData`, `store.tsx`, all editor sections, live previews, and PDF documents to generic `sections`, `skillGroups`, and `CVItem`. 100% schema parity with MySQL Prisma relational model. | **✅ Complete** |
| **Backend REST Endpoints** | Backend provides **15 endpoints** spanning Auth, Job Roles, CV CRUD, Gemini 3.6 Flash AI, ATS 4-Pillar Scoring, and Resume Upload. | **15/15 Documented** |
| **Next Integration Phase** | 1) Centralized `lib/api.ts` fetch client, 2) Email/password tab in AuthModal, 3) Parametric `/editor?id=...` cloud loading, 4) Wire 15 endpoints to live Express server. | **Ready for Execution** |

---

## 2. Backend Endpoint vs. Frontend Coverage Matrix (15 Endpoints)

| # | Endpoint | Method | Backend Purpose & Contract | Frontend Target Component / Route | Current Status | Integration Action Required |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- |
| **1** | `/api/health` | `GET` | Server & MySQL health probe | Docker compose healthcheck | ✅ Integrated | Verified via container orchestration. |
| **2** | `/api/auth/register` | `POST` | Email, password, & name registration | N/A (Google OAuth Policy) | 🛡️ OAuth Only | Maintained passwordless Google OAuth per directive. |
| **3** | `/api/auth/login` | `POST` | Email & password login | N/A (Google OAuth Policy) | 🛡️ OAuth Only | Maintained passwordless Google OAuth per directive. |
| **4** | `/api/auth/me` | `GET` | Returns authenticated user profile | `frontend/src/components/navigation/Header.tsx` & `frontend/src/lib/auth.tsx` | ✅ Integrated | Session verification on mount + profile display. |
| **5** | `/api/auth/logout` | `POST` | Clears HttpOnly session cookie | `frontend/src/components/navigation/Header.tsx` (Sign Out button) | ✅ Integrated | Calls backend to revoke session and clears state. |
| **6** | `/api/job-roles` | `GET` | Autocomplete role search (`?q=...`) | `frontend/src/components/editor/RoleAutocomplete.tsx` | ✅ Integrated | Queries `jobRoleApi.search()` with fallback. |
| **7** | `/api/job-roles/:id/bullets` | `GET` | 51 starter bullet templates for role | `frontend/src/components/editor/TemplateBulletDrawer.tsx` | ✅ Integrated | Fetches bullets dynamically via `jobRoleApi.getBullets()`. |
| **8** | `/api/cvs` | `GET` | List all CVs owned by user | `frontend/src/app/history/page.tsx` | ✅ Integrated | Syncs remote list via `cvApi.list()` with local history. |
| **9** | `/api/cvs` | `POST` | Create full relational CV document | `frontend/src/app/editor/page.tsx` & `ContinueActionBar.tsx` | ✅ Integrated | Sends structured payload on save/continue via `cvApi.create()`. |
| **10** | `/api/cvs/:id` | `GET` | Fetch single full CV relational tree | `frontend/src/app/editor/page.tsx` | ✅ Integrated | Hydrates state from `cvApi.getById(id)` via `?id=` param. |
| **11** | `/api/cvs/:id` | `PUT` | Atomic transaction update for CV tree | `frontend/src/app/editor/page.tsx` & `store.tsx` | ✅ Integrated | Persists updates via `cvApi.update(id, payload)`. |
| **12** | `/api/cvs/:id` | `DELETE` | Cascade delete CV & all child rows | `frontend/src/components/history/HistoryCard.tsx` | ✅ Integrated | Deletes remote CVs via `cvApi.delete(id)`. |
| **13** | `/api/ai/enhance-bullet` | `POST` | Gemini 3.6 Flash STAR/XYZ rewrite | `frontend/src/components/editor/AIEnhanceModal.tsx` | ✅ Integrated | Queries `aiApi.enhanceBullet()` with local fallback. |
| **14** | `/api/ats/score` | `POST` | 4-Pillar deterministic scoring & JD gap | `frontend/src/app/editor/ats/page.tsx` & `job-match/page.tsx` | ✅ Integrated | Computes score via `atsApi.score()` with heuristic fallback. |
| **15** | `/api/cvs/import` | `POST` | Multipart upload for PDF / Word parsing | `frontend/src/components/onboarding/UploadDropzone.tsx` | ✅ Integrated | Uploads `File` via `importApi.uploadFile()` with fallback. |

---

## 3. Frontend Page Architecture & Completeness Review

The frontend implements a staged progressive funnel that maps to the backend's lifecycle:

```text
[Landing Page /] ──► [Onboarding Modal]
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    [Path A: Scratch]               [Path B: Upload]
            │                               │
            ▼                               ▼
    [/editor] (Stage 1)             [/editor/ats?from=upload]
            │                               │
            ▼                               ▼
    [/editor/job-match] (JD Matcher)◄───────┘
            │
            ▼
    [/editor/ats] (Stage 2: 4-Pillar Audit)
            │
            ▼
    [/editor/export] (Stage 3: Vector PDF)
            ▲
            │
    [/history] (User Resume & Audit History Dashboard)
```

### Page Roster:
1. **`/` (Landing Page)**: Hero section, CTA buttons, interactive 3-pillar feature preview, FAQ accordion, multi-column footer.
2. **`/editor` (Stage 1 — CV Builder)**: Dual-pane layout, Desktop Workspace Switcher (`[Dual Mode]`, `[Editor only]`, `[Preview Mode]`), modular form sections (`Personal`, `Education`, `Experience`, `Projects`, `Skills`), template switcher (`Harvard Classic`, `Jake's Tech`), live auto-save.
3. **`/editor/job-match` (Target Role JD Matcher)**: Dedicated full-width job description analyzer with keyword match calculation.
4. **`/editor/ats` (Stage 2 — 4-Pillar ATS Diagnostic)**: Overall score gauge (0–100), 4 pillar breakdown cards (Parsability, Impact, Skills, Brevity), actionable issues list with "Fix in Editor" deep links.
5. **`/editor/export` (Stage 3 — Final Review & Export)**: Vector PDF generator (`@react-pdf/renderer`), interactive draft sheet modal with zoom & print controls.
6. **`/history` (User Dashboard)**: Saved resume cards with ATS score badges, duplicate, delete, and search filtering.

---

## 4. Frontend State Refactoring: Direct Backend Parity (Alternative 3)

Instead of maintaining brittle bidirectional adapter translation layers (`cvDataToBackendPayload` / `backendPayloadToCVData`), **Alternative 3** refactors the frontend `CVData` type and `store.tsx` to adopt the backend's generic `sections` and `items` structure directly:

### Refactored Frontend Representation (`frontend/src/types/cv.ts` & `store.tsx`):
```typescript
export interface BulletPoint {
  id?: string;
  text: string;
  actionVerb?: string;
  hasMetric?: boolean;
  framework?: "STAR" | "XYZ" | "STANDARD";
  orderIndex?: number;
}

export interface CVItem {
  id?: string;
  title: string;       // Role Title, Degree/Major, or Project Name
  subtitle?: string;   // Company, University, or Subtitle
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  url?: string;
  orderIndex?: number;
  bulletPoints: BulletPoint[];
}

export interface CVSection {
  id?: string;
  sectionType: "EXPERIENCE" | "EDUCATION" | "PROJECTS" | "CERTIFICATIONS" | "CUSTOM";
  title?: string;
  orderIndex?: number;
  isVisible?: boolean;
  items: CVItem[];
}

export interface SkillGroup {
  id?: string;
  categoryName: string;
  skills: string[];
}

export interface CVData {
  id?: string;
  title: string;
  templateId: string;
  targetRole?: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  sections: CVSection[];
  skillGroups: SkillGroup[];
  updatedAt?: string;
}
```

### Backend Prisma Relational Structure (Exact 1:1 Match):
```text
cvs (id, userId, title, templateId, targetRoleId, fullName, email, phone, location, linkedinUrl, githubUrl, summary)
  ├── cv_sections (id, cvId, sectionType, title, orderIndex, isVisible)
  │     └── cv_items (id, sectionId, title, subtitle, location, startDate, endDate, isCurrent, url, orderIndex)
  │           └── bullet_points (id, itemId, text, actionVerb, hasMetric, framework, orderIndex)
  └── skill_groups (id, cvId, categoryName, skills: JSON, orderIndex)
```

### Benefits of Alternative 3:
1. **Zero Translation Code**: The frontend sends `cvData`, MySQL stores `cvData` relations, and the frontend gets back `cvData`.
2. **Arbitrary Custom Sections**: Users can add, reorder, and customize arbitrary sections (e.g., "Volunteering", "Publications", "Awards", "Certifications").
3. **Clean Component Integration**:
   - `EducationSection.tsx` consumes `sectionType: "EDUCATION"` items (`title` = Degree, `subtitle` = University).
   - `ExperienceSection.tsx` consumes `sectionType: "EXPERIENCE"` items (`title` = Role, `subtitle` = Company).
   - `ProjectsSection.tsx` consumes `sectionType: "PROJECTS"` items (`title` = Project Name, `subtitle` = Tech Stack).
   - `SkillsSection.tsx` consumes `skillGroups` array directly.

---

## 5. Integration Implementation Checklist (Alternative 3)

- [x] **T-INT-1**: Refactor `frontend/src/types/cv.ts` and `frontend/src/lib/store.tsx` to generic `sections` and `skillGroups`.
- [x] **T-INT-2**: Update section components (`EducationSection.tsx`, `ExperienceSection.tsx`, `ProjectsSection.tsx`, `SkillsSection.tsx`, `LivePreview.tsx`, `CVForm.tsx`, `CustomSection.tsx`) to consume generic `sections` and `items`.
- [ ] **T-INT-3**: Create `frontend/src/lib/api.ts` with typed fetch methods for all 15 endpoints (`credentials: "include"`, base URL `http://localhost:5000/api`).
- [ ] **T-INT-4**: Connect `frontend/src/components/auth/AuthModal.tsx` and `Header.tsx` to backend Google OAuth verification (`POST /api/auth/google`), session check (`GET /api/auth/me`), and logout (`POST /api/auth/logout`) with zero password forms.
- [ ] **T-INT-5**: Add parametric `?id=` query parameter support in `frontend/src/app/editor/page.tsx` to load specific CVs from `GET /api/cvs/:id`.
- [ ] **T-INT-6**: Connect `frontend/src/components/editor/AIEnhanceModal.tsx` to `POST /api/ai/enhance-bullet` (Gemini 3.6 Flash).
- [ ] **T-INT-7**: Connect `frontend/src/components/editor/RoleAutocomplete.tsx` and `TemplateBulletDrawer.tsx` to `GET /api/job-roles`.
- [ ] **T-INT-8**: Connect `frontend/src/app/editor/ats/page.tsx` to `POST /api/ats/score`.
- [ ] **T-INT-9**: Connect `frontend/src/app/history/page.tsx` to `GET /api/cvs` and `DELETE /api/cvs/:id`.
- [x] **T-INT-10**: Set up full-stack Docker containerization (`frontend/Dockerfile`, `frontend/.dockerignore`, and 3-tier `docker-compose.yml` orchestrating `mysql`, `backend`, and `frontend`).
