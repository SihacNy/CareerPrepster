# Quickstart Validation Guide: Personalized Job Match

**Feature**: Personalized Job Match  
**Date**: 2026-09-30  
**Status**: Completed (Phase 1)  

This guide provides end-to-end validation scenarios and commands to verify that the Personalized Job Match feature functions correctly across database persistence, background ingestion, matching algorithms, and UI presentation.

---

## 1. Prerequisites & Environment Setup

1. **MySQL Database Running**:
   ```bash
   docker compose up -d mysql
   # or ensure local MySQL is accessible on DATABASE_URL
   ```
2. **Apply Database Migrations & Generate Prisma Client**:
   ```bash
   npm run build:backend
   # Runs prisma generate and verifies compilation
   ```
3. **Seed Starter Job Listings**:
   ```bash
   npm run --workspace=backend prisma:seed
   ```
4. **Start Backend & Frontend Services**:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

---

## 2. Validation Scenarios

### Scenario 1: Automated Job Discovery & Deduplication
**Objective**: Verify the background discovery pipeline fetches jobs from providers, normalizes them, and performs idempotent upserts without creating duplicate records.

1. **Trigger Manual Discovery Run**:
   ```bash
   curl -X POST http://localhost:5000/api/jobs/admin/discover \
     -H "Content-Type: application/json"
   ```
2. **Expected Output**:
   ```json
   {
     "success": true,
     "data": {
       "runId": "...",
       "jobsScanned": 25,
       "jobsInserted": 25,
       "jobsUpdated": 0
     }
   }
   ```
3. **Re-Run Immediately to Verify Deduplication (Idempotence)**:
   ```bash
   curl -X POST http://localhost:5000/api/jobs/admin/discover \
     -H "Content-Type: application/json"
   ```
4. **Expected Output**:
   - `jobsInserted: 0`
   - `jobsUpdated: 25`
   - Database record count in `job_listings` remains unchanged.

---

### Scenario 2: Candidate Match Calculation & Score Explanation
**Objective**: Verify that the matching engine evaluates an authenticated candidate's CV against available job listings, producing a weighted score (0–100) and structured skill gap explanations.

1. **Trigger Candidate Match Refresh**:
   ```bash
   curl -X POST http://localhost:5000/api/jobs/refresh \
     -b "token=<AUTH_COOKIE>"
   ```
2. **Retrieve Recommendations**:
   ```bash
   curl -X GET "http://localhost:5000/api/jobs/recommendations?minScore=50&sortBy=matchScore" \
     -b "token=<AUTH_COOKIE>"
   ```
3. **Verification Points**:
   - Response contains an array of `items` with `overallScore` between 0 and 100.
   - Each item includes `matchedSkills` (e.g. `["React", "TypeScript"]`) and `missingSkills`.
   - The disclaimer text is returned stating the score represents alignment, not hiring probability.
   - Request finishes in under 1.5 seconds without blocking.

---

### Scenario 3: Opportunity Workflow (Save, Dismiss & Apply)
**Objective**: Verify candidate interaction with job cards and state persistence.

1. **Save a Recommended Job**:
   ```bash
   curl -X PATCH http://localhost:5000/api/jobs/recommendations/<REC_ID>/status \
     -H "Content-Type: application/json" \
     -b "token=<AUTH_COOKIE>" \
     -d '{"status": "SAVED", "userNotes": "Tailored cover letter."}'
   ```
2. **Verify Filter by Saved**:
   ```bash
   curl -X GET "http://localhost:5000/api/jobs/recommendations?status=SAVED" \
     -b "token=<AUTH_COOKIE>"
   ```
3. **Dismiss an Irrelevant Job**:
   ```bash
   curl -X PATCH http://localhost:5000/api/jobs/recommendations/<ANOTHER_REC_ID>/status \
     -H "Content-Type: application/json" \
     -b "token=<AUTH_COOKIE>" \
     -d '{"status": "DISMISSED"}'
   ```
4. **Verify Dismissed Job is Excluded**:
   - Querying `status=ACTIVE` no longer returns the dismissed job.

---

### Scenario 4: UI Dashboard End-to-End
**Objective**: Verify the web interface at `http://localhost:3000/jobs`.

1. Open `http://localhost:3000/jobs` in the browser while logged in.
2. Verify responsive layout, logo fallbacks for employers without images, and match score badges.
3. Apply filters: select "Remote" and set the minimum match slider to 70%. Verify instant updates.
4. Click a card to open the job details modal: check evidence reasons and click "Apply" to confirm it opens the original URL in a new tab.
5. Click "Refresh Matches" and verify that a cooldown timer begins.
