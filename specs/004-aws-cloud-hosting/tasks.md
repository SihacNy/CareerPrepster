# Tasks: 004 - AWS Cloud Infrastructure & Hosting Deployment

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Branch**: `module/ai-interview` | **Date**: 2026-10-07  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Guide**: [quickstart.md](./quickstart.md) | **Data Model**: [data-model.md](./data-model.md)

---

## 👥 Team Assignment Roster

| Phase | Phase Title | Assigned Owner(s) | Primary Deliverable |
| :---: | :--- | :--- | :--- |
| **Phase 1** | Core VPC Networking (VPC First!) | **Sihac** | VPC `10.0.0.0/16`, 6 Subnets, IGW, NAT Gateway, Route Tables |
| **Phase 2** | Security Groups & Access Firewalls | **Bunchhour** | 4 Firewalls (`sg-alb`, `sg-frontend`, `sg-backend`, `sg-rds`) |
| **Phase 3** | IAM Roles, KMS Encryption & Secrets Manager | **Sal** | KMS CMK `careerprepster-cmk`, Secrets Manager, ECS IAM Roles |
| **Phase 4** | Persistent Storage (RDS MySQL & Private S3) | **Bunchhour & Sal** | DB Subnet Group, RDS `db.t4g.micro`, S3 Bucket + KMS Policy |
| **Phase 5** | Container Registries & Production Image Builds | **Elma** | ECR Repositories, Backend & Frontend Multi-Stage Docker Builds |
| **Phase 6** | Application Load Balancer & Edge CDN | **Sihac** | Target Groups (5000/3000), ALB Ingress, CloudFront Default Domain |
| **Phase 7** | ECS Fargate Serverless Compute & Auto-Scaling | **Sal** | Cluster, Task Definitions, Services, Target Tracking Auto-Scaling |
| **Phase 8** | Monitoring, Dual Client Alerts & Cost Governance | **Sihac** | SNS Alert Topic, Alert 1 (AI Failing), AWS Budget ($100 cap) |
| **Phase 9** | Section 2 Cloudflare Self-Hosting Live Laptop Demo | **Vid & Ronaldo** | `cloudflared` Quick Tunnel, Mobile Data Demo, Port Security Audit |
| **Phase 10** | Verification & Smoke Testing | **Bunpor** | Tests 1–7 Cloud Verification Suite & Defense Drill Rehearsal |
| **Phase 11** | Stress Testing & Peak Load Simulation | **Bunpor & Team** | 300 Concurrent Peak Stress Test, Auto-Scaling Verification, Report |

---

## Phase 1: Core VPC Networking (VPC First!) 🌐
**Owner**: **Sihac**  
**Purpose**: Provision the isolated network compound across 2 Availability Zones (`ap-southeast-1a` and `ap-southeast-1b`) as the primary foundation for all cloud services.

