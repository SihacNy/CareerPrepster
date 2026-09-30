# Implementation Plan: Personalized Job Match

**Branch**: `module/cv-editor` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-personalized-job-match/spec.md`

---

## Summary

The Personalized Job Match feature provides university students and early-career job seekers on CVPrepster with an intelligent, explainable job recommendation dashboard similar to LinkedIn's personalized recommendations. Recommendations are evaluated against the candidate's parsed CV competencies, technical skills, work experience, desired roles, and remote/location preferences.

The architecture decouples heavy background ingestion and matching computation from the user-facing HTTP request cycle:
1. **Background Discovery & Ingestion**: Pluggable, source-independent providers (RemoteOK, Arbeitnow, Seed catalog, and an authorized LinkedIn partner interface) discover and normalize job vacancies. Automated daily runs are scheduled at 02:00 Asia/Phnom_Penh (19:00 UTC) with deterministic deduplication (`dedupHash`) and lifecycle tracking.
2. **Explainable Match Engine**: Computes a multi-pillar alignment score (0–100) across skills (40%), role/seniority (25%), experience tenure (20%), and preferences (15%), augmented with structured qualitative evidence from Google Gemini. Scores are explicitly presented as alignment metrics rather than hiring probabilities.
3. **Responsive Candidate Dashboard**: A Next.js dashboard (`/jobs`) supporting multi-facet filtering, sorting, bookmarking ("Saved"), dismissals, application status tracking, and on-demand refresh with a 15-minute cooldown.

All entities persist in MySQL via Prisma ORM across 4 new relational tables (`job_listings`, `job_match_recommendations`, `job_search_preferences`, `job_discovery_runs`), strictly isolated by `userId`.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS  
**Frontend Framework**: Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide React icons  
**Backend Framework**: Node.js + Express 4 (NodeNext ESM, `"type": "module"`)  
**Database & ORM**: MySQL 8.0, Prisma ORM 5.19  
**Background Tasks & Scheduling**: BullMQ + Redis 7 (`redis:7-alpine`), with resilient DB-backed fallback scheduler when Redis is absent  
**AI Service Integration**: Google Gemini API (`@google/generative-ai`, model `gemini-3.6-flash`) with strict Zod schema validation  
**Authentication & Security**: HttpOnly JWT cookies (`cookie-parser`), verified user claims (`req.user.id`), Google OAuth 2.0  
**Validation**: Zod 3.x (shared contracts in `@careerprepster/shared`)  
**Target Platform**: Linux containers (`docker-compose`), modern evergreen browsers  
**Performance Goals**:
- Dashboard recommendation feed retrieval: < 1.5s (p95)
- In-memory/client filtering & sorting on 500+ items: < 200ms
- Job deduplication & ingestion throughput: > 50 jobs/sec
- Candidate match recalculation: < 2.5s (asynchronous)
**Constraints**:
- Zero synchronous external scraping or batch AI matching on user HTTP requests
- Platform compliance: No unauthorized web scraping or circumventing login gates (e.g. LinkedIn requires authorized partner API credentials)
- Match scores must never be framed as hiring probabilities
- Candidate CV data and PII are never sent to third-party job boards

---

## Constitution Check

*GATE: All principles from [.specify/memory/constitution.md](../../.specify/memory/constitution.md) verified.*

| Principle | Compliance Assessment | Status |
| :--- | :--- | :--- |
| **Principle 1: Full-Stack Architecture & Separation of Concerns** | Clear boundaries: Next.js UI (`frontend/`), Express REST API (`backend/`), MySQL persistence via Prisma, and shared Zod schemas (`shared/`). | **PASS** |
| **Principle 2: Staged AI Workflow (CV Editor → ATS)** | Job matching is downstream of CV authoring and consumes the polished, validated CV data as contextual baseline without modifying the core CV drafting flow. | **PASS** |
| **Principle 3: Modular Downstream Extensions** | Job Matching is designed as a strictly opt-in, decoupled extension. Non-use never gates CV editing or ATS scoring. Relational foreign keys connect to `User` and `CV`. | **PASS** |
| **Principle 4: Student Privacy & Data Minimization** | Raw candidate CV data and PII remain internal; external job providers receive zero candidate profile data. External navigation occurs solely when the student clicks an application link. | **PASS** |
| **Principle 5: Containerization (Docker-First)** | Redis service added to `docker-compose.yml` with matching configurations for local development and containerized environments. | **PASS** |

---

## Project Structure

### Documentation & Specifications (this feature)

```text
specs/003-personalized-job-match/
├── spec.md              # Requirements and user scenarios
├── plan.md              # Technical implementation plan
├── research.md          # Architecture decisions & trade-offs (Phase 0)
├── data-model.md        # Relational schemas & Prisma models (Phase 1)
├── quickstart.md        # Validation scenarios & test commands (Phase 1)
├── contracts/           # REST API contracts (Phase 1)
│   └── jobs-api.contract.md
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── tasks.md             # Ordered task breakdown (Phase 2 - generated via /speckit-tasks)
```

### Source Code Layout

```text
backend/
├── prisma/
│   └── schema.prisma                    # Updated with JobListing, JobMatchRecommendation, etc.
├── src/
│   ├── config/
│   │   ├── env.ts                       # REDIS_URL and job matching config
│   │   └── redis.ts                     # Redis connection and BullMQ setup
│   ├── routes/
│   │   └── jobs.routes.ts               # Authenticated endpoints under /api/jobs
│   ├── controllers/
│   │   └── jobs.controller.ts           # Request handlers for jobs and recommendations
│   ├── services/
│   │   ├── job-discovery.service.ts     # Ingestion orchestration and deduplication
│   │   ├── job-matching.service.ts      # Multi-pillar explainable scoring engine
│   │   ├── job-queue.service.ts         # BullMQ worker and daily cron scheduler
│   │   └── providers/
│   │       ├── job-provider.interface.ts# Common provider contract
│   │       ├── remoteok.provider.ts     # RemoteOK public API adapter
│   │       ├── arbeitnow.provider.ts    # Arbeitnow public API adapter
│   │       ├── seed.provider.ts         # Local university student seed catalog
│   │       └── linkedin.provider.ts     # Authorized enterprise partner stub
│   └── schemas/
│       └── jobs.schema.ts               # Backend Zod validation schemas

frontend/
├── src/
│   ├── app/
│   │   └── jobs/
│   │       └── page.tsx                 # Main Job Match dashboard route
│   ├── components/
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx              # Job listing card with score badge and skills
│   │   │   ├── JobDetailsModal.tsx      # Expanded requirement & match explanation modal
│   │   │   ├── JobFilters.tsx           # Multi-facet filter drawer/sidebar
│   │   │   ├── JobSearchPreferencesModal.tsx # Search preferences dialog
│   │   │   └── RefreshIndicator.tsx     # Cooldown countdown and status badge
│   │   └── navigation/
│   │       └── NavBar.tsx               # Updated with "Jobs" navigation link
│   └── lib/
│       └── jobs-api.ts                  # Frontend API client methods

shared/
└── src/
    ├── types/
    │   └── jobs.ts                      # Shared TypeScript models and enums
    └── schemas/
        └── jobs.schema.ts               # Shared Zod contracts
```

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| *None* | Architecture strictly complies with all Constitution principles. | Direct synchronous scraping was rejected because it causes severe latency and violates SC-005. |
