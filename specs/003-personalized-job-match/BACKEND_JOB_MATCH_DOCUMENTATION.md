# Personalized Job Match: Backend Architecture & API Documentation

**Feature**: Personalized Job Match (Backend)  
**Version**: 1.0.0  
**Last Updated**: 2026-09-30  
**Stack**: Express 4 (ESM), Prisma 5, MySQL 8, Google Gemini AI (`gemini-3.6-flash`), Zod  

---

## 1. Executive Summary

The **Personalized Job Match** backend delivers intelligent, explainable job recommendations to university students and early-career candidates. It decouples heavy web scraping and AI batch evaluation from user-facing HTTP request cycles:
- **Background Ingestion**: Scrapes and normalizes vacancies from LinkedIn and curated feeds with SHA-256 deduplication.
- **Explainable Matching**: Combines a deterministic 4-pillar scoring algorithm with Google Gemini semantic evaluation.
- **Fast Delivery**: Dashboard queries read pre-computed recommendations from MySQL in **<50ms**.

---

## 2. System Architecture & Component Workflow

```
[External Sources: LinkedIn Public Search & Curated Tech Feeds]
                              │
                              ▼
            1. JobDiscoveryService (Background Worker)
            ├── LinkedInJobProvider: Public search scraping by role
            ├── SeedJobProvider: Curated student tech vacancies & logos
            └── Deduplication: SHA-256(company|title|location)
                              │
                              ▼
                      [MySQL: job_listings]
                              │
                              ▼
             2. JobMatchingService (Background Worker)
            ├── Reads User's Parsed CV (Skills, Experience, Projects)
            ├── Multi-Pillar Scoring (Skills 40%, Role 25%, Exp 20%, Pref 15%)
            └── Google Gemini AI (AIService.evaluateJobMatch)
                              │
                              ▼
             [MySQL: job_match_recommendations]
                              │
                              ▼
          3. Express REST API (/api/jobs/recommendations)
            ├── Instant response (<50ms)
            ├── Multi-facet filtering & sorting
            └── Application tracking (Save, Apply, Dismiss)
```

---

## 3. Database Schema (Prisma ORM)