- [x] T001 Provision custom VPC `careerprepster-vpc` with CIDR `10.0.0.0/16` and enable DNS hostnames per [quickstart.md Step 1.1](./quickstart.md#11-create-the-vpc)
- [x] T002 [P] Create Public Subnets `public-subnet-1a` (`10.0.1.0/24`) and `public-subnet-1b` (`10.0.2.0/24`) per [quickstart.md Step 1.2](./quickstart.md#12-create-the-6-subnets-across-2-availability-zones)
- [x] T003 [P] Create Private Web Subnets `private-web-subnet-1a` (`10.0.10.0/24`) and `private-web-subnet-1b` (`10.0.11.0/24`) per [quickstart.md Step 1.2](./quickstart.md#12-create-the-6-subnets-across-2-availability-zones)
- [x] T004 [P] Create Private DB Subnets `private-db-subnet-1a` (`10.0.20.0/24`) and `private-db-subnet-1b` (`10.0.21.0/24`) per [quickstart.md Step 1.2](./quickstart.md#12-create-the-6-subnets-across-2-availability-zones)
- [x] T005 Create Internet Gateway `careerprepster-igw` and attach to VPC per [quickstart.md Step 1.3](./quickstart.md#13-create-and-attach-the-internet-gateway-igw)
- [ ] T006 Allocate Elastic IP and deploy NAT Gateway in `public-subnet-1a` for outbound AI/OAuth internet access per [quickstart.md Step 1.4](./quickstart.md#14-create-the-nat-gateway-1-way-outbound-to-groq-ai)
- [x] T007 Configure Public Route Table `rt-public` (route `0.0.0.0/0 -> IGW`) and associate with public subnets per [quickstart.md Step 1.5](./quickstart.md#15-configure-route-tables--subnet-associations)
- [x] T008 Configure Private Route Table `rt-private` (route `0.0.0.0/0 -> NAT Gateway`) and associate with private web subnets per [quickstart.md Step 1.5](./quickstart.md#15-configure-route-tables--subnet-associations)
- [x] T008b **[Test & Verify]** Verify VPC Resource Map & Subnet Isolation in AWS Console per [quickstart.md Step 1.6](./quickstart.md#16--test--verify-vpc-resource-map--subnet-isolation)

**Checkpoint**: Core VPC network topology is complete and verified with 6 subnets across 2 AZs and outbound NAT routing.

---

## Phase 2: Security Groups & Access Firewalls 🛡️
**Owner**: **Bunchhour**  
**Purpose**: Establish least-privilege perimeter and internal firewall rules.

- [ ] T009 Create ALB Security Group `sg-careerprepster-alb` allowing inbound ports 80/443 from `0.0.0.0/0` per [quickstart.md Step 2.1](./quickstart.md#21-load-balancer-firewall-sg-careerprepster-alb)
- [ ] T010 [P] Create Frontend ECS Security Group `sg-careerprepster-frontend` allowing port 3000 strictly from `sg-alb` per [quickstart.md Step 2.2](./quickstart.md#22-frontend-container-firewall-sg-careerprepster-frontend)
- [ ] T011 [P] Create Backend ECS Security Group `sg-careerprepster-backend` allowing port 5000 strictly from `sg-alb` per [quickstart.md Step 2.3](./quickstart.md#23-backend-container-firewall-sg-careerprepster-backend)
- [ ] T012 Create RDS Security Group `sg-careerprepster-rds` allowing MySQL port 3306 strictly from `sg-ecs-backend` per [quickstart.md Step 2.4](./quickstart.md#24-database-firewall-sg-careerprepster-rds)
- [ ] T012b **[Test & Verify]** Verify Security Group Least-Privilege Isolation Chain in AWS Console per [quickstart.md Step 2.5](./quickstart.md#25--test--verify-security-group-least-privilege-isolation-chain)

**Checkpoint**: Security groups form a defense-in-depth isolation chain from ALB $\to$ Containers $\to$ Database.

---

## Phase 3: IAM Roles, KMS Encryption & Secrets Management 🔐
**Owner**: **Sal**  
**Purpose**: Satisfy Security Rules S2 and S3 (customer-controlled encryption at rest and zero-plaintext managed secrets).

- [ ] T013 Create AWS KMS Customer Managed Key (CMK) `alias/careerprepster-cmk` per [quickstart.md Step 3](./quickstart.md#step-3-encryption-keys-aws-kms-console) and [data-model.md Section 5.1](./data-model.md#51-aws-kms-customer-managed-key-policy-security-rule-s2)
- [ ] T013b **[Test & Verify]** Verify KMS Key status is Enabled and Key Policy is valid per [quickstart.md Step 3.1](./quickstart.md#31--test--verify-kms-key-status--permissions)
- [ ] T014 [P] Create IAM Role `CareerPrepsterEcsTaskExecutionRole` with Secrets Manager and KMS decrypt permissions per [data-model.md Section 5.4](./data-model.md#54-ecs-task-execution-iam-role-policy-careerpreprecs-execution-role)
- [ ] T015 [P] Create IAM Role `CareerPrepsterBackendTaskRole` with S3 read/write permissions per [data-model.md Section 5.3](./data-model.md#53-backend-task-iam-role-policy-careerprepsterbackendtaskrole)
- [ ] T016 Create AWS Secrets Manager secret `careerprepster/production` storing `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, and Google OAuth keys per [quickstart.md Step 4](./quickstart.md#step-4-secrets-management-aws-secrets-manager)
- [ ] T016b **[Test & Verify]** Verify Secrets Manager secret encryption and masked value retrieval per [quickstart.md Step 4.1](./quickstart.md#41--test--verify-secret-encryption--masked-retrieval)

---

## Phase 4: Persistent Storage (Amazon RDS MySQL & Private S3) 💾
**Owner**: **Bunchhour & Sal**  
**Purpose**: Deploy durable, encrypted persistent stores for relational CV data and file exports.

- [ ] T017 Create RDS DB Subnet Group spanning `private-db-subnet-1a` and `private-db-subnet-1b` per [quickstart.md Step 6.1](./quickstart.md#61-create-db-subnet-group)
- [ ] T018 Provision Amazon RDS MySQL 8.0 instance `careerprepster-db` on `db.t4g.micro` with KMS CMK encryption per [quickstart.md Step 6.2](./quickstart.md#62-create-the-mysql-database)
- [ ] T018b **[Test & Verify]** Verify RDS Private Isolation, Subnet Attachment & Status Available per [quickstart.md Step 6.3](./quickstart.md#63--test--verify-rds-private-isolation--subnet-attachment)
- [ ] T019 Create Private S3 Bucket `careerprepster-media-<account-id>` with Block Public Access enabled per [quickstart.md Step 5](./quickstart.md#step-5-object-storage-amazon-s3)
- [ ] T020 Attach S3 Bucket Policy enforcing HTTPS transport and KMS CMK encryption per [data-model.md Section 5.2](./data-model.md#52-s3-bucket-policy-enforcing-https--kms-cmk-encryption)
- [ ] T020b **[Test & Verify]** Verify S3 Public Access Denial (`HTTP 403`) and KMS Encryption per [quickstart.md Step 5.1](./quickstart.md#51--test--verify-s3-public-access-denial--kms-encryption)

---

## Phase 5: Container Registries & Production Image Builds 🐳
**Owner**: **Elma**  
**Purpose**: Package production container images for Express and Next.js and push to Amazon ECR.

- [ ] T021 Create private ECR repositories `careerprepster-backend` and `careerprepster-frontend` with scanOnPush enabled
- [ ] T022 [P] Build production multi-stage backend Docker image and push to ECR
- [ ] T023 [P] Build production multi-stage frontend Docker image and push to ECR

---

## Phase 6: Application Load Balancer & Edge CDN ⚖️
**Owner**: **Sihac**  
**Purpose**: Set up unified path-based routing (`/api/*` $\to$ Backend, `/*` $\to$ Frontend) under the AWS default domain.

- [ ] T024 Create Target Groups `tg-careerprepster-backend` (port 5000, `/api/health`) and `tg-careerprepster-frontend` (port 3000, `/`) per [quickstart.md Step 7.1](./quickstart.md#71-create-the-2-target-groups)
- [ ] T025 Deploy internet-facing Application Load Balancer `careerprepster-alb` in public subnets per [quickstart.md Step 7.2](./quickstart.md#72-create-the-application-load-balancer)
- [ ] T026 Configure ALB listener and path routing rules (`/api/*` $\to$ backend, default `/*` $\to$ frontend) per [quickstart.md Step 7.3](./quickstart.md#73-add-the-path-based-rule-for-api)
- [ ] T026b **[Test & Verify]** Verify ALB DNS Ingress & Routing Priority per [quickstart.md Step 7.4](./quickstart.md#74--test--verify-alb-dns-ingress--routing-priority)
- [ ] T027 Provision CloudFront Distribution with ALB origin and native wildcard certificate (`*.cloudfront.net`) per [quickstart.md Step 8](./quickstart.md#step-8-cloudfront-global-cdn-edge-default-domain)
- [ ] T027b **[Test & Verify]** Verify CloudFront HTTPS Redirection & Edge CDN Headers per [quickstart.md Step 8.1](./quickstart.md#81--test--verify-cloudfront-https-redirection--edge-cdn)

---

## Phase 7: ECS Fargate Serverless Compute & Auto-Scaling 🚀
**Owner**: **Sal**  
**Purpose**: Launch containerized workloads in private subnets with auto-scaling to absorb peak internship traffic.

- [ ] T028 Create ECS Cluster `careerprepster-cluster` with Fargate capacity per [quickstart.md Step 9](./quickstart.md#step-9-serverless-containers-amazon-ecs-on-fargate)
- [ ] T029 Register Backend Task Definition (port 5000, Secrets Manager injection) per [quickstart.md Step 9](./quickstart.md#step-9-serverless-containers-amazon-ecs-on-fargate)
- [ ] T030 Register Frontend Task Definition (port 3000, Secrets Manager injection) per [quickstart.md Step 9](./quickstart.md#step-9-serverless-containers-amazon-ecs-on-fargate)
- [ ] T031 Deploy Backend and Frontend ECS Services in private web subnets attached to target groups per [quickstart.md Step 9](./quickstart.md#step-9-serverless-containers-amazon-ecs-on-fargate)
- [ ] T031b **[Test & Verify]** Verify ECS Task Health and Target Group registration status Healthy per [quickstart.md Step 9.1](./quickstart.md#91--test--verify-ecs-container-health--target-group-registration)
- [ ] T032 Configure Target Tracking Auto-Scaling policies (min 2, max 6 tasks, scaling on CPU > 70%) per [plan.md Section 5.1](./plan.md#51-component-justification-matrix-what-it-does-vs-what-breaks-without-it)

---

## Phase 8: Monitoring, Dual Client Alerts & Cost Governance 📊
**Owner**: **Sihac**  
**Purpose**: Implement the mandatory Capstone client alerts and spending limits.

- [ ] T033 Create Amazon SNS Topic `careerprepster-critical-alerts` and subscribe on-call email addresses per [quickstart.md Step 10.1](./quickstart.md#101-create-sns-email-topic)
- [ ] T034 Configure CloudWatch Metric Filter and Alarm for Alert 1 (AI Failing: $\ge 2$ errors in 5m $\to$ SNS Email) per [quickstart.md Step 10.2](./quickstart.md#102-create-alert-1-ai-failing-requirement-r5)
- [ ] T035 Configure CloudWatch Metric Alarm for Alert 2 (AI Cost Over Budget: Daily spend $\ge \$10.00$ $\to$ SNS Email) per [quickstart.md Step 10.3](./quickstart.md#103-create-alert-2-cost-over-budget-10day-or-100mo)
- [ ] T035b **[Test & Verify]** Verify Live SNS Email Alert Dispatch arrives in personal inbox in $<30$s per [quickstart.md Step 10.4](./quickstart.md#104--test--verify-live-sns-email-alert-dispatch)
- [ ] T036 Set up monthly AWS Budget ($100 cap) with automated email alerts at 50%, 80%, and 100% per [quickstart.md Step 10.3](./quickstart.md#103-create-alert-2-cost-over-budget-10day-or-100mo)

---

## Phase 9: Section 2 Cloudflare Self-Hosting Live Laptop Demo 📱
**Owner**: **Vid & Ronaldo**  
**Purpose**: Rehearse and execute the mandatory live in-class demonstration from your laptop.

- [x] T037 Install `cloudflared` CLI on the presentation laptop per [quickstart.md Step 11 Step 1](./quickstart.md#step-11-section-2--live-laptop-demo-cloudflare-quick-tunnel)
- [x] T038 Start CareerPrepster application locally on port 3000 (with Next.js `/api` rewrites) per [quickstart.md Step 11 Step 2](./quickstart.md#step-11-section-2--live-laptop-demo-cloudflare-quick-tunnel)
- [x] T039 Publish application via `cloudflared tunnel --url http://localhost:3000` and test from mobile phone on cellular data per [quickstart.md Step 11 Step 3](./quickstart.md#step-11-section-2--live-laptop-demo-cloudflare-quick-tunnel)
- [ ] T040 Demonstrate no open inbound ports (`netstat -an` / `Get-NetTCPConnection`), terminate tunnel, and deliver inbound vs outbound connection defense explanation per [quickstart.md Step 11 Steps 4-6](./quickstart.md#step-11-section-2--live-laptop-demo-cloudflare-quick-tunnel)

---

## Phase 10: Verification & Smoke Testing ✅
**Owner**: **Bunpor**  
**Purpose**: Perform rigorous end-to-end verification of all deployed cloud resources, security rules, and oral defense answers.

- [ ] T041 Verify VPC & Network Routing via Resource Map per [quickstart.md Step 12 Test 1](./quickstart.md#test-1-vpc--network-routing-verification)
- [ ] T042 [P] Verify Security Group Firewall Isolation per [quickstart.md Step 12 Test 2](./quickstart.md#test-2-security-group-firewall-isolation-verification-security-rule-s1)
- [ ] T043 [P] Verify S3 Block Public Access & KMS CMK Encryption per [quickstart.md Step 12 Test 3](./quickstart.md#test-3-s3-public-access-block--kms-encryption-test-security-rule-s2)
- [ ] T044 Verify Secrets Manager Zero-Plaintext Storage per [quickstart.md Step 12 Test 4](./quickstart.md#test-4-secrets-manager-zero-plaintext-test-security-rule-s3)
- [ ] T045 Verify ALB & CloudFront Live Endpoint Health via curl per [quickstart.md Step 12 Test 5](./quickstart.md#test-5-alb--cloudfront-live-endpoint-health-test)
- [ ] T046 Verify Proactive SNS Email Alert Dispatch per [quickstart.md Step 12 Test 6](./quickstart.md#test-6-proactive-sns-alert-notification-dispatch-test-requirement-r5)
- [ ] T047 Execute End-to-End Application Smoke Journey (Login $\to$ STAR/XYZ AI Suggest $\to$ ATS Diagnostic $\to$ PDF Export) per [quickstart.md Step 12 Test 7](./quickstart.md#test-7-end-to-end-application-smoke-journey)
- [ ] T048 Rehearse all 6 Design Questions and Scenario Justifications for defense Q&A per [research.md Section 2](./research.md#2-answers-to-the-six-design-questions-deliverable-1c)

---

## Phase 11: Stress Testing & Peak Load Simulation ⚡
**Owner**: **Bunpor & Team**  
**Purpose**: Stress-test the production cloud architecture under the Capstone scenario: **3,000 active students per week** with a concentrated surge of **300 concurrent users** during the evening rush (19:00–23:00) generating 900–1,500 AI calls/hour.

- [ ] T049 Formulate multi-tier load testing script (`k6` or `artillery`) simulating the real user traffic mix (70% Next.js static assets & home page `/`, 20% authenticated CV endpoints `/api/cvs`, 10% AI bullet rewrite `/api/ai/suggest` & ATS scans) per [quickstart.md Step 13.1](./quickstart.md#131-load-test-scenario-specification)
- [ ] T050 Execute Stage 1 Baseline Warm-up Test: Ramp 0 $\to$ 50 virtual users (VUs) over 2 minutes; verify baseline latency $p95 < 200\text{ms}$ under normal daytime load (~500 users/day) per [quickstart.md Step 13.2](./quickstart.md#132-stage-1--baseline-warm-up-test-50-vus)
- [ ] T051 Execute Stage 2 Peak Stress Ramp: Ramp concurrency up to **300 concurrent virtual users** sustaining for 10 minutes, reproducing peak internship season rush per [quickstart.md Step 13.3](./quickstart.md#133-stage-2--peak-rush-stress-test-300-concurrent-vus)
- [ ] T052 [P] Monitor and verify ECS Fargate Target Tracking Auto-Scaling: Verify CloudWatch triggers scale-out from 2 baseline tasks to 4–6 tasks when CPU utilization exceeds 70% or ALB request count per target exceeds 150 req/min per [quickstart.md Step 13.4](./quickstart.md#134-ecs-auto-scaling-metric-verification)
- [ ] T053 [P] Monitor Amazon RDS MySQL connection pool & CPU: Verify `db.t4g.micro` maintains CPU $< 80\%$ and connection pool stays healthy without dropping client queries under 300 active sessions per [quickstart.md Step 13.5](./quickstart.md#135-rds-database-health--connection-pool-audit)
- [ ] T054 Verify CloudFront Edge Cache Hit Ratio ($\ge 85\%$ for static assets) and Application Load Balancer HTTP 5xx error rate ($< 0.5\%$) during the 300-user surge per [quickstart.md Step 13.6](./quickstart.md#136-edge-cdn--alb-error-rate-audit)
- [ ] T055 Verify AI Outbound NAT Gateway Throughput & Quota Handling: Confirm Groq AI API burst calls route through NAT Gateway without socket drops, and verify application handles rate limits gracefully per [quickstart.md Step 13.7](./quickstart.md#137-ai-inference-outbound-nat-audit)
- [ ] T056 Compile Capstone Stress Test Report: Document response latency curves ($p50, p95, p99$), auto-scaling transition graph, and cost impact analysis for defense presentation per [quickstart.md Step 13.8](./quickstart.md#138-compile-stress-test-evidence-report)
