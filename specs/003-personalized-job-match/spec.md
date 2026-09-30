# Feature Specification: Personalized Job Match

**Feature Branch**: `module/cv-editor`

**Created**: 2026-09-30

**Status**: Ready for Planning

**Input**: User description: "Build a production-oriented Job Match feature for CVPrepster, similar to LinkedIn's personalized job recommendations. Recommend jobs based on the user's parsed CV, skills, work experience, desired job roles, preferred location, employment type, and remote-work preferences."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personalized Job Recommendation Feed & Explainable Match Breakdown (Priority: P1)

As a university student or job seeker using CVPrepster, I want to open the Job Match dashboard and immediately view curated job listings ranked by how closely they match my parsed CV profile, with transparent explanations of matched skills and skill gaps, so that I can discover relevant opportunities without manually scouring job boards.

**Why this priority**: Delivers immediate core value. Users see instantaneous, relevant job recommendations tailored specifically to their active CV competencies and preferences with clear evidence-based explanations.

**Independent Test**: Can be tested independently by navigating to `/jobs`, verifying that pre-calculated recommendations appear promptly without blocking page loads, inspecting the match percentage (0–100), reviewing matched skills and missing gaps on each card, and clicking "Apply" to open the verified original posting URL.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an active CV, **When** they navigate to the Job Match page, **Then** the system presents a responsive feed of recommended jobs sorted by match score, showing employer logo (or fallback), job title, employer name, location, employment type, work arrangement, posting recency, and an explainable match percentage badge.
2. **Given** a job card on the feed, **When** the user inspects the card, **Then** the system displays at least the top matching skills and key missing skill requirements extracted from the listing.
3. **Given** any recommended job listing, **When** the user clicks "Apply", **Then** the application opens the verified original listing URL in a secure new browser tab.
4. **Given** any match score displayed, **When** viewed by the user, **Then** the system presents the score strictly as a profile-to-requirement alignment metric accompanied by a disclaimer that it does not represent hiring probability or guarantee.

---

### User Story 2 - Job Search Filtering, Sorting, and Opportunity Management (Priority: P1)

As an active candidate, I want to filter and sort my job recommendations by role, location, remote work type, experience level, and match threshold, as well as save, dismiss, or track the application status of individual postings, so that I can organize my job search efficiently.

**Why this priority**: Essential companion to the feed. Raw lists quickly become overwhelming without filtering and pipeline state management (Saved, Applied, Interviewing, Dismissed).

**Independent Test**: Can be tested by applying a filter (e.g., "Remote only" and "Match score >= 80%"), verifying the filtered results update instantly, saving a job to the "Saved" tab, and dismissing a job to remove it from the active feed.

**Acceptance Scenarios**:

1. **Given** the recommendation feed, **When** the user selects filters (e.g., Location, Remote/Hybrid/On-site, Employment Type, Experience Level, Minimum Match Score), **Then** the displayed listings update immediately to reflect only matching jobs.
2. **Given** multiple available sorting options, **When** the user chooses "Highest Match", "Most Recent", or "Relevance", **Then** the feed reorders accordingly without re-fetching external jobs.
3. **Given** a job card, **When** the user clicks the "Save" action, **Then** the job is bookmarked, marked as saved in their profile, and accessible under a dedicated "Saved Jobs" view.
4. **Given** a job that is irrelevant to the candidate, **When** the user clicks "Dismiss", **Then** the job is removed from their active feed, and the system records the dismissal so it is not recommended again.
5. **Given** an opportunity the user applied for, **When** the user updates the status (e.g., "Applied", "Interviewing"), **Then** the system records this status and visually badges the card.

---

### User Story 3 - On-Demand and Preference-Triggered Recommendation Refresh (Priority: P2)

As a candidate who just updated their resume or changed their career targets, I want to manually request an update to my job recommendations or have them refresh when my CV changes, so that my recommendations reflect my latest qualifications and preferences.

**Why this priority**: Guarantees freshness as students acquire new credentials, edit projects, or adjust their target industries.

