# Tasks: 004 - AWS Cloud Infrastructure & Hosting Deployment

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Branch**: `module/ai-interview` (or `module/aws-cloud-hosting`) | **Date**: 2026-10-07  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

---

## Phase 1: Setup (Shared Infrastructure & Terraform Tooling)

**Purpose**: Initialize the Infrastructure as Code (IaC) workspace and baseline provider configuration.

- [ ] T001 Initialize Terraform workspace structure and AWS provider (`ap-southeast-1`) in `infra/terraform/main.tf`
- [ ] T002 [P] Define input variables and resource naming conventions in `infra/terraform/variables.tf`
- [ ] T003 [P] Configure standard output declarations (VPC ID, Subnets, Endpoint URLs) in `infra/terraform/outputs.tf`

---

## Phase 2: Foundational (VPC Core Networking & Security Groups — Level 1 IaC)

**Purpose**: Core network infrastructure requested as the primary starting point ("start with vpc first") and Level 1 of the Capstone IaC rubric.

**⚠️ CRITICAL**: All downstream compute, database, and load balancing services depend on this network foundation.

- [ ] T004 Create custom VPC `careerprepster-vpc` with CIDR `10.0.0.0/16` and DNS hostnames enabled in `infra/terraform/vpc.tf`
- [ ] T005 [P] Provision 6 subnets across Availability Zones `ap-southeast-1a` and `ap-southeast-1b` (2 Public, 2 Private App, 2 Private DB) in `infra/terraform/subnets.tf`
- [ ] T006 [P] Provision Internet Gateway (`careerprepster-igw`) and Elastic IP + NAT Gateway in `public-subnet-1a` in `infra/terraform/routes.tf`
- [ ] T007 Configure route tables `rt-public` (routes `0.0.0.0/0 -> IGW`) and `rt-private` (routes `0.0.0.0/0 -> NAT`) in `infra/terraform/routes.tf`
- [ ] T008 Implement least-privilege Security Groups (`sg-alb`, `sg-ecs-frontend`, `sg-ecs-backend`, `sg-rds`) in `infra/terraform/security_groups.tf`
- [ ] T009 Implement Level 1 automated firewall & network unit test proving `sg-rds` rejects ingress from `sg-alb` and public internet in `infra/terraform/tests/level1_firewall_test.py`

**Checkpoint**: Foundation ready — VPC topology, subnets, route tables, and firewall rules pass Level 1 validation.

---

## Phase 3: User Story 1 - Secure Private VPC & Isolation (Priority: P1) 🎯 MVP

**Goal**: Establish complete network boundary isolation where databases and container tasks have zero public IPs and egress traffic to Groq AI / Google OAuth is mediated solely through the NAT Gateway.

**Independent Test**: Run `python infra/terraform/tests/test_vpc_isolation.py` to assert that RDS subnets have no route to IGW and that `sg-rds` rejects non-backend connections.

### Tests for User Story 1
- [ ] T010 [P] [US1] Create automated isolation test asserting RDS subnets have no internet routes in `infra/terraform/tests/test_vpc_isolation.py`

