# Phase 0 Research: Architectural Justifications, Trade-Offs & Capstone Answers

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Date**: 2026-10-07  

---

## 1. Executive Summary

This research document evaluates the architectural design decisions, trade-offs, and compliance mappings for CareerPrepster on AWS. It directly addresses the **six design questions**, **security rules S1–S4**, and **observability alerts** mandated by the Capstone specification card.

---

## 2. Answers to the Six Design Questions (Deliverable 1C)

### Question 1: What kind of database fits CVs, sections, and reviews linked to students?
- **Analysis**:
  - *Document / NoSQL (DynamoDB / MongoDB)*: Can store an entire CV as a nested JSON document. However, atomic updates to specific sections (`cv_sections`) during concurrent AI bullet generation are clunky, relational joins between `students`, `cvs`, and historical `ats_reviews` require duplicate writes, and enforcing referential integrity (e.g. cascading deletes when a student purges their account under GDPR/privacy rules) requires application-level orchestration.
  - *Relational (Amazon RDS MySQL 8.0/8.4)*: Perfect match for the relational model:
    - 1 Student $\to$ Multiple CVs
    - 1 CV $\to$ Multiple CVSections (`WORK_EXPERIENCE`, `PROJECTS`, `SKILLS`)
    - 1 CV $\to$ Multiple ATSReviews (historical tracking of score improvements)
- **Decision**: **Amazon RDS MySQL 8.0/8.4**. Relational foreign keys (`ON DELETE CASCADE`) maintain strict referential integrity. Indexed queries on `student_id` guarantee sub-millisecond execution for tenancy isolation, and standard SQL ACID transactions ensure consistent state across multi-step AI rewriting pipelines.

---

### Question 2: Where do exported CVs live, and how does a student download only their own?
- **Analysis**:
  - Storing PDF/DOCX files directly inside MySQL as `BLOB` columns bloats the database, degrades cache hit ratios, and increases backup times.
- **Decision**:
  - Exported CV files reside in a dedicated, private **Amazon S3 bucket** (`careerprepster-media-*`) partitioned by student ID: `exports/{student_id}/cv-{date}.pdf` (e.g., `exports/STU-00412/cv-2026-09-20.pdf`).
  - **Bucket Security**: S3 **Block All Public Access** is permanently enabled. There is no public HTTP URL.
  - **Download Workflow**:
    1. The student browser makes an authenticated `GET /api/cvs/:id/export` request with their HttpOnly JWT cookie.
    2. The backend auth middleware validates the session token and extracts the authenticated `student_id`.
    3. The backend confirms that the CV belongs to this `student_id` via a SQL query.
    4. The backend uses the AWS SDK (via IAM Task Role credentials) to generate a **time-limited pre-signed URL** (15-minute expiration) strictly for `exports/{student_id}/...`.
    5. The backend returns `{ downloadUrl: "https://careerprepster-media.s3.amazonaws.com/exports/STU-00412/cv-2026-09-20.pdf?AWSAccessKeyId=...&Signature=...&Expires=..." }`.
    6. The student browser downloads the PDF directly from S3 via the cryptographically signed link.

---

### Question 3: How does your design let the team switch AI provider (R4) without rebuilding everything?
- **Analysis**:
  - Hardcoding Groq or Gemini SDK calls throughout route handlers creates high coupling and makes switching providers a major engineering effort.
- **Decision**:
  - The backend implements the **Strategy / Provider Adapter Pattern** with a TypeScript interface:
    ```typescript
    export interface IAiProvider {
      rewriteBulletPoint(bullet: string, framework: 'STAR' | 'XYZ'): Promise<string[]>;
      scoreAts(cvText: string, jobDescription?: string): Promise<AtsScoreResult>;
    }
    ```
  - We maintain swappable adapters: `GroqProvider` (default), `GeminiProvider` (fallback), and optional `OpenAiProvider`.
  - A factory reads the environment variable `AI_PROVIDER` (configured via AWS Secrets Manager).
  - **Zero Rebuild Switch**: To switch from Groq to Gemini or Claude in production, an engineer simply updates the `AI_PROVIDER` secret in AWS Secrets Manager and restarts the ECS task. The container image remains untouched, no code is recompiled, and frontend API contracts remain identical.

---

### Question 4: Fixed capacity or automatic scaling? The load is heavy in the evenings and in internship season.
- **Analysis**:
  - *Load Profile*:
    - Normal semester: ~500 active students/day (diffused load).
    - Peak internship season: ~3,000 students/week with **300 concurrent students** concentrated from 19:00 to 23:00.
  - *Fixed Capacity*: Provisioning 6 tasks 24/7 costs ~$108/month for compute alone. Provisioning 2 tasks saves money ($36/mo) but causes queue saturation, slow AI response times, and 504 Gateway Timeouts during evening rushes.
- **Decision**: **Automatic Scaling (Target Tracking Scaling Policy on AWS Fargate)**.
  - **Baseline**: 2 Fargate tasks (1 in `private-app-subnet-1a`, 1 in `private-app-subnet-1b`) for continuous Multi-AZ high availability.
  - **Scale-Out Trigger**:
    - Average CPU Utilization exceeds 70% for 2 minutes, OR
    - ALB `RequestCountPerTarget` exceeds 150 requests/minute.
  - **Scale-Out Target**: Up to **6 Fargate tasks** to absorb the 300 concurrent student peak.
  - **Scale-In Trigger**: CPU drops below 30% for 10 minutes, scaling back down to 2 tasks outside evening hours.
  - *Financial Outcome*: Saves over 60% on compute costs during low-traffic mornings and weekends while delivering guaranteed sub-second response times during peak demand.

