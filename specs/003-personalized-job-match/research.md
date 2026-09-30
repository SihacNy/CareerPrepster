# Research & Technical Decisions: Personalized Job Match

**Feature**: Personalized Job Match  
**Date**: 2026-09-30  
**Status**: Completed (Phase 0)  

---

## 1. Background Queue & Scheduling Topology

### Decision
Use **BullMQ** on top of **Redis 7 (Alpine)** for background asynchronous tasks, scheduled recurring jobs, retry management, and rate limiting. Add a lightweight `redis` container to `docker-compose.yml` (`redis:7-alpine`, port 6379) and provide an in-memory/DB-backed fallback queue when Redis is unavailable during lightweight local unit/smoke tests.

### Rationale
- **Isolation from HTTP Cycle**: The spec strictly mandates that zero external scraping or AI batch evaluations run synchronously during dashboard requests (SC-005). BullMQ processes jobs out-of-band in dedicated worker threads.
- **Repeatable Cron Jobs**: BullMQ natively supports repeatable jobs with timezone configuration. A repeatable job with cron expression `0 19 * * *` corresponds exactly to 02:00 Asia/Phnom_Penh (UTC+7).
- **Concurrency & Backoff**: BullMQ provides built-in exponential backoff retries, concurrency limits per queue, job deduplication (`jobId`), and event notifications for user refresh polling.
- **Overlapping Prevention**: BullMQ job IDs for scheduled runs are keyed by date (`discovery-2026-09-30`), ensuring that even in multi-instance deployments, only one instance executes the daily discovery.

### Alternatives Considered
- **node-cron + MySQL locking**: While simpler, it lacks distributed queue resilience, progress tracking, automatic retries with backoff, and per-user queue isolation.
- **Agenda (MongoDB)**: Requires introducing MongoDB into a MySQL-centric stack, which violates Constitution Principle 1.

---

## 2. Job Discovery & Source-Independent Abstraction

### Decision
Implement a decoupled **`JobSourceProvider`** interface with pluggable adapters:
```typescript
export interface JobSourceProvider {
  readonly sourceId: string;
  readonly displayName: string;
  discoverJobs(query?: JobDiscoveryQuery): Promise<RawDiscoveredJob[]>;
  verifyAuthorization?(): Promise<boolean>;
}
```

### Supported Initial Providers:
1. **RemoteOKProvider**: Permissive public JSON feed (`https://remoteok.com/api`) offering tech, software engineering, and junior developer vacancies.
2. **ArbeitnowProvider**: Free, structured job board API (`https://www.arbeitnow.com/api/job-board-api`) with native tags, company names, and direct URLs.
3. **SeedCatalogProvider**: Built-in curated catalog of university tech internships and entry-level positions for guaranteed local development and offline demo capabilities.
4. **LinkedInProvider (Authorized Interface)**: Built as an extensible stub that checks for verified LinkedIn Talent Solutions API / Partner credentials. In compliance with the user's explicit instructions, it **never** attempts unauthorized scraping, session cookie hijacking, or anti-bot circumvention. If credentials are not present, it logs a graceful status and skips collection.

### Normalization Pipeline
All raw external job items pass through a unified Zod-validated `JobNormalizer`:
- Strips HTML tags and markdown formatting from descriptions.
- Extracts standard work arrangement: `REMOTE`, `HYBRID`, `ON_SITE`.
- Extracts employment type: `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT`.
- Parses and standardizes tech skills from job tags and requirement bullet points.
- Extracts canonical application URL with query tracking parameters cleaned.

---

## 3. Deduplication & Canonical Lifecycle Tracking

### Decision
Compute a deterministic SHA-256 **`dedupHash`** for every discovered job:
$$\text{dedupHash} = \text{SHA256}(\text{normalize}(\text{company}) + "|" + \text{normalize}(\text{title}) + "|" + \text{normalize}(\text{location}))$$

### Rationale
- When daily discovery runs, incoming jobs are checked against `dedupHash`.
- If an existing record is found:
  - `lastSeenAt` is updated to the current timestamp.
  - `applicationUrl` is refreshed if changed.
  - `isActive` is set to `true`.
  - No duplicate row is created (satisfies Acceptance Criterion 3 and SC-003).
- Listings not seen in 14 consecutive discovery runs or receiving external 404s are flagged as `isActive = false` and suppressed from active recommendation queries while preserving user bookmarks.

---

## 4. Multi-Pillar Explainable Matching Algorithm

### Decision
Combine a **deterministic multi-pillar scoring engine** (70% weight) with an **AI semantic reasoning enhancer** (30% weight or qualitative overlay) using Google Gemini.

### Score Formula (0–100 Scale):
$$\text{Score} = (W_{\text{skills}} \times S_{\text{skills}}) + (W_{\text{role}} \times S_{\text{role}}) + (W_{\text{exp}} \times S_{\text{exp}}) + (W_{\text{pref}} \times S_{\text{pref}})$$

| Pillar | Weight | Evaluation Method |
| :--- | :--- | :--- |
| **Skills Alignment** ($S_{\text{skills}}$) | 40% | Tokenized intersection between candidate's `SkillGroup` items, experience bullets, and job required/preferred skills. Returns `matchedSkills` and `missingSkills`. |
| **Role & Seniority Fit** ($S_{\text{role}}$) | 25% | Levenshtein / substring similarity between candidate target role (or latest CV title) and job title + seniority level comparison (e.g., student CV matches Internship/Junior roles). |
| **Experience Level** ($S_{\text{exp}}$) | 20% | Total computed months of candidate work history and academic project tenure against the job's minimum required years. |
| **Preferences Fit** ($S_{\text{pref}}$) | 15% | Candidate preferred work arrangement (Remote/Hybrid/On-site) and preferred location match. |

### AI Semantic Reasoning (Google Gemini)
For recommendations passing a baseline score ($\ge 50$), Gemini generates an explainable breakdown structured as:
```json
{
  "evidenceReasons": [
    "Your 2 Next.js capstone projects align directly with the required React experience.",
    "Your proficiency in TypeScript and MySQL covers 80% of backend requirements."
  ],
  "skillGaps": [
    { "skill": "Docker", "criticality": "MEDIUM", "recommendation": "Add Docker containerization to your backend project." }
  ],
  "summary": "Strong technical foundation with high stack overlap for this Junior Full Stack role."
}
```
**Guardrails**:
- Strict Zod schema validation on Gemini output.
- Explicit non-hiring disclaimer displayed on every UI card and API response.
- Temperature set to `0.2` for factual, grounded reasoning without fabrication.

---

## 5. User Privacy, Rate Limiting & Cooldown Strategy

### Decision
- **Access Isolation**: All database queries for recommendations and preferences strictly enforce `WHERE userId = req.user.id`.
- **Manual Refresh Cooldown**: In-memory Redis key `ratelimit:refresh:{userId}` with a 15-minute TTL (900 seconds). If a user requests a refresh while active, the API returns HTTP 429 with `{ retryAfterSeconds: N }`.
- **Data Minimization**: External job providers receive zero candidate data. Candidate CV parsing occurs entirely on CVPrepster infrastructure.