### Implementation for User Story 1
- [ ] T011 [US1] Enable VPC Flow Logs to CloudWatch Log Group `/vpc/careerprepster-flow-logs` in `infra/terraform/vpc.tf`
- [ ] T012 [P] [US1] Create RDS DB Subnet Group across `private-db-subnet-1a` and `private-db-subnet-1b` in `infra/terraform/subnets.tf`
- [ ] T013 [US1] Validate VPC CIDRs and subnet allocations against [data-model.md Section 1](./data-model.md#1-network-topology--subnet-allocations) in `infra/terraform/subnets.tf`

**Checkpoint**: User Story 1 complete. Core network boundary is securely isolated.

---

## Phase 4: User Story 2 - Customer-Controlled Storage & Managed Secrets (Priority: P2)

**Goal**: Satisfy Security Rules S2 and S3: all student CVs, database records, and exported PDFs are encrypted at rest using an AWS KMS Customer Managed Key (`alias/careerprepster-cmk`), and AI credentials reside strictly in AWS Secrets Manager.

**Independent Test**: Run `python infra/terraform/tests/level2_security_rules_test.py` to verify that S2 encryption is enforced on S3/RDS and S3 public access is blocked.

### Tests for User Story 2
- [ ] T014 [P] [US2] Write automated tests asserting S1, S2, and S3 compliance in `infra/terraform/tests/level2_security_rules_test.py`

### Implementation for User Story 2
- [ ] T015 [US2] Provision AWS KMS Customer Managed Key (`alias/careerprepster-cmk`) with JSON Key Policy in `infra/terraform/kms.tf`
- [ ] T016 [P] [US2] Create private S3 bucket `careerprepster-media-*` with Block Public Access and KMS CMK encryption in `infra/terraform/s3.tf`
- [ ] T017 [P] [US2] Implement S3 Bucket Policy enforcing HTTPS transport and denying unencrypted `PutObject` in `infra/terraform/s3.tf`
- [ ] T018 [US2] Provision Amazon RDS MySQL 8.0 instance (`careerprepster-db`, `db.t4g.micro`, gp3 20GB) with KMS CMK encryption and 7-day backups in `infra/terraform/rds.tf`
- [ ] T019 [US2] Provision AWS Secrets Manager secret `careerprepster/production` with KMS CMK encryption in `infra/terraform/secrets.tf`
- [ ] T020 [P] [US2] Define IAM Roles (`CareerPrepsterEcsTaskExecutionRole` and `CareerPrepsterBackendTaskRole`) with least-privilege JSON policies in `infra/terraform/iam.tf`

**Checkpoint**: User Story 2 complete. Persistent data and secrets are cryptographically secured with company-controlled KMS CMK.

---

## Phase 5: User Story 3 - Edge Routing & Unified Load Balancing (Priority: P3)

**Goal**: Expose the full-stack application under the AWS default domain (`https://<distribution-id>.cloudfront.net`) with native wildcard SSL, routing `/api/*` to backend and `/*` to frontend via an Application Load Balancer.

**Independent Test**: Execute `curl -I http://<ALB_DNS>/api/health` and verify HTTP 200 routing without CORS or cookie partition errors.

### Implementation for User Story 3
- [ ] T021 [P] [US3] Create Target Groups `tg-careerprepster-backend` (port 5000, `/api/health`) and `tg-careerprepster-frontend` (port 3000, `/`) in `infra/terraform/alb.tf`
- [ ] T022 [US3] Provision internet-facing ALB in public subnets with path-based routing rules (`/api/*` and `/*`) in `infra/terraform/alb.tf`
- [ ] T023 [US3] Configure CloudFront Distribution using ALB DNS origin with native AWS wildcard certificate (`*.cloudfront.net`) in `infra/terraform/cloudfront.tf`
- [ ] T024 [P] [US3] Configure CloudFront cache behaviors (caching disabled on `/api/*`, optimized for static Next.js assets) in `infra/terraform/cloudfront.tf`

**Checkpoint**: User Story 3 complete. Edge ingress and path routing function seamlessly under the AWS default domain.

---

## Phase 6: User Story 4 - Resilient Auto-Scaled Compute & AI Egress (Priority: P4)

**Goal**: Run containerized Express backend and Next.js frontend on AWS Fargate serverless containers across 2 AZs, dynamically auto-scaling between 2 and 6 tasks to absorb evening peak loads (300 concurrent students).

**Independent Test**: Check ECS task health via CloudWatch container insights and simulate scale-out trigger when CPU exceeds 70%.

### Implementation for User Story 4
- [ ] T025 [P] [US4] Author production multi-stage `backend/Dockerfile` and `frontend/Dockerfile` with non-root security and slim base images
- [ ] T026 [US4] Provision ECS Cluster `careerprepster-cluster` with Fargate and FARGATE_SPOT capacity providers in `infra/terraform/ecs.tf`
- [ ] T027 [US4] Register ECS Task Definitions for Backend and Frontend with runtime Secrets Manager injections in `infra/terraform/ecs.tf`
- [ ] T028 [US4] Create ECS Services in private app subnets attached to ALB target groups in `infra/terraform/ecs.tf`
- [ ] T029 [US4] Configure Fargate Target Tracking Auto Scaling (min 2, max 6 tasks, scaling on CPU > 70% and ALB request count) in `infra/terraform/ecs.tf`

**Checkpoint**: User Story 4 complete. Container services auto-heal and scale dynamically.

---

## Phase 7: User Story 5 - Proactive Alerts & Live Defense Test Runner (Priority: P5)

**Goal**: Implement the two mandatory Capstone client alerts (Alert 1: AI Failing, Alert 2: AI Cost Over Budget), create the Level 3 single-command test runner (`scripts/test-infra.sh`), and rehearse the live defense one-line change drill.

**Independent Test**: Run `bash scripts/test-infra.sh` to execute syntax validation, firewall tests, S1–S4 security tests, and vulnerability scans in a single pass.

### Implementation for User Story 5
- [ ] T030 [P] [US5] Create Amazon SNS Topic `careerprepster-critical-alerts` with email subscription in `infra/terraform/cloudwatch_alarms.tf`
- [ ] T031 [US5] Configure CloudWatch Metric Filter on `[CRITICAL_AI_OUTAGE]` and Alarm (Alert 1: $\ge 2$ errors in 5m $\to$ SNS Email) in `infra/terraform/cloudwatch_alarms.tf`
- [ ] T032 [US5] Configure CloudWatch Billing Metric Alarm (Alert 2: AI Daily Spend $\ge \$10.00$ $\to$ SNS Email) in `infra/terraform/cloudwatch_alarms.tf`
- [ ] T033 [US5] Implement Level 3 single-command automated test runner in `scripts/test-infra.sh` (or `scripts/test-infra.ps1`)
- [ ] T034 [P] [US5] Author live defense rehearsal drill script demonstrating the one-line security group change live in `scripts/defense-one-line-drill.sh`
- [ ] T035 [P] [US5] Author Section 2 Cloudflare self-hosting demo helper script in `scripts/run-cloudflare-demo.sh`

**Checkpoint**: User Story 5 complete. Both alerts, single-command test harness, and live defense drills are fully executable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validation, spot-check matching, and progressive Git commit history formatting.

- [ ] T036 [P] Verify the 3 spot-checked values match Deliverable 1B (VPC CIDR `10.0.0.0/16`, Ports 5000/3000, RDS `db.t4g.micro` 20GB) in `infra/terraform/`
- [ ] T037 Format progressive Git commits (Commit 1: Level 1, Commit 2: Level 2, Commit 3: Level 3) per Capstone brief instructions
- [ ] T038 Execute end-to-end smoke verification using `scripts/test-infra.sh` and document test outputs

---

## Dependencies & Execution Order

### Phase Dependencies
1. **Setup (Phase 1)**: No dependencies — can start immediately.
2. **Foundational (Phase 2 - VPC first)**: Depends on Setup. **Blocks all compute, database, and storage phases.**
3. **User Stories (Phase 3 through 7)**:
   - **US1 (VPC Isolation)**: Depends on Phase 2.
   - **US2 (Storage & KMS CMK)**: Depends on US1 (DB subnet group and security groups).
   - **US3 (Edge & ALB)**: Depends on US1 (public subnets & ALB security group).
   - **US4 (Compute & Fargate)**: Depends on US2 (RDS & Secrets) and US3 (ALB Target Groups).
   - **US5 (Alerts & Test Runner)**: Depends on US1–US4.
4. **Polish (Phase 8)**: Depends on all user stories being implemented.

### Parallel Execution Opportunities
- Setup tasks `T002` and `T003` can execute in parallel.
- Subnets (`T005`), Gateways/Routes (`T006`), and Security Groups (`T008`) can be authored concurrently within Phase 2.
- S3 Bucket (`T016`), Bucket Policy (`T017`), and IAM Roles (`T020`) can be implemented in parallel with RDS (`T018`).
- Dockerfiles (`T025`) and CloudFront Cache Behaviors (`T024`) can run in parallel.
- Test runner scripts (`T033`, `T034`, `T035`) can be drafted in parallel with CloudWatch alarm definitions.

---

## Implementation Strategy: Starting with VPC First (MVP Increment)

As requested, implementation begins strictly with **VPC Core Networking (Phase 2)**:
1. Complete `T001`–`T003` (Terraform provider & variables setup).
2. Complete `T004`–`T009` (VPC CIDR `10.0.0.0/16`, 6 subnets across 2 AZs, IGW, NAT Gateway, route tables, and security groups).
3. **Validate Level 1**: Run `python infra/terraform/tests/level1_firewall_test.py` and commit:
   `git commit -m "feat(infra): level 1 network & firewall rules with automated tests"`
4. Proceed incrementally to Storage/KMS (Level 2) and Test Runner (Level 3).