**Independent Test**: Can be tested by updating target role or adding a new skill to the CV, clicking "Refresh Matches", observing a non-blocking progress status with a countdown timer, and verifying updated match scores once processing completes.

**Acceptance Scenarios**:

1. **Given** a user who has updated their CV sections or search preferences, **When** they click "Refresh Matches", **Then** the system schedules an asynchronous match recalculation without blocking the browser UI and provides a clear status indicator.
2. **Given** a refresh request in progress, **When** the user remains on the page, **Then** the interface displays the last-updated timestamp and polling status, updating the card feed once the recalculation finishes.
3. **Given** a user who recently triggered a manual refresh, **When** they attempt to trigger another refresh before the cooldown period (e.g., 15 minutes) has elapsed, **Then** the system prevents the duplicate request and displays the remaining cooldown time.

---

### User Story 4 - Automated Daily Ingestion and Deduplication (Priority: P2)

As an administrator and system operator, I want the system to execute an automated daily discovery routine at 02:00 Asia/Phnom_Penh that collects, normalizes, and deduplicates compliant job postings from approved sources, so that the candidate recommendation pool remains current without manual intervention or service downtime.

**Why this priority**: Provides the reliable, fresh data pipeline required to power all user-facing recommendation features on an ongoing basis.

**Independent Test**: Can be tested by triggering the discovery workflow in a test environment, verifying jobs from different sources are normalized to a consistent structure, confirming duplicates are updated rather than re-inserted, and verifying expired listings are flagged.

**Acceptance Scenarios**:

1. **Given** the arrival of the scheduled discovery time (02:00 Asia/Phnom_Penh), **When** the automated discovery routine executes, **Then** it ingests jobs from configured permitted sources, applies timeout and rate-limit guardrails, and completes without impacting active user web requests.
2. **Given** newly discovered jobs that share identical employer names, titles, and location signatures with existing records, **When** processed by the normalization stage, **Then** the system updates the existing records' last-seen timestamp and URL instead of creating duplicate records.
3. **Given** an external listing that is no longer available on its source platform, **When** detected by the ingestion pipeline, **Then** the system marks the listing as inactive/expired and suppresses it from active user recommendation feeds.
4. **Given** a network failure during discovery, **When** a source endpoint times out, **Then** the pipeline records structured failure diagnostics and retries safely with backoff without corrupting existing database records.

---

### User Story 5 - Expanded Job Detail View and Semantic Alignment Reasoning (Priority: P3)

As a candidate considering applying to a high-match role, I want to open a detailed modal or page view to inspect the full job description, parsed requirement breakdown, and AI-assisted alignment reasoning, so that I can tailor my cover letter and prepare for interviews.

**Why this priority**: Enhances candidate preparedness and bridges directly into CareerPrepster's mock interview and CV optimization capabilities.

**Independent Test**: Can be tested by clicking on a job card, verifying that the modal opens with the full description, structured skills breakdown, experience criteria comparison, and clear, validated evidence-based reasons for the match score.

**Acceptance Scenarios**:

1. **Given** a job card, **When** the candidate clicks the card, **Then** an expanded detail view opens showing the complete normalized description, required qualifications, nice-to-have skills, and original source metadata.
2. **Given** an expanded job view, **When** the user examines the "Match Analysis" section, **Then** the system breaks down the score into specific pillars (Skill Alignment, Experience Level, Education/Domain Fit) with clear explanatory bullets.
3. **Given** any AI-assisted semantic matching summaries, **When** generated by the system, **Then** the content is strictly validated against a structured schema to prevent hallucinated requirements, unearned credentials, or fabricated claims.

---

### Edge Cases