Four new relational models were added to [backend/prisma/schema.prisma](file:///d:/CamtechUniversity/ProgrammingYearIIITerm3/CVPrepster/backend/prisma/schema.prisma):

### `JobListing`
Represents normalized job vacancies collected from external platforms.
* `id`: UUID (Primary Key)
* `title`: Job title (e.g., *"Junior Frontend Developer"*)
* `company`: Employer name
* `logoUrl`: Direct image URL for company logo/avatar
* `location`: String location (e.g., *"Phnom Penh, Cambodia"*)
* `workArrangement`: Enum (`REMOTE`, `HYBRID`, `ON_SITE`)
* `employmentType`: Enum (`FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT`)
* `description`: Sanitized job requirements and details
* `requiredSkills` & `preferredSkills`: JSON string arrays
* `minExperienceYears`: Integer required tenure
* `sourcePlatform`: String identifier (`"linkedin"`, `"seed"`)
* `applicationUrl`: Verified canonical link to the original listing
* `dedupHash`: Unique SHA-256 hash preventing duplicate listings
* `isActive`: Boolean availability flag
* `postedAt`, `discoveredAt`, `lastSeenAt`: Audit timestamps

### `JobMatchRecommendation`
Stores per-user evaluated recommendations.
* `id`: UUID (Primary Key)
* `userId`: Reference to candidate (`User`)
* `cvId`: Reference to evaluated resume (`CV`)
* `jobListingId`: Reference to vacancy (`JobListing`)
* `overallScore`: Integer (0–100)
* `skillsScore`, `experienceScore`, `roleScore`, `preferenceScore`: Sub-scores (0–100)
* `matchedSkills`: JSON array of matching skills
* `missingSkills`: JSON array of missing required skills
* `matchReasons`: JSON object containing:
  * `summary`: Executive assessment of fit
  * `evidenceReasons`: Statements connecting CV projects to job needs
  * `skillGaps`: Array of `{ skill, criticality, recommendation }`
* `status`: Enum (`ACTIVE`, `SAVED`, `DISMISSED`, `APPLIED`, `INTERVIEWING`, `ARCHIVED`)
* `userNotes`: Candidate personal tracking notes

### `JobSearchPreference`
Stores candidate search criteria.
* `userId`: Unique reference to candidate
* `desiredRoles`: JSON array of target titles
* `preferredLocations`: JSON array of cities/countries
* `preferredArrangement`: Preferred work style (`REMOTE`, `HYBRID`, `ON_SITE`)
* `minSalary`: Minimum salary expectations
* `notifyDaily`: Boolean notification flag

### `JobDiscoveryRun`
Audit trail for background scraping cycles.
* `sourcePlatform`, `status` (`RUNNING`, `SUCCEEDED`, `FAILED`)
* `jobsScanned`, `jobsInserted`, `jobsUpdated`, `jobsExpired`
* `startedAt`, `completedAt`, `errorSummary`

---

## 4. Background Ingestion & LinkedIn Scraping

### `JobDiscoveryService`
* Located at: [backend/src/services/job-discovery.service.ts](file:///d:/CamtechUniversity/ProgrammingYearIIITerm3/CVPrepster/backend/src/services/job-discovery.service.ts)
* **Deduplication Formula**:
  $$\text{dedupHash} = \text{SHA256}(\text{company.toLowerCase()} + "|" + \text{title.toLowerCase()} + "|" + \text{location.toLowerCase()})$$
* If an incoming job matches an existing `dedupHash`, it updates `lastSeenAt = NOW()` and `isActive = true`. No duplicate record is created.

### `LinkedInJobProvider`
* Located at: [backend/src/services/providers/linkedin.provider.ts](file:///d:/CamtechUniversity/ProgrammingYearIIITerm3/CVPrepster/backend/src/services/providers/linkedin.provider.ts)
* Queries LinkedIn public guest job search endpoints without bypassing auth controls.
* Extracts:
  * Job title, company name, location
  * Company logo image URL (or fallback)
  * Direct canonical application link (`base-card__full-link`)
  * Work arrangement and required tech skills
* Resilient: If LinkedIn rate limits or times out, it gracefully falls back without crashing the worker.

---

## 5. Explainable Matching & Google Gemini AI

### Multi-Pillar Scoring Formula (0–100):
$$\text{Score} = (40\% \times S_{\text{skills}}) + (25\% \times S_{\text{role}}) + (20\% \times S_{\text{exp}}) + (15\% \times S_{\text{pref}})$$

| Pillar | Weight | Basis |
| :--- | :---: | :--- |
| **Skills Alignment** | **40%** | Overlap between CV `SkillGroup` items, project keywords, and job requirements. |
| **Role Alignment** | **25%** | Similarity between CV `targetRole` and job vacancy title. |
| **Experience Tenure** | **20%** | Candidate project/work duration vs. minimum years required. |
| **Preferences Fit** | **15%** | Remote vs. Hybrid vs. On-site alignment. |

### Google Gemini Semantic Analysis
* Located in [backend/src/services/ai.service.ts](file:///d:/CamtechUniversity/ProgrammingYearIIITerm3/CVPrepster/backend/src/services/ai.service.ts) (`AIService.evaluateJobMatch`).
* Prompted as an Executive Career Coach, Gemini reads:
  * The candidate's actual projects, work experience, and verified skills.
  * The employer's raw job description and requirements.
* Produces structured JSON:
  * `summary`: Executive assessment of candidate fit.
  * `evidenceReasons`: Factual statements connecting candidate projects to job needs.
  * `skillGaps`: Actionable suggestions for missing competencies.
* Includes automatic deterministic fallback if the AI key is unconfigured or times out.

---

## 6. Background Scheduling & Cooldown Control

* Located at: [backend/src/services/job-queue.service.ts](file:///d:/CamtechUniversity/ProgrammingYearIIITerm3/CVPrepster/backend/src/services/job-queue.service.ts)
* **Daily Cron**: Automatically triggers daily at **02:00 Asia/Phnom_Penh (UTC+7)**.
* **Manual Refresh Cooldown**: Enforces a **15-minute (900s)** per-user cooldown to prevent server abuse.
* **Non-Blocking**: Asynchronous dispatch (`setImmediate`) allows HTTP requests to return `202 Accepted` immediately while matching finishes in the background.

---

## 7. REST API Endpoints

All endpoints (except discovery trigger and dev login) require JWT authentication (`token` cookie or `Authorization: Bearer <token>`).

### 1. `GET /api/jobs/recommendations`
* **Query Parameters**: `status`, `minScore`, `arrangement`, `employmentType`, `search`, `sortBy`, `sortOrder`, `page`, `limit`.
* **Behavior**: If a user has 0 recommendations, it evaluates matches automatically.
* **Response**: Paginated items with company logo, match percentage, matched skills, missing skills, and apply link.

### 2. `GET /api/jobs/recommendations/:id`
* **Response**: Detailed requirement breakdown with 4-pillar scores, AI evidence reasons, and skill gap remediation advice.

### 3. `PATCH /api/jobs/recommendations/:id/status`
* **Body**: `{ "status": "SAVED" | "DISMISSED" | "APPLIED" | "INTERVIEWING" | "ARCHIVED", "userNotes": string }`
* **Use**: Bookmarking, dismissing, or tracking application stages.

### 4. `GET /api/jobs/preferences`
* **Response**: Candidate target roles, locations, and arrangement preferences.

### 5. `PUT /api/jobs/preferences`
* **Body**: `UpdateJobPreferencesSchema`
* **Behavior**: Saves criteria and triggers asynchronous recommendation recalculation.

### 6. `POST /api/jobs/refresh`
* **Response**: `202 Accepted` (or `429 Too Many Requests` if cooldown is active).

### 7. `GET /api/jobs/refresh/status`
* **Response**: `{ status: "IDLE"|"PROCESSING"|"COMPLETED", cooldownSecondsRemaining: N }`.

### 8. `POST /api/jobs/admin/discover`
* **Body** (optional): `{ "keywords": string, "location": string }`
* **Behavior**: Manually triggers scraping and returns scanned/inserted/updated stats.

### 9. `POST /api/auth/dev-login` (Development Only)
* **Body** (optional): `{ "email": string }`
* **Behavior**: Issues a valid JWT token and sets the session cookie for seamless testing in Postman.

---

## 8. Postman Testing Guide

* **Collection File**: [backend/CareerPrepster_JobMatch_Only.postman_collection.json](file:///d:/CamtechUniversity/ProgrammingYearIIITerm3/CVPrepster/backend/CareerPrepster_JobMatch_Only.postman_collection.json)
* **Testing Sequence**:
  1. Run **`0. Quick Authentication` $\rightarrow$ `Dev Sign-In`**: Sets cookie and populates `{{token}}`.
  2. Run **`1. Job Discovery` $\rightarrow$ `Trigger Discovery`**: Scrapes and seeds vacancies.
  3. Run **`2. Candidate Recommendations` $\rightarrow$ `List Recommendations (Active)`**: Returns cards and sets `{{recommendationId}}`.
  4. Run **`Get Recommendation Details`**: Tests AI evidence reasoning and gap analysis.
  5. Run **`Opportunity Pipeline` $\rightarrow$ `Save / Bookmark Job`**: Tests pipeline status updates.
