# Feature Specification: 004 - AWS Cloud Infrastructure & Hosting

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Status**: `Approved`  
**Author**: Antigravity Pair Programming  
**Date**: 2026-10-07  

---

## 1. Executive Summary & Client Context

**Client**: CareerPrepster is a student start-up platform that helps university students turn academic projects, campus leadership, and extracurricular activities into high-impact resumes and job applications. Students frequently undersell their experience, get filtered out by Applicant Tracking Systems (ATS), and freeze during interviews.

**AI Engine**: Primary AI provider is Groq (Llama-3.3-70B / GPT-OSS-120B) with secondary fallback to Google Gemini Flash. The AI provider is abstracted so switching providers does not force an architectural redesign.

`User -> CloudFront Global CDN (Default Domain: https://<id>.cloudfront.net with built-in AWS SSL) -> Internet-facing ALB (Default DNS) -> VPC (Public/Private Subnets, NAT Gateway, ECS Fargate) -> RDS MySQL (Multi-AZ capable) + S3 (KMS CMK Encrypted) -> CloudWatch + Secrets Manager + KMS`.
*(Note: No custom domain; utilizes AWS-provided default domain and native certificate).*

---

## 2. Capstone Client Requirements & Traceability

### 2.1 Core Functional Requirements (R1 – R6)

- **R1: Account Creation & CV Editing with AI STAR/XYZ Rewriting**  
  Students create an account and edit CVs from pre-designed templates (`templates/modern-1.docx`, etc.). Backend AI services suggest bullet point rewrites using industry-standard STAR (Situation, Task, Action, Result) and XYZ ("Accomplished [X], measured by [Y], by doing [Z]") frameworks.
- **R2: Actionable ATS Diagnostic Scoring**  
  An ATS review engine scores CVs (0–100) and pinpoints exact fixes: missing technical keywords, weak phrasing, and formatting inconsistencies.
- **R3: Strict Student Data Segregation**  
  A student sees only their own CVs, reviews, and exports. Cross-tenant access is strictly blocked at the API, database query, and storage layer.
- **R4: Pluggable AI Provider Abstraction**  
  The AI model and provider can change without forcing an application or infrastructure redesign. Decoupled provider adapters (Groq, Gemini, Anthropic, OpenAI) are swappable via configuration in AWS Secrets Manager.
- **R5: Proactive Email Alerts for AI Outages & Cost Overruns**  
  Immediate email notifications to the team whenever AI calls fail/time out or daily AI spend exceeds the configured operational budget limit.
- **R6: Decoupled Add-On Modularity**  
  Downstream extensions—**AI Interview Coach** and **AI Job Matching**—can be activated on demand without altering or degrading the core CV editing and ATS pipeline.

---

### 2.2 Expected Traffic & Load Profile

| Operating Regime | User Concurrency & Volume | AI Call Volume & Characteristics |
| :--- | :--- | :--- |
| **Normal Semester** | ~500 active students / day | 3 to 5 AI calls per CV review (~1,500 – 2,500 AI calls/day) |
| **Peak Internship Season** | ~3,000 students / week<br>**300 concurrent students** during evening rush (19:00 – 23:00) | Burst of 900 – 1,500 AI calls/hour during peak evening hours |

**Architectural Response**: Deploy **ECS Fargate Target Tracking Auto Scaling** (scaling on CPU utilization > 70% and ALB `RequestCountPerTarget` > 150 req/min) spanning 2 minimum tasks off-peak to 6 tasks during evening peak, ensuring sub-second response times without paying for idle capacity 24/7.

---

### 2.3 Data Model & File Asset Hierarchy

#### 1. Structured Database Records (Amazon RDS MySQL)
- `students(student_id, email, university, created_at)`
- `cvs(cv_id, student_id, template, updated_at)`
- `cv_sections(section_id, cv_id, type, text)`
- `ats_reviews(review_id, cv_id, score, findings, created_at)`

#### 2. File Assets & S3 Object Key Hierarchy (Amazon S3)
- **Bucket**: `careerprepster-media-<account-id>`
- **Exported CVs**: `exports/{student_id}/cv-{date}.pdf` (e.g. `exports/STU-00412/cv-2026-09-20.pdf`)
- **System Templates**: `templates/{template_id}.docx` (e.g. `templates/modern-1.docx`)