- **Candidate has zero skills or an empty CV**: The system displays an empty-state banner explaining that at least one skill or experience entry is needed, offering a direct link to the CV Editor to complete their profile.
- **External job source is completely unreachable**: The ingestion worker logs a structured error, leaves existing active jobs untouched, and schedules a retry without disrupting user dashboard access.
- **Candidate has zero matching jobs above threshold**: The dashboard provides clear guidance, suggesting broader search filters, alternative roles, or keyword adjustments in the CV editor.
- **Listing expires while the user has it saved**: The saved job card indicates "Listing expired or closed" and disables the direct apply button while preserving the candidate's personal notes and application status.
- **Company logo is missing or broken**: The UI falls back gracefully to a high-contrast company monogram badge with the first letter of the employer's name.
- **Conflicting source duplicates**: If identical jobs arrive from two distinct feeds, the system groups them under a single canonical job entity while preserving the primary direct application link.
- **Rapid repeated clicks on action buttons**: All interactive actions (Save, Dismiss, Refresh) are debounced and use optimistic UI updates with rollback on network failure.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an opt-in Job Match dashboard accessible to authenticated users that displays personalized job recommendations based on the candidate's active CV and search preferences.
- **FR-002**: System MUST calculate an explainable alignment score (0–100) for each recommendation based on weighted criteria including skill match, experience alignment, education level, role similarity, and location/remote preferences.
- **FR-003**: System MUST identify and explicitly display matching skills alongside critical missing skill requirements for each recommended job.
- **FR-004**: System MUST present all scores as alignment metrics and explicitly forbid presenting scores as hiring probabilities, admission guarantees, or definitive qualification ratings.
- **FR-005**: System MUST support a pluggable, source-independent job discovery interface capable of ingesting jobs from permitted public job boards, partner feeds, and authorized APIs without violating platform terms of service.
- **FR-006**: System MUST respect verified authorization standards for platforms with access restrictions (e.g., LinkedIn API requires authorized partner credentials; no automated bypassing of access controls or unauthorized web scraping).
- **FR-007**: System MUST normalize all ingested job listings into a consistent structure comprising title, employer name, logo URL, location, work arrangement (remote/hybrid/on-site), employment type (full-time/part-time/internship), description, structured requirements, source identifier, and canonical application URL.
- **FR-008**: System MUST perform deterministic deduplication on incoming job listings using canonical composite identifiers (e.g., normalized employer + normalized title + location signature) to update existing records rather than creating duplicates.
- **FR-009**: System MUST track lifecycle timestamps for all job postings, including discovery time, last-seen time, original posting date, and active/expired status.
- **FR-010**: System MUST execute an automated background discovery and normalization cycle daily at 02:00 Asia/Phnom_Penh (UTC+7).
- **FR-011**: System MUST decouple job discovery, normalization, and heavy matching computation from user-facing HTTP request-response cycles, guaranteeing that dashboard requests never trigger synchronous external scraping or synchronous batch matching.
- **FR-012**: System MUST support resilient asynchronous task execution with configurable concurrency limits, per-task timeouts, automatic exponential backoff retries, and structured logging.
- **FR-013**: System MUST prevent overlapping scheduled discovery runs using distributed locking or database execution locks.
- **FR-014**: System MUST allow users to trigger a manual match refresh, subject to a minimum cooldown period (e.g., 15 minutes) and per-user daily rate limits.
- **FR-015**: System MUST re-evaluate or mark recommendations for recalculation when a candidate saves significant updates to their CV competencies or job preferences.
- **FR-016**: System MUST enable candidates to filter recommendation feeds by role category, geographic location, remote work type, experience seniority, minimum match score, and posting recency.
- **FR-017**: System MUST enable candidates to sort listings by Match Score (descending), Posting Date (newest first), and Relevance.
- **FR-018**: System MUST support pagination or smooth infinite scrolling to handle large result sets efficiently.
- **FR-019**: System MUST allow candidates to save (bookmark) jobs, view saved jobs in a dedicated tab, dismiss unwanted jobs from the active feed, and track application progress states (Saved, Applied, Interviewing, Archived).
- **FR-020**: System MUST ensure strict tenant and user data isolation: candidates can only view, refresh, save, and modify their own personalized recommendations.
- **FR-021**: System MUST strictly validate all AI-assisted semantic matching and explanation outputs against a structured schema, rejecting any hallucinated employer details, unsupported claims, or unearned user credentials.
- **FR-022**: System MUST provide direct navigation from every job card to the verified original external listing URL in a secure, sandboxed new tab (`rel="noopener noreferrer"`).
- **FR-023**: System MUST provide accessible visual fallbacks for missing company logos, loading skeleton states during data retrieval, and informative empty states when no listings match active criteria.