---

### Question 5: In your price estimate, which feature costs the most in AI calls, and how do you cap it?
- **Analysis**:
  - *Cost Breakdown by Feature*:
    - **Single Bullet Rewriting**: ~150 input tokens, ~100 output tokens $\to$ negligible ($0.00005 / call).
    - **Full ATS Review**: ~1,500 input tokens (full CV text), ~500 output tokens $\to$ low ($0.0003 / call).
    - **Interactive AI Mock Interview Coach (R6 Add-on)**: Generates 5 to 10 back-and-forth turns, sending full conversation history and rubrics each turn (~3,000 input tokens per turn $\times$ 10 turns = 30,000 tokens per session) $\to$ **Consumes over 75% of total AI spend!**
- **Decision on Capping Mechanisms**:
  1. *Per-Student Rate Limiting*: Application-level token-bucket middleware caps students at **10 interview drill sessions / week** and **15 bullet rewrites / hour**.
  2. *Strict Max Tokens Limits*: Prompt parameters constrain completion output to `max_tokens: 500`.
  3. *Daily Spend Cap Alarm (Requirement R5)*: Backend tracks cumulative token usage. If daily API spend exceeds **$10.00/day**, a CloudWatch Metric Alarm triggers an SNS email alert to the engineering team and throttles non-essential drill sessions.

---

### Question 6: If a server's credentials were stolen, whose CVs could an attacker read, and what limits that?
- **Analysis**:
  - If a backend ECS container's database credentials (`DATABASE_URL`) or IAM task credentials are compromised, an attacker has application-level access.
- **Protections & Architectural Limitations**:
  1. **Network Boundary (VPC Isolation)**:
     - RDS MySQL has **no public IP** and sits in isolated `private-db-subnets`.
     - Ingress to port 3306 is permitted *only* from `sg-ecs-backend`. An attacker sitting outside the VPC cannot establish a connection even with the stolen database password.
  2. **AWS KMS Customer Managed Key Policy (Security Rule S2)**:
     - S3 bucket objects and RDS database blocks are encrypted using `alias/careerprepster-cmk`.
     - The KMS Key Policy explicitly restricts `kms:Decrypt` calls to requests originating from the VPC and the designated IAM Task Role.
  3. **Tenancy Guardrails in Application Code**:
     - Raw SQL access without `WHERE student_id = ...` is barred by Prisma type-safe queries.
  4. **Audit Logging & Blast Radius Containment**:
     - CloudTrail logs all S3 `GetObject` and KMS `Decrypt` operations. An attacker attempting a bulk dump (`SELECT * FROM cvs;` or mass downloading `exports/`) instantly triggers CloudWatch Anomaly Detection on API call spikes, cutting off access.

---

## 3. Security Rule S4: Data Minimization & AI Retention Disclosure

### 3.1 What is Sent to the AI Provider
- The specific resume bullet point or section text submitted for optimization (e.g., `"Led a team of 4 to build an e-commerce website using React and Node"`).
- The target job title or job description snippet (for ATS keyword matching).
- System instruction prompts instructing the model to apply the STAR or XYZ framework.

### 3.2 What is NEVER Sent to the AI Provider
- Student name, email address, physical address, and telephone number.
- University student ID (`student_id`), university name, or student profile links (LinkedIn, GitHub).
- Raw contact headers or demographic identifiers. All identifying PII is scrubbed before prompt submission.

### 3.3 Provider Data Retention Policy
- **Groq Cloud API**: Under Groq's Enterprise and API terms, customer inputs and outputs are **never used to train, retrain, or improve models**. Transient request logs are retained for zero training and cached for a maximum of 30 days solely for security, fraud prevention, and operational abuse investigation, after which they are permanently flushed.
- **Google Gemini API (Enterprise/Paid Tier)**: Customer data is confidential and not logged or stored to train Google models.

---

## 4. The Two Required Alerts (Requirement R5)

### 4.1 Alert 1: AI Failing
- **Condition**: Upstream AI provider returns HTTP `429 Too Many Requests`, `500 Internal Server Error`, `503 Service Unavailable`, or connection timeouts exceeding 10 seconds.
- **Detection**: Backend structured log filter captures `[CRITICAL_AI_OUTAGE]`.
- **Threshold**: $\ge 2$ occurrences in a 5-minute rolling window.
- **Notification**: CloudWatch Alarm $\to$ Amazon SNS Topic (`careerprepster-critical-alerts`) $\to$ Email to `alerts@careerprepster.com`.

### 4.2 Alert 2: AI Cost Over Budget
- **Condition**: Daily AI inference expenditure exceeds the daily cap ($10.00/day) or overall AWS daily burn rate exceeds budget.
- **Detection**: Backend emits `[AI_COST_EVENT] spend_cents=<amount>`, or AWS Budgets daily metric evaluation.
- **Threshold**: Spend $\ge \$10.00$ in a single 24-hour UTC cycle.
- **Notification**: CloudWatch Alarm / AWS Budgets $\to$ Amazon SNS Topic $\to$ Email to `finance-alerts@careerprepster.com`.