---

### 2.4 Security Rules (S1 – S4)

- **S1: Request Identity Verification on Every Request**  
  Every API request to `/api/*` requires a signed HttpOnly JWT session cookie. Backend middleware validates the cryptographic JWT signature, decodes `student_id`, and enforces tenancy isolation:
  - Database queries append `WHERE student_id = :authenticated_student_id`.
  - S3 file downloads generate a time-limited pre-signed URL (15-minute expiry) *only* if the requesting student's ID matches the S3 object prefix `exports/{student_id}/`.
- **S2: Customer-Controlled Encryption at Rest & Public Blocking**  
  All CV records, database tables, and exported files are encrypted at rest using an **AWS KMS Customer Managed Key (CMK)** (`alias/careerprepster-cmk`) controlled and rotatable by CareerPrepster. S3 enables `Block Public Access` (all 4 flags). Direct public reads return `403 Forbidden`.
- **S3: Zero-Plaintext Managed Secrets**  
  AI provider API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`), database passwords, and JWT secret tokens are stored securely in **AWS Secrets Manager** (`careerprepster/production`). Only the backend ECS task execution role has IAM permission to read and decrypt these secrets via the KMS CMK.
- **S4: Data Minimization & AI Retention Disclosure**  
  - **What is Sent to AI**: Only isolated resume bullet points, section text, and target job descriptions required for STAR/XYZ rewriting and keyword scoring.
  - **What is NEVER Sent to AI**: Student names, email addresses, university student IDs, phone numbers, home addresses, or contact information. All identifying PII is stripped prior to LLM prompt dispatch.
  - **AI Provider Retention**:
    - *Groq Cloud*: Enterprise/API data is **not retained for model training**; transient request logs are held for zero retention / maximum 30 days solely for security/abuse debugging.
    - *Google Gemini*: API paid/tier terms retain zero customer prompts for training.

---

### 2.5 Required Client Alerts

1. **Alert 1: AI Failing**  
   - *Trigger*: Backend emits structured logs `[CRITICAL_AI_OUTAGE]` upon receiving HTTP 429, 500, 502, 503, 504, or network timeouts from the AI provider.
   - *Threshold*: $\ge 2$ AI failure events within a 5-minute evaluation window.
   - *Action*: CloudWatch Alarm dispatches an immediate email notification via Amazon SNS topic `careerprepster-critical-alerts` to `alerts@careerprepster.com`.
2. **Alert 2: AI Cost Over Budget**  
   - *Trigger*: Daily AI token consumption expenditure or overall AWS daily burn rate exceeds the team's operational cap ($10.00/day for AI calls or $100.00/month AWS budget).
   - *Threshold*: Daily cumulative spend passes 100% of the set daily budget threshold.
   - *Action*: AWS Budgets / CloudWatch Alarm triggers an SNS email notification to `finance-alerts@careerprepster.com`.

---

## 3. The Six Core Design Questions (Deliverable 1C)

1. **What kind of database fits CVs, sections, and reviews linked to students?**  
   - **Answer**: A **Relational Database (Amazon RDS MySQL 8.0/8.4)**. CareerPrepster's domain is inherently relational with strict foreign-key dependencies: 1 Student has many CVs; 1 CV has many CVSections; 1 CV has multiple ATSReviews. Relational ACID transactions prevent orphan sections, guarantee data integrity, and enable indexed lookups on `student_id` for sub-millisecond tenancy enforcement.
2. **Where do exported CVs live, and how does a student download only their own?**  
   - **Answer**: Exported CV PDFs live in a private **Amazon S3 bucket** (`careerprepster-media-*`) under tenant-partitioned keys `exports/{student_id}/cv-{date}.pdf`, encrypted with an AWS KMS Customer Managed Key. The bucket has **Block All Public Access** enabled. When a student requests a download, the backend authenticates their JWT, verifies that the requesting `student_id` matches the path, and generates a **pre-signed URL valid for 15 minutes**. No student can ever guess or access another student's export.
3. **How does your design let the team switch AI provider (R4) without rebuilding everything?**  
   - **Answer**: The backend implements an **AI Provider Adapter Pattern** (`IAiProvider` interface exposing `rewriteBulletPoint(bullet, framework)` and `scoreAts(cvText)`). Concrete implementations (`GroqProvider`, `GeminiProvider`, `OpenAiProvider`) encapsulate provider-specific SDKs and prompt schemas. The active provider is controlled by the `AI_PROVIDER` and `GROQ_API_KEY`/`GEMINI_API_KEY` environment variables stored in AWS Secrets Manager. Switching from Groq to Gemini requires simply updating the secret value and restarting the ECS task—zero code changes, zero container rebuilds, zero frontend impact.
4. **Fixed capacity or automatic scaling? The load is heavy in the evenings and in internship season.**  
   - **Answer**: **Automatic Scaling (Target Tracking Auto Scaling on AWS Fargate)**. Fixed capacity would either under-provision during evening rushes (causing 504 Gateway Timeouts for 300 concurrent students) or waste money running unneeded containers 24/7 during off-peak hours. The design sets a baseline of **2 Fargate tasks** (1 in each AZ for high availability) and scales out up to **6 tasks** when CPU exceeds 70% or ALB request rate spikes, automatically scaling back down after 23:00.
5. **In your price estimate, which feature costs the most in AI calls, and how do you cap it?**  
   - **Answer**: The **Interactive AI Interview Coach Drills** (or frequent STAR/XYZ bullet rewrites with large context prompts) consume the most AI tokens due to multi-turn conversational history. We cap this through a three-layer strategy:
     1. *In-App Token Bucket Rate Limiter*: Maximum 15 AI calls per student per hour and 50 per day.
     2. *Prompt Engineering & Token Truncation*: Strict `max_tokens: 500` limits per response.
     3. *AWS Budgets & CloudWatch Alarm*: Automated daily budget alerts halting non-critical calls or triggering email notification if spend exceeds $10/day.
6. **If a server's credentials were stolen, whose CVs could an attacker read, and what limits that?**  
   - **Answer**: Because all backend tasks execute as the application identity, compromised database or backend server credentials could theoretically query active database tables. However, damage is tightly constrained by our defense-in-depth architecture:
     - *No Public Access*: The RDS instance and S3 bucket reside in isolated private subnets with no public IP. The attacker cannot connect from their laptop; they must execute within the VPC.
     - *KMS CMK Key Policy*: Decryption of S3 files and RDS volumes requires IAM permissions to call `kms:Decrypt` on `alias/careerprepster-cmk`. CloudTrail logs every single decrypt API call, generating instant alerts on bulk export anomalies.
     - *Pre-Signed URL Constraint*: S3 bucket objects cannot be listed globally without the specific IAM role permissions, and public access is permanently blocked at the AWS account level.

---

## 4. Complete Deliverables Architecture (Parts 1 & 2)

### 4.1 Section 1: AWS Architecture & Configuration
- **Deliverable 1A (Architecture Diagram)**: Detailed topology with real address ranges (`10.0.0.0/16`), 2 AZs (`ap-southeast-1a/b`), component counts, and traffic flows.
- **Deliverable 1B (Configuration Detail)**: Complete resource table with settings, one-line rationales, real JSON IAM/KMS/S3 policies, compute, storage, backups, and tags.
- **Deliverable 1C (Scenario Justification)**: What each resource does, what breaks without it, R1–R6 and S1–S4 traceability, and the 6 design questions answered.
- **Deliverable 1D (Infrastructure as Code)**: Codified via Terraform with a mandatory **progressive Git commit history** across Level 1 (network/firewalls), Level 2 (full architecture + S1–S4 security tests), and Level 3 (one-command validation and security scan). Exactly 3 configuration values spot-checked against Deliverable 1B. Rehearsed for the live defense requirement where the IaC author changes one line live and re-runs the tests.
- **Deliverable 1E (Price Estimate)**: Comprehensive pricing for Normal Month vs Peak Month, AI token costs, and cost optimization levers.

### 4.2 Section 2: Cloudflare Self-Hosting Demo
Step-by-step procedure to publish the application live from a student laptop using `cloudflared tunnel --url http://localhost:8000`, test from a mobile phone on cellular data, prove no open inbound ports or public IP (`ss -tlnp`), stop tunnel, and articulate inbound vs outbound security architecture.