---

### Key Entities *(include if feature involves data)*

- **JobListing**: Represents a normalized job vacancy collected from an external source. Key attributes include title, company name, company logo URL, location, work arrangement (Remote, Hybrid, On-site), employment type (Full-time, Part-time, Internship, Contract), raw and sanitized description, structured required skills, structured preferred skills, minimum experience years, education requirement, source platform identifier, external source ID, canonical application URL, posting date, discovery date, last-seen date, and active status flag.
- **JobMatchRecommendation**: Represents the evaluated relationship between a candidate's CV and a specific JobListing. Key attributes include reference to the User, reference to the CV, reference to the JobListing, overall match score (0–100), sub-scores (skills score, experience score, education score, preference score), array of matched skill strings, array of missing skill strings, structured match explanation reasons, recommendation status (Active, Saved, Dismissed, Applied, Interviewing, Archived), user notes, match generation timestamp, and last-updated timestamp.
- **JobSearchPreference**: Represents candidate-specific search criteria that augment or override CV defaults. Key attributes include reference to User, desired job titles/roles, preferred locations, acceptable work arrangements (remote/hybrid/on-site), minimum acceptable salary (optional), target employment types, and notification preferences.
- **JobDiscoveryRun**: Tracks the operational health and audit trail of background ingestion tasks. Key attributes include run ID, started timestamp, completed timestamp, execution status (Running, Succeeded, Failed), source platform, total jobs scanned, new jobs inserted, existing jobs updated, jobs marked expired, error log summary, and worker node identifier.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard load time for authenticated users viewing their recommendations feed is under 1.5 seconds on standard broadband connections (under 95th percentile).
- **SC-002**: 100% of displayed match scores include an understandable, inspectable breakdown showing at least matched skills, missing skills, and score justification.
- **SC-003**: Re-running a job discovery cycle over identical source listings results in 0 duplicate job records created in the database.
- **SC-004**: 100% of "Apply" links navigate directly to valid, sanitized external source URLs without intermediate phishing, broken redirects, or credential leakage.
- **SC-005**: Zero external scraping tasks or AI batch recalculations run synchronously on user-facing HTTP dashboard routes.
- **SC-006**: Candidates can filter a list of 500+ recommendations by any combination of role, location, remote arrangement, and score with results updating in under 200ms.
- **SC-007**: 95% of test candidates in user trials report that match score explanations clearly reflect the content of their uploaded/edited CV.
- **SC-008**: Background ingestion job automatically handles transient source timeouts with zero unhandled process crashes and completes daily runs with recorded audit metrics.

---

## Assumptions

- **Target Audience**: Graduating university students, early-career professionals, and internship seekers using CareerPrepster to tailor resumes and prepare for job placement.
- **CV Ingestion Baseline**: Feature consumes the structured parsed CV data (skills, work experience, education, projects) already produced by CareerPrepster's CV Editor and Parser services.
- **Source Compliance & Ethics**: Initial automated job discovery integrates with publicly permitted APIs and RSS/feed endpoints (e.g., RemoteOK API, Arbeitnow, Adzuna, or configured institutional partner feeds). LinkedIn integration is architected as an authenticated partner interface requiring verified enterprise API credentials; scraping LinkedIn behind login or evading bot protections is strictly prohibited.
- **Opt-in Principle**: In compliance with Constitution Principle 3, Job Matching is a fully decoupled, opt-in downstream extension. Non-use of Job Match never blocks or gates CV editing, downloading, or ATS audit features.
- **Scoring Semantics**: The 0–100 match score represents contextual alignment between candidate profile and job requirements, not predictive hiring probability.
- **Refresh Cooldown**: Manual on-demand match recalculation is rate-limited to once every 15 minutes per user to protect backend processing resources.
- **Security & Privacy**: Candidate CV details and PII are never transmitted to third-party job boards during recommendation matching; external interactions occur solely when the candidate voluntarily clicks an external application link.
