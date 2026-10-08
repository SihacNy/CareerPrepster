# Implementation Plan: Module 4 - AWS Cloud Infrastructure & Hosting Deployment

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Branch**: `module/ai-interview` (or `module/aws-cloud-hosting`) | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

---

## 1. Summary & Capstone Deliverables Mapping

This implementation plan delivers **Section 1 (AWS Design & Configuration)** and **Section 2 (Cloudflare Self-Hosting Demo)** for the CareerPrepster Capstone defense:

1. **Deliverable 1A (Architecture Diagram)**: Multi-AZ production topology labelled with real IP CIDRs (`10.0.0.0/16`), availability zones (`ap-southeast-1a` & `ap-southeast-1b`), resource names, and counts.
2. **Deliverable 1B (Configuration Detail)**: Exhaustive settings catalog with one-line rationales, real JSON IAM and KMS policies, compute, storage, KMS CMK encryption at rest, backups, the two client alerts, and standard tags.
3. **Deliverable 1C (Scenario Justification)**: Value of each component, failure analysis ("what breaks without it"), full traceability to **Requirements R1–R6** and **Security Rules S1–S4**, and comprehensive answers to the **Six Design Questions**.
4. **Deliverable 1D (Infrastructure as Code)**: Automated IaC specification (Terraform/CloudFormation) covering Level 1 (network & firewall rules), Level 2 (full architecture & S1–S4 security tests), and Level 3 (single-command validation, test runner, and security scan).
5. **Deliverable 1E (Price Estimate)**: Resource-by-resource pricing model comparing a **Normal Month (~500 students/day)** vs a **Peak Month (~3,000 students/week with 300 evening concurrent)**, total costs, and architectural cost optimization levers.
6. **Section 2 (Cloudflare Self-Hosting Live Demo)**: Complete procedure to expose the local laptop application with zero public IP and zero open inbound ports via `cloudflared tunnel`, verify over mobile data, and defend inbound vs outbound security.

---

## 2. Technical Context & Environment Contract

- **Cloud Provider**: Amazon Web Services (AWS)
- **Primary Region**: `ap-southeast-1` (Singapore)
- **Domain Strategy**: AWS Default Domains (CloudFront `https://<distribution-id>.cloudfront.net` with native AWS wildcard SSL; no custom domain / Route 53 needed)
- **VPC CIDR**: `10.0.0.0/16` across 2 Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`)
- **Subnets**: 6 Subnets (2 Public, 2 Private Web, 2 Private DB)
- **Compute Orchestrator**: Amazon ECS on AWS Fargate (Serverless, Auto-Scaling 2 to 6 tasks)
- **Database**: Amazon RDS MySQL 8.0/8.4 (`db.t4g.micro` / `db.t4g.small`, gp3 storage, Multi-AZ capable)
- **Object Storage**: Amazon S3 (`careerprepster-media-*`) with Block Public Access and KMS CMK encryption
- **Encryption**: AWS KMS Customer Managed Key (`alias/careerprepster-cmk`)
- **Edge & CDN**: Amazon CloudFront + Application Load Balancer (ALB) with Path-Based Routing (`/api/*` and `/*`)
- **Secrets Management**: AWS Secrets Manager (`careerprepster/production`)
- **Observability**: Amazon CloudWatch Logs & Metrics + Amazon SNS Email Alerting

---

## 3. Constitution Check

*GATE: All principles from [constitution.md](../../.specify/memory/constitution.md) verified.*

| Principle | Compliance Assessment | Status |
| :--- | :--- | :---: |
| **Principle 1: Full-Stack Architecture & Separation of Concerns** | Next.js Frontend (port 3000), Express Backend (port 5000), MySQL (port 3306 in RDS). Unified under single domain via ALB path routing (`/api/*` $\to$ Backend, `/*` $\to$ Frontend). | **PASS** |
| **Principle 2: Staged AI Workflow (CV Editor → ATS Pipeline)** | Backend services preserve the sequential pipeline (STAR/XYZ bullet rewrites $\to$ ATS scoring). Deterministic Zod validation applied at API boundary before external AI calls. | **PASS** |
| **Principle 3: Modular Downstream Extensions** | AI Interview Coach and Job Matching are decoupled modules that do not block or degrade core CV drafting. | **PASS** |
| **Principle 4: Student Privacy & Data Minimization** | Relies on private VPC subnets with zero public IPs for database and containers. Pre-signed S3 URLs enforce tenancy isolation. Identifying PII (name, email, phone) is stripped prior to sending bullet points to AI. | **PASS** |
| **Principle 5: Containerization & Environment Parity** | Production multi-stage Dockerfiles mirror local Docker Compose configuration with non-root security and slim base images (`node:22-alpine`). | **PASS** |

---

## 4. Deliverable 1B: Resource Configuration Detail & Settings Catalog

| Resource Name | Chosen Settings | One-Line Rationale |
| :--- | :--- | :--- |
| **`careerprepster-vpc`** | CIDR: `10.0.0.0/16`, DNS Hostnames/Resolution: `true` | Provides 65,536 private IPs and enables internal service name resolution. |
| **Public Subnets (1a, 1b)** | `10.0.1.0/24`, `10.0.2.0/24` | Houses public ALB nodes and NAT Gateway to handle incoming internet traffic. |
| **Private Web Subnets (1a, 1b)** | `10.0.10.0/24`, `10.0.11.0/24` | Shields ECS Fargate container instances from direct internet attacks. |
| **Private DB Subnets (1a, 1b)** | `10.0.20.0/24`, `10.0.21.0/24` | Completely isolates RDS MySQL with no internet route table entry. |
| **Internet Gateway (`igw`)** | Attached to VPC, default route in `rt-public` | Allows ALB to accept public HTTPS requests and NAT Gateway to reach the internet. |
| **NAT Gateway (`nat-1a`)** | Single NAT deployed in `public-subnet-1a` with Elastic IP | Gives private ECS tasks outbound internet access (Groq/Gemini AI, Google OAuth) without incoming exposure. |
| **Security Group `sg-alb`** | Ingress: 80, 443 from `0.0.0.0/0`; Egress: 3000, 5000 | Acts as the public perimeter firewall, allowing only secure web traffic into the ALB. |
| **Security Group `sg-ecs-frontend`** | Ingress: Port 3000 strictly from `sg-alb` | Prevents bypassing load balancer and ensures frontend traffic is inspectable. |
| **Security Group `sg-ecs-backend`** | Ingress: Port 5000 strictly from `sg-alb` | Enforces that API endpoints are reachable only through the load balancer. |
| **Security Group `sg-rds`** | Ingress: Port 3306 strictly from `sg-ecs-backend` | Protects database from all sources except authenticated backend application tasks. |
| **RDS MySQL (`careerprepster-db`)** | MySQL 8.0.35, `db.t4g.micro`, 20GB gp3, Auto-scale to 100GB | Relational ACID store with automated backups and 7-day point-in-time recovery. |
| **RDS Encryption** | AWS KMS CMK (`alias/careerprepster-cmk`) | Satisfies Security Rule S2: Customer controls database encryption at rest. |
| **S3 Media Bucket** | `careerprepster-media-*`, Block Public Access: `true` | Securely stores student PDF exports and DOCX templates without public leakage. |
| **S3 Encryption** | `aws:kms` using `alias/careerprepster-cmk` | Satisfies Security Rule S2: Exported CVs encrypted with company-controlled key. |
| **AWS Secrets Manager** | Secret: `careerprepster/production`, KMS CMK encrypted | Stores AI API keys, JWT secret, and database URL securely with zero plaintext in Git. |
| **Application Load Balancer** | Scheme: `internet-facing`, Path `/api/*` and `/*` | Unifies frontend and backend under one domain, resolving CORS and cookie issues. |
| **CloudFront Distribution** | Origin: ALB, Cache `/_next/static/*`, Bypass `/api/*` | Delivers fast global asset caching and free edge DDoS protection via AWS Shield. |
| **ECS Fargate Tasks** | 0.5 vCPU, 1GB RAM per task, Auto-Scaling: 2 to 6 tasks | Scales dynamically to support 300 concurrent students during evening peaks. |
| **CloudWatch Log Groups** | Retention: 14 days, Stream: `awslogs` | Captures audit logs while automatically purging old data to avoid ballooning costs. |
| **Alert 1: AI Failing** | Metric: `GroqApiErrors >= 2` in 5m $\to$ SNS Email | Implements Requirement R5 to immediately alert on-call team of AI provider outages. |
| **Alert 2: AI Cost Over Budget** | Spend $\ge \$10.00$/day $\to$ SNS Email | Implements Requirement R5 to halt or alert on runaway AI API spending. |
| **Resource Tags** | `Project: CareerPrepster`, `Environment: Production` | Enables precise cost attribution and resource tracking in AWS Cost Explorer. |

---

## 5. Deliverable 1C: Scenario Justification & Requirement Traceability

### 5.1 Component Justification Matrix ("What it does" vs. "What breaks without it")

| Resource / Component | What it does for CareerPrepster | What breaks without it |
| :--- | :--- | :--- |
| **VPC & Subnet Isolation** | Enforces strict network boundaries separating public ingress, application logic, and student CV data. | Student CV records and database credentials would be exposed directly to public internet port scans. |
| **NAT Gateway** | Allows private Fargate backend tasks to reach Groq API and Google OAuth endpoints. | AI bullet rewriting, ATS scoring, and Google login fail completely with connection timeouts. |
| **Application Load Balancer** | Terminates SSL, routes `/api/*` to Express and `/*` to Next.js, and monitors container health. | Users cannot access the site, cookies fail across different ports, and container crashes drop user sessions. |
| **CloudFront CDN** | Caches Next.js static bundles, styles, and fonts at edge locations close to students. | High server load on frontend containers, slow page load times over mobile data, and higher bandwidth bills. |
| **AWS KMS Customer Managed Key** | Encrypts RDS data, S3 exports, and Secrets Manager secrets with customer-controlled key policies. | Violates Security Rule S2; team loses cryptographic control and audit trail over student CV data. |
| **AWS Secrets Manager** | Injects `GROQ_API_KEY`, `GEMINI_API_KEY`, and `JWT_SECRET` at container runtime without plaintext files. | Violates Security Rule S3; secrets leaked in Docker images, Git commits, or build logs. |
| **Fargate Auto Scaling** | Dynamically scales backend and frontend tasks from 2 up to 6 during evening peaks (19:00–23:00). | 300 concurrent students during internship season experience 504 Gateway Timeouts and dropped requests. |
| **CloudWatch & SNS Alerts** | Detects AI failures ($\ge 2$ in 5m) or cost spikes ($\ge \$10$/day) and sends immediate emails to team. | Violates Requirement R5; team remains unaware of student-facing AI outages or runaway billing. |

### 5.2 Traceability to Requirements (R1–R6) & Security Rules (S1–S4)

- **R1 (CV Editor & STAR/XYZ Suggestions)** $\to$ Handled by ECS Backend tasks calling Groq/Gemini via NAT Gateway; saved in MySQL `cv_sections`.
- **R2 (ATS Review Scoring & Fixes)** $\to$ Analyzed by Backend ATS engine; scores and JSON findings persisted in MySQL `ats_reviews`.
- **R3 (Student Tenancy Segregation)** $\to$ Enforced by JWT auth middleware appending `WHERE student_id = :id` on every query; S3 exports partition by `exports/{student_id}/`.
- **R4 (Pluggable AI Provider)** $\to$ Backend AI Provider Adapter pattern; swappable in Secrets Manager (`AI_PROVIDER`) without container rebuilds.
- **R5 (Proactive AI Failure & Budget Email Alerts)** $\to$ CloudWatch Metric Filters on `[CRITICAL_AI_OUTAGE]` and budget alarms dispatching to SNS topic `careerprepster-critical-alerts`.
- **R6 (Modular Add-ons: Interview Coach & Job Matching)** $\to$ Decoupled modules enabled via feature flags without touching core CV editing code.
- **S1 (Identity Checked on Every Request)** $\to$ JWT verified on all `/api/*` requests; pre-signed S3 download URLs generated only after session identity validation.
- **S2 (Customer-Controlled Encryption at Rest)** $\to$ AWS KMS CMK (`alias/careerprepster-cmk`) encrypts RDS storage and S3 bucket; S3 Block Public Access is 100% active.
- **S3 (AI Key as Managed Secret)** $\to$ AWS Secrets Manager stores `GROQ_API_KEY` and `GEMINI_API_KEY`; decrypted strictly by ECS Task Execution Role.
- **S4 (Data Minimization & AI Retention)** $\to$ PII scrubbed before prompt dispatch; provider retention documented (Groq: 0-training, 30-day max debug retention).

---

## 6. Deliverable 1E: Price Estimate (Normal Month vs. Peak Month)

### 6.1 Monthly Cost Comparison Table (ap-southeast-1 Region)

| Resource / Service | Configuration / Basis | Normal Month (~500 students/day) | Peak Month (~3,000 students/wk, 300 evening concurrent) |
| :--- | :--- | :---: | :---: |
| **DNS & Custom Domains** | **AWS Default Domains** (No Route 53 / custom domain) | **$0.00** (Not needed) | **$0.00** (Not needed) |
| **SSL/TLS Certificates** | CloudFront Default Wildcard Certificate (`*.cloudfront.net`) | **$0.00** (Native Free) | **$0.00** (Native Free) |
| **Amazon CloudFront** | Edge CDN (Data transfer + HTTP requests) | **$0.00** (Covered by 1TB Free Tier) | $1.50 (Over free tier egress) |
| **Application Load Balancer (ALB)** | 1 ALB ($0.0225/hr) + LCU-hours | $18.50 | $22.00 (Higher LCU concurrency) |
| **AWS Fargate: Backend Service** | Baseline: 2 tasks (0.5 vCPU, 1GB RAM)<br>Peak: Auto-scales up to 4 tasks in evenings | $18.00 | $27.00 (Burst hours) |
| **AWS Fargate: Frontend Service** | Baseline: 2 tasks (0.5 vCPU, 1GB RAM)<br>Peak: Auto-scales up to 4 tasks in evenings | $18.00 | $27.00 (Burst hours) |
| **VPC NAT Gateway** | 1 Managed NAT Gateway ($0.045/hr + $0.045/GB) | $33.50 | $35.00 |
| **Amazon RDS MySQL** | `db.t4g.micro`, 20GB gp3 storage | **$0.00** (Free Tier Yr 1) or $14.80 | $15.50 (Slightly higher I/O) |
| **Amazon S3 Storage** | PDF exports & templates (Storage + GET/PUT) | $0.20 | $0.80 |
| **AWS KMS Customer Managed Key** | 1 CMK ($1.00/mo) + Cryptographic operations | $1.05 | $1.20 |
| **AWS Secrets Manager** | 1 Secret with JSON key/value pairs | $0.45 | $0.45 |
| **Amazon CloudWatch + SNS** | Log streams (14-day retention), 4 Alarms, Email SNS | **$0.00** (Covered by Free Tier) | $1.00 |
| **AI Inference Tokens (Groq / Gemini)** | Normal: ~2,000 calls/day<br>Peak: ~8,000 calls/day (Llama-3.3-70B rates) | $3.50 | $14.00 |
| **TOTAL ESTIMATED MONTHLY SPEND** | **All Resources Combined** | **~$93.70 / month**<br>*(or ~$78.90 with RDS Free Tier)* | **~$146.05 / month** |

### 6.2 What Would You Change to Cut Costs?
1. **Replace Managed NAT Gateway with `fck-nat` (Save ~$30.00/month)**:  
   Deploying an open-source `fck-nat` AMI on an ARM `t4g.nano` instance ($3.20/month) eliminates the $32.85/month AWS managed NAT fee, slashing baseline infrastructure cost from ~$94 down to **~$64/month**.
2. **Utilize Fargate Spot for Frontend Tasks (Save ~70% on Frontend Compute)**:  
   Running secondary auto-scaled frontend tasks on `FARGATE_SPOT` capacity providers reduces per-task hourly cost from $0.040 to $0.012, saving ~$15/month during peak season.
3. **Strict AI Rate Limiting & Prompt Optimization**:  
   Limiting multi-turn interview coach conversations and caching ATS system prompts reduces peak AI token costs by 40%.

---

## 7. Deliverable 1D: Infrastructure as Code (IaC) Architecture & Live Defense Requirements

The infrastructure is codified using **Terraform** (`infra/terraform/`) structured strictly to satisfy the Capstone grading requirements:

### 7.1 Progressive Git Commit History (Mandatory Rubric)
The git repository must prove iterative IaC engineering through distinct, sequential commits rather than a single monolithic dump:

1. **Commit 1 (Level 1)**: `feat(infra): level 1 network & firewall rules with automated tests`
   - Files: `vpc.tf`, `subnets.tf`, `security_groups.tf`, `tests/level1_firewall_test.py`
   - Content: VPC `10.0.0.0/16`, 6 subnets across 2 AZs, and least-privilege security groups.
2. **Commit 2 (Level 2)**: `feat(infra): level 2 full architecture with security rules S1-S4 tests`
   - Files: `rds.tf`, `s3.tf`, `kms.tf`, `secrets.tf`, `ecs.tf`, `alb.tf`, `cloudwatch.tf`, `tests/level2_security_rules_test.py`
   - Content: Full storage, compute, and encryption with automated tests verifying S1, S2, S3, and S4.
3. **Commit 3 (Level 3)**: `feat(infra): level 3 automated test runner and security scan pipeline`
   - Files: `scripts/test-infra.sh` (or `test-infra.ps1`), security scanner configuration (`checkov` / `tfsec`).
   - Content: Single-command validation, full test suite execution, and security vulnerability scan output.

### 7.2 The 3 Spot-Checked Configuration Values
The evaluators will verify that code values match the Configuration Detail (Deliverable 1B):
1. **VPC CIDR**: `10.0.0.0/16` in `vpc.tf` matches Deliverable 1B.
2. **Container Ports**: Backend Port `5000` and Frontend Port `3000` in `ecs.tf` match ALB target groups.
3. **RDS Instance Specs**: MySQL 8.0/8.4 on `db.t4g.micro` with `20` GB gp3 storage in `rds.tf`.

### 7.3 Live Defense: "IaC Author Changes One Line Live and Re-runs Tests"
During the defense, the evaluators will instruct the IaC author to modify a single line of code live and re-run the tests to prove test harness authenticity and responsiveness.

#### Defense Demonstration Script:
1. **Initial Baseline State**:
   - Run the one-command validation script:
     ```bash
     bash scripts/test-infra.sh   # or npm run test:infra
     ```
   - **Expected Output**:
     ```text
     [INFO] Validating Terraform syntax... SUCCESS
     [INFO] Running Level 1 Firewall Tests... PASS (4/4 passed)
     [INFO] Running Level 2 Security Rules Tests (S1-S4)... PASS (4/4 passed)
     [INFO] Running Level 3 Security Scan (Checkov/Tfsec)... 0 CRITICAL FINDINGS
     ALL INFRASTRUCTURE TESTS PASSED! (Duration: 3.2s)
     ```
2. **Live One-Line Modification (Evaluator Prompt)**:
   - Evaluator asks: *"Introduce a firewall misconfiguration or change an allowed port."*
   - Author opens `security_groups.tf`, navigates to `sg-rds` ingress, and changes line 42:
     ```diff
     - from_port = 3306
     + from_port = 80   # or changes security_groups = [aws_security_group.ecs_backend.id] to cidr_blocks = ["0.0.0.0/0"]
     ```
3. **Live Re-run**:
   - Author instantly runs:
     ```bash
     bash scripts/test-infra.sh
     ```
4. **Immediate Test Catch & Defense Explanation**:
   - The test fails within 2 seconds:
     ```text
     FAIL: test_rds_port_restricted (tests/level1_firewall_test.py)
     AssertionError: sg-rds must only allow port 3306 from sg-ecs-backend. Detected unauthorized port or public CIDR 0.0.0.0/0!
     [EXIT CODE: 1]
     ```
   - **Author Explanation**:
     > *"As demonstrated, our automated test suite immediately caught the misconfiguration. The test asserts that the database security group strictly enforces port 3306 and rejects any non-backend or public ingress, proving that our IaC tests guard our security rules continuously."*
5. **Revert and Re-verify**:
   - Author reverts the change (`git checkout security_groups.tf` or undo edit) and re-runs `bash scripts/test-infra.sh` $\to$ Returns to **100% PASSING**.

---

## 8. Section 2: Cloudflare Self-Hosting Live Demo Guide

Step-by-step walkthrough for the live in-class demonstration:

1. **Pre-requisite Setup**: Install `cloudflared` CLI on the presentation laptop (`choco install cloudflared` or `brew install cloudflared`).
2. **Launch Local Application**: Run the CareerPrepster prototype or preview server locally on port 8000:
   ```bash
   python -m http.server 8000  # or start node/next dev server
   ```
3. **Publish via Cloudflare Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
   *Terminal outputs an ephemeral HTTPS URL: `https://<random-subdomain>.trycloudflare.com`.*
4. **Live Verification on Mobile Phone**:
   - Disconnect phone from local Wi-Fi; switch strictly to **mobile cellular data**.
   - Navigate to the `trycloudflare.com` URL in the mobile browser.
   - Enter an invented resume bullet point (e.g. `"Managed a group project to build a database app"`), submit, and display the AI STAR/XYZ rewrite or ATS diagnostic score.
5. **Prove No Public IP & No Open Inbound Port**:
   - In a terminal on the laptop, execute:
     ```bash
     # Windows PowerShell:
     Get-NetTCPConnection -State Listen | Where-Object { $_.LocalAddress -eq '0.0.0.0' }
     # Linux / macOS:
     ss -tlnp  # or netstat -an | grep LISTEN
     ```
   - Show the evaluator that the laptop has **no open inbound firewall ports** and **no public routable IP address**.
6. **Stop the Tunnel**:
   - Press `Ctrl + C` in the `cloudflared` terminal.
   - Refresh the mobile phone browser: demonstrate that the site immediately times out with an HTTP 530 / connection error.
7. **Defend the Architecture (Connection Direction Comparison)**:
   - *Cloudflare Tunnel*: Establishes an **outbound-only TCP/QUIC connection** from the laptop to Cloudflare's nearest edge data center. Inbound requests from the phone are routed over Cloudflare's internal network back through this established outbound pipe.
   - *Comparison with AWS Architecture*: Exactly mirrors how CareerPrepster's private ECS Fargate tasks and private RDS instances operate: they reside behind an ALB and NAT Gateway with **zero inbound public IP addresses**, initiating only secure outbound connections to external APIs via NAT.

---

## 9. Implementation Roadmap & Task Breakdown

### Phase 1: Security & Registries (Section 1 & 6)
- **Task 1.1**: Author ECR repository definitions (`careerprepster-backend`, `careerprepster-frontend`) with scan-on-push enabled.
- **Task 1.2**: Define IAM Roles: `CareerPrepsterEcsTaskExecutionRole` (Secrets Manager & KMS access) and `CareerPrepsterBackendTaskRole` (S3 read/write).
- **Task 1.3**: Configure AWS KMS Customer Managed Key (`alias/careerprepster-cmk`) with real JSON key policy (Security Rule S2).

### Phase 2: Core VPC Networking (Section 2 & 3)
- **Task 2.1**: Provision VPC (`10.0.0.0/16`) across `ap-southeast-1a` and `ap-southeast-1b`.
- **Task 2.2**: Provision 6 subnets (2 Public, 2 Private Web, 2 Private DB) with Internet Gateway and single NAT Gateway in `public-subnet-1a`.
- **Task 2.3**: Codify the 4 Security Groups (`sg-alb`, `sg-ecs-frontend`, `sg-ecs-backend`, `sg-rds`) following the least-privilege matrix.

### Phase 3: Storage & Secrets (Section 4 & 5)
- **Task 3.1**: Create S3 bucket `careerprepster-media-*` with Block Public Access and KMS CMK server-side encryption.
- **Task 3.2**: Provision Amazon RDS MySQL 8.0/8.4 in private DB subnet group with KMS CMK encryption and 7-day automated backups.
- **Task 3.3**: Populate Secrets Manager secret `careerprepster/production` with `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, and Google OAuth keys.

### Phase 4: Application Load Balancer & ECS Orchestration (Section 7 & 8)
- **Task 4.1**: Provision internet-facing ALB with Target Groups `tg-backend` (port 5000, `/api/health`) and `tg-frontend` (port 3000, `/`).
- **Task 4.2**: Configure ALB path-based routing: `/api/*` $\to$ backend, `/*` $\to$ frontend.
- **Task 4.3**: Register ECS Fargate task definitions with runtime Secrets Manager injections and migration entrypoints.
- **Task 4.4**: Configure Fargate Target Tracking Auto-Scaling (min 2, max 6 tasks, scaling on CPU > 70% and ALB request count).

### Phase 5: Observability, Alerts & Live Demo (Section 9 & 10)
- **Task 5.1**: Configure CloudWatch log groups with 14-day retention.
- **Task 5.2**: Deploy Alert 1 (AI Failing: $\ge 2$ Groq/Gemini errors in 5m $\to$ SNS Email).
- **Task 5.3**: Deploy Alert 2 (AI Cost Over Budget: Daily spend $\ge \$10.00$ $\to$ SNS Email).
- **Task 5.4**: Rehearse and verify Section 2 Cloudflare self-hosting demo script.
