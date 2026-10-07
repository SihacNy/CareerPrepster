# Quickstart & Step-by-Step Setup Guide: AWS Cloud Infrastructure

**Feature ID**: `004-aws-cloud-hosting`  
**Date**: 2026-10-07  

---

## 1. Prerequisites Checklist

Before executing the setup steps, ensure you have:
1. **AWS Account**: Active AWS account with Administrator or PowerUser IAM access.
2. **AWS CLI v2**: Installed and configured (`aws configure` with region, e.g. `ap-southeast-1` or `us-east-1`).
3. **Docker Engine**: Docker daemon running locally (`docker version`).
5. **External API Credentials**: Groq API Key (`GROQ_API_KEY`, optional `GROQ_MODEL`), Google OAuth Client ID & Secret, and optional fallback Gemini API Key (`GEMINI_API_KEY`).

---

## 2. Section-by-Section Implementation Walkthrough

Follow the sections in this exact order to build out the architecture without dependency blocks.

```text
Section 1: IAM Roles & ECR Repositories
       │
       ▼
Section 2: Networking (VPC, Subnets, IGW, NAT Gateway)
       │
       ▼
Section 3: Security Groups & Access Rules
       │
       ▼
Section 4: Storage Layer (RDS MySQL & S3 Bucket)
       │
       ▼
Section 5: Secrets Manager & Configuration
       │
       ▼
Section 6: Build & Push Docker Images to ECR
       │
       ▼
Section 7: Load Balancing (ALB, Target Groups, Listeners)
       │
       ▼
Section 8: ECS Cluster & Fargate Services Deployment
       │
       ▼
Section 9: Edge & DNS Layer (Route 53, ACM, CloudFront)
       │
       ▼
Section 10: Monitoring, Alarms & Verification Smoke Tests
```

---

### Section 1: IAM Roles & ECR Repositories

#### 1.1 Create ECR Repositories
```bash
# 1. Backend ECR Repository
aws ecr create-repository \
  --repository-name careerprepster-backend \
  --image-scanning-configuration scanOnPush=true \
  --region ap-southeast-1

# 2. Frontend ECR Repository
aws ecr create-repository \
  --repository-name careerprepster-frontend \
  --image-scanning-configuration scanOnPush=true \
  --region ap-southeast-1
```

#### 1.2 Create ECS Execution & Task Roles
Create `CareerPrepsterEcsTaskExecutionRole` attached with `AmazonECSTaskExecutionRolePolicy` and inline permission for `secretsmanager:GetSecretValue`.

---

### Section 2: Networking Layer (VPC, Subnets, IGW & NAT)

#### 2.1 Create VPC
```bash
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=careerprepster-vpc}]'
```
*Enable DNS Hostnames on the created VPC:*
```bash
aws ec2 modify-vpc-attribute --vpc-id <VPC_ID> --enable-dns-hostnames "{\"Value\":true}"
```

#### 2.2 Create Subnets (Across 2 AZs)
- **Public Subnet 1a**: `10.0.1.0/24` (AZ: `ap-southeast-1a`)
- **Public Subnet 1b**: `10.0.2.0/24` (AZ: `ap-southeast-1b`)
- **Private App Subnet 1a**: `10.0.10.0/24` (AZ: `ap-southeast-1a`)
- **Private App Subnet 1b**: `10.0.11.0/24` (AZ: `ap-southeast-1b`)
- **Private DB Subnet 1a**: `10.0.20.0/24` (AZ: `ap-southeast-1a`)
- **Private DB Subnet 1b**: `10.0.21.0/24` (AZ: `ap-southeast-1b`)

#### 2.3 Internet Gateway & NAT Gateway
1. Create and attach **Internet Gateway** (`careerprepster-igw`) to the VPC.
2. Create Route Table `rt-public`, add route `0.0.0.0/0 -> igw`, and associate with both public subnets.
3. Allocate Elastic IP:
   ```bash
   aws ec2 allocate-address --domain vpc
   ```
4. Create **NAT Gateway** (`careerprepster-nat`) in `public-subnet-1a` using the allocated Elastic IP.
5. Create Route Table `rt-private`, add route `0.0.0.0/0 -> nat-gateway-id`, and associate with both private app subnets.

---

### Section 3: Security Groups & Access Rules

Create 4 isolated security groups in `careerprepster-vpc`:

1. **`sg-alb` (Application Load Balancer)**:
   - Inbound: `80` (HTTP) from `0.0.0.0/0`
   - Inbound: `443` (HTTPS) from `0.0.0.0/0`
   - Outbound: All traffic

2. **`sg-ecs-frontend`**:
   - Inbound: `3000` strictly from Source `sg-alb`
   - Outbound: All traffic (via NAT)

3. **`sg-ecs-backend`**:
   - Inbound: `5000` strictly from Source `sg-alb`
   - Outbound: Port `3306` to `sg-rds`, and `443` via NAT (external APIs)

4. **`sg-rds`**:
   - Inbound: `3306` strictly from Source `sg-ecs-backend`
   - Outbound: None

---

### Section 4: Storage Layer (RDS MySQL & S3 Bucket)

#### 4.1 Create S3 Bucket
```bash
aws s3api create-bucket \
  --bucket careerprepster-media-<ACCOUNT_ID> \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# Enable Block All Public Access
aws s3api put-public-access-block \
  --bucket careerprepster-media-<ACCOUNT_ID> \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

#### 4.2 Create RDS DB Subnet Group
```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name careerprepster-db-subnets \
  --db-subnet-group-description "Private DB subnets for CareerPrepster MySQL" \
  --subnet-ids "<SUBNET_DB_1A>" "<SUBNET_DB_1B>"
```

#### 4.3 Create RDS MySQL Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier careerprepster-db \
  --db-instance-class db.t4g.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username careerprepster_admin \
  --master-user-password "<STRONG_PASSWORD>" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --db-subnet-group-name careerprepster-db-subnets \
  --vpc-security-group-ids "<SG_RDS_ID>" \
  --db-name careerprepster \
  --backup-retention-period 7 \
  --no-publicly-accessible
```

---

### Section 5: Secrets Manager Configuration

Create secret `careerprepster/production`:
```bash
aws secretsmanager create-secret \
  --name careerprepster/production \
  --description "CareerPrepster Production Secrets" \
  --secret-string '{
    "DATABASE_URL": "mysql://careerprepster_admin:<STRONG_PASSWORD>@<RDS_ENDPOINT>:3306/careerprepster",
    "JWT_SECRET": "<RANDOM_64_CHAR_HEX>",
    "GROQ_API_KEY": "<YOUR_GROQ_API_KEY>",
    "GROQ_MODEL": "openai/gpt-oss-120b",
    "GEMINI_API_KEY": "<OPTIONAL_FALLBACK_GEMINI_KEY>",
    "GOOGLE_CLIENT_ID": "<YOUR_GOOGLE_CLIENT_ID>",
    "GOOGLE_CLIENT_SECRET": "<YOUR_GOOGLE_CLIENT_SECRET>",
    "CLIENT_URL": "https://<distribution-id>.cloudfront.net",
    "S3_BUCKET_NAME": "careerprepster-media-<ACCOUNT_ID>"
  }'
```

---

### Section 6: Build & Push Production Docker Images

#### 6.1 ECR Login
```bash
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com
```

#### 6.2 Build & Push Backend
```bash
docker build -t careerprepster-backend:latest -f backend/Dockerfile .
docker tag careerprepster-backend:latest <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/careerprepster-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/careerprepster-backend:latest
```

#### 6.3 Build & Push Frontend
```bash
docker build -t careerprepster-frontend:latest -f frontend/Dockerfile .
docker tag careerprepster-frontend:latest <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/careerprepster-frontend:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/careerprepster-frontend:latest
```

---

### Section 7: Load Balancing (ALB, Target Groups & Listeners)

#### 7.1 Create Target Groups
```bash
# Backend Target Group (Port 5000, awsvpc IP target)
aws elbv2 create-target-group \
  --name tg-careerprepster-backend \
  --protocol HTTP \
  --port 5000 \
  --vpc-id <VPC_ID> \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path /api/health

# Frontend Target Group (Port 3000, awsvpc IP target)
aws elbv2 create-target-group \
  --name tg-careerprepster-frontend \
  --protocol HTTP \
  --port 3000 \
  --vpc-id <VPC_ID> \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path /
```

#### 7.2 Create Application Load Balancer
```bash
aws elbv2 create-load-balancer \
  --name careerprepster-alb \
  --subnets <PUBLIC_SUBNET_1A> <PUBLIC_SUBNET_1B> \
  --security-groups <SG_ALB_ID> \
  --scheme internet-facing \
  --type application
```

#### 7.3 Configure Listeners & Path Rules
1. Add HTTP (Port 80) listener with default action: Redirect to HTTPS:443.
2. Add HTTPS (Port 443) listener:
   - Default Rule: Forward to `tg-careerprepster-frontend`.
   - Rule 1 (Path Pattern `/api/*`): Forward to `tg-careerprepster-backend`.

---

### Section 8: ECS Cluster & Fargate Services

#### 8.1 Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name careerprepster-cluster \
  --settings name=containerInsights,value=enabled
```

#### 8.2 Register Task Definitions
Register `careerprepster-backend-task` and `careerprepster-frontend-task` using the JSON specifications defined in `specs/004-aws-cloud-hosting/contracts/ecs-task-specs.md`.

#### 8.3 Create ECS Services
```bash
# 1. Backend Service
aws ecs create-service \
  --cluster careerprepster-cluster \
  --service-name careerprepster-backend-service \
  --task-definition careerprepster-backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_APP_1A>,<PRIVATE_APP_1B>],securityGroups=[<SG_BACKEND_ID>],assignPublicIp=DISABLED}" \
  --load-balancers targetGroupArn=<TG_BACKEND_ARN>,containerName=backend,containerPort=5000

# 2. Frontend Service
aws ecs create-service \
  --cluster careerprepster-cluster \
  --service-name careerprepster-frontend-service \
  --task-definition careerprepster-frontend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_APP_1A>,<PRIVATE_APP_1B>],securityGroups=[<SG_FRONTEND_ID>],assignPublicIp=DISABLED}" \
  --load-balancers targetGroupArn=<TG_FRONTEND_ARN>,containerName=frontend,containerPort=3000
```

---

### Section 9: Edge Layer with AWS Default Domain (CloudFront CDN)

Because no custom domain is used, we leverage the AWS-provided default domain and native wildcard SSL certificate:

1. **Create CloudFront Distribution with AWS Default Domain**:
   - Origin: Set origin to the ALB default DNS hostname `careerprepster-alb-xxxx.ap-southeast-1.elb.amazonaws.com` (Protocol: HTTP or HTTPS).
   - Behavior for `/api/*`: Cache Disabled (TTL=0), forward all query strings, headers, cookies, and HTTP methods (`GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`).
   - Default Behavior (`/*`): Dynamic caching for static Next.js assets (`/_next/static/*`), forward cookies for session authentication.
   - SSL/TLS: Select **CloudFront Default Certificate (`*.cloudfront.net`)** — automatically provisioned and managed by AWS with zero setup and $0.00 cost.
   - *(No Route 53 hosted zone or ACM validation needed).*
2. **Obtain Public CloudFront URL**:
   - CloudFront assigns an HTTPS URL: `https://<distribution-id>.cloudfront.net` (e.g., `https://d123456abcdef8.cloudfront.net`).
   - This serves as the public production web address for CareerPrepster.

---

### Section 10: Validation & Smoke Testing

1. **Backend Health Check via CloudFront**:
   ```bash
   curl -I https://<distribution-id>.cloudfront.net/api/health
   # Expected: HTTP/2 200 OK {"status":"healthy"}
   ```
2. **Frontend Loading via CloudFront**:
   ```bash
   curl -I https://<distribution-id>.cloudfront.net/
   # Expected: HTTP/2 200 OK
   ```
3. **Direct ALB Health Check (Fallback verification)**:
   ```bash
   curl -I http://<ALB_DNS_NAME>/api/health
   # Expected: HTTP/1.1 200 OK
   ```
4. **CloudWatch Log Streams**:
   Check `/ecs/careerprepster-backend` to ensure Prisma migrations applied cleanly.
5. **End-to-End User Journey**:
   Log in via Google OAuth, create an "Untitled Resume", run ATS scoring, and test an Interview practice session.

---

### Section 11: Cloud Burn Tracking & Budget Governance

To prevent accidental overspending (such as runaway NAT Gateway bandwidth, memory leaks, or unconstrained task auto-scaling), configure automated cloud burn guardrails:

#### 11.1 Create Monthly AWS Budget ($100 Limit)
```bash
# Define budget notification payload
cat << 'EOF' > budget.json
{
  "BudgetLimit": {
    "Amount": "100",
    "Unit": "USD"
  },
  "BudgetName": "careerprepster-monthly-budget",
  "BudgetType": "COST",
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "IncludeRefund": false,
    "IncludeCredit": false,
    "IncludeUpfront": true,
    "IncludeRecurring": true,
    "IncludeOtherSubscription": true,
    "IncludeSupport": true,
    "IncludeDiscount": true,
    "UseAmortized": false
  },
  "TimeUnit": "MONTHLY"
}
EOF

# Define notification alert levels (50%, 80%, 100% actual + 100% forecast)
cat << 'EOF' > notifications.json
[
  {
    "Notification": {
      "ComparisonOperator": "GREATER_THAN",
      "NotificationType": "ACTUAL",
      "Threshold": 50,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "Address": "alerts@yourdomain.com",
        "SubscriptionType": "EMAIL"
      }
    ]
  },
  {
    "Notification": {
      "ComparisonOperator": "GREATER_THAN",
      "NotificationType": "ACTUAL",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "Address": "alerts@yourdomain.com",
        "SubscriptionType": "EMAIL"
      }
    ]
  },
  {
    "Notification": {
      "ComparisonOperator": "GREATER_THAN",
      "NotificationType": "FORECASTED",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "Address": "alerts@yourdomain.com",
        "SubscriptionType": "EMAIL"
      }
    ]
  }
]
EOF

aws budgets create-budget \
  --account-id <ACCOUNT_ID> \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

#### 11.2 Enable Cost Anomaly Detection
```bash
# 1. Create Cost Anomaly Monitor
aws ce create-anomaly-monitor \
  --anomaly-monitor '{
    "MonitorName": "careerprepster-cost-monitor",
    "MonitorType": "DIMENSIONAL",
    "MonitorDimension": "SERVICE"
  }'

# 2. Create Anomaly Subscription to Email
aws ce create-anomaly-subscription \
  --anomaly-subscription '{
    "SubscriptionName": "careerprepster-daily-burn-alerts",
    "Threshold": 10,
    "Frequency": "DAILY",
    "MonitorArnList": ["<ANOMALY_MONITOR_ARN>"],
    "Subscribers": [
      {
        "Address": "alerts@yourdomain.com",
        "Type": "EMAIL"
      }
    ]
  }'
```

#### 11.3 CloudWatch Billing Metric Alarm
```bash
aws cloudwatch put-metric-alarm \
  --region us-east-1 \
  --alarm-name "careerprepster-monthly-charges-exceeded-80" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=Currency,Value=USD \
  --alarm-actions <SNS_ALERT_TOPIC_ARN>
```

#### 11.4 Daily Cloud Burn Check Protocol
Engineers on call should execute this routine check every Monday or post-deployment:
1. **Open AWS Cost Explorer**: Group by `Service` and view `Daily Costs (last 14 days)`.
2. **Verify Baseline Burn**:
   - `NAT Gateway`: Should hover around ~$1.10/day. If > $3.00/day, investigate outbound data egress (e.g. infinite loop to Groq/external APIs or large image downloads).
   - `Fargate Compute`: Should hover around ~$1.20/day for 2 tasks. If higher, verify task counts haven't scaled up unnecessarily.
   - `ALB`: Should hover around ~$0.65/day.
   - `RDS`: Should hover around ~$0.00/day (under free tier) or ~$0.50/day.
3. Total expected daily burn: **~$3.00 – $3.50 / day**. Anything above $5.00/day triggers immediate investigation.

---

## 12. AI Service Outage & Suspicious User Security Alerting

### 12.1 Create Critical Alerts SNS Topic & Email Subscription

```bash
# 1. Create SNS Topic for operational & security alerts
aws sns create-topic \
  --name careerprepster-critical-alerts \
  --region ap-southeast-1

# Save the returned TopicArn: arn:aws:sns:ap-southeast-1:<ACCOUNT_ID>:careerprepster-critical-alerts

# 2. Subscribe your email address to the topic
aws sns subscribe \
  --topic-arn "arn:aws:sns:ap-southeast-1:<ACCOUNT_ID>:careerprepster-critical-alerts" \
  --protocol email \
  --notification-endpoint "alerts@yourdomain.com" \
  --region ap-southeast-1
```
> **Action Required**: Check your email inbox for `"AWS Notification - Subscription Confirmation"` and click the **Confirm subscription** link.

---

### 12.2 Groq AI Service Outage & Quota Exhaustion Alerting

Detects when Groq API runs out of budget / quota (`rate_limit_exceeded`, `insufficient_quota`, `429`), hits rate limits, or experiences an upstream outage.

#### 1. CloudWatch Metric Filter on Backend Logs
```bash
aws logs put-metric-filter \
  --log-group-name "/ecs/careerprepster-backend" \
  --filter-name "GroqQuotaAndOutageFilter" \
  --filter-pattern '? "rate_limit_exceeded" ? "insufficient_quota" ? "Groq API error" ? "CRITICAL_AI_OUTAGE" ? "RESOURCE_EXHAUSTED" ? "429 Too Many Requests"' \
  --metric-transformations \
      metricName=GroqApiErrors,metricNamespace=CareerPrepster/Backend,metricValue=1,defaultValue=0 \
  --region ap-southeast-1
```

#### 2. CloudWatch Alarm for AI Outage
Triggers an immediate email if 2 or more AI failures occur in a 5-minute window:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "careerprepster-groq-ai-service-down-or-out-of-budget" \
  --metric-name GroqApiErrors \
  --namespace CareerPrepster/Backend \
  --statistic Sum \
  --period 300 \
  --threshold 2 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-description "URGENT: Groq AI inference service is failing, returning rate_limit_exceeded/out of budget, or experiencing an outage." \
  --alarm-actions "arn:aws:sns:ap-southeast-1:<ACCOUNT_ID>:careerprepster-critical-alerts" \
  --region ap-southeast-1
```

---

### 12.3 Suspicious User & Threat Detection Alerting

Detects abusive scrapers, credential brute-forcing, injection probing, or token-farming bots.

#### 1. Backend Security Anomaly Metric Filter
Matches backend log lines tagged with `[SECURITY_ALERT]` (emitted on rate-limit violations, excessive failed auths, or malicious inputs):
```bash
aws logs put-metric-filter \
  --log-group-name "/ecs/careerprepster-backend" \
  --filter-name "SuspiciousUserActivityFilter" \
  --filter-pattern '[timestamp, level, context, msg="*SECURITY_ALERT*", ...]' \
  --metric-transformations \
      metricName=SuspiciousUserEvents,metricNamespace=CareerPrepster/Security,metricValue=1,defaultValue=0 \
  --region ap-southeast-1
```

#### 2. CloudWatch Alarm for Suspicious User Activity
Triggers an email alert if 5 or more suspicious security events occur in 5 minutes:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "careerprepster-suspicious-user-activity-detected" \
  --metric-name SuspiciousUserEvents \
  --namespace CareerPrepster/Security \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-description "SECURITY: Spike in suspicious user actions (rate-limit abuse, repeated 401/403 brute force, or malicious payload probing)." \
  --alarm-actions "arn:aws:sns:ap-southeast-1:<ACCOUNT_ID>:careerprepster-critical-alerts" \
  --region ap-southeast-1
```

#### 3. (Optional Edge WAF) Rate-Based IP Blocking
If deploying AWS WAF at the ALB/CloudFront layer, deploy a rate-based rule to automatically block any IP exceeding 100 requests in 5 minutes and alarm on blocked requests:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "careerprepster-waf-blocked-requests-spike" \
  --metric-name BlockedRequests \
  --namespace AWS/WAFV2 \
  --dimensions Name=Rule,Value=RateLimitRule Name=WebACL,Value=careerprepster-waf \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-description "SECURITY: AWS WAF blocked more than 10 requests from abusive IPs." \
  --alarm-actions "arn:aws:sns:ap-southeast-1:<ACCOUNT_ID>:careerprepster-critical-alerts" \
  --region ap-southeast-1
```

---

### 12.4 Verification: Test Alert Notification Dispatch

Validate end-to-end delivery of the email alert pipeline:
```bash
aws sns publish \
  --topic-arn "arn:aws:sns:ap-southeast-1:<ACCOUNT_ID>:careerprepster-critical-alerts" \
  --subject "TEST: CareerPrepster Monitoring Alert" \
  --message "This is a verification test to confirm that email alerts are operating correctly for Groq AI outages and suspicious user detection." \
  --region ap-southeast-1
```
Check your inbox to verify receipt within 30 seconds.

---

## 13. Section 2: Cloudflare Self-Hosting Live Demo Walkthrough

Follow this script during the live in-class capstone presentation:

### Step 1: Install Cloudflare Tunnel Client
```bash
# Windows (PowerShell via Chocolatey or winget)
winget install --id Cloudflare.cloudflared
# or macOS:
# brew install cloudflared
```

### Step 2: Launch Local Web Application
Start your local CareerPrepster frontend or preview prototype on port 8000 (or 3000):
```bash
# Example quick test server on port 8000:
python -m http.server 8000
# Or using CareerPrepster Next.js / Express prototype:
# npm run dev
```

### Step 3: Publish via Cloudflare Quick Tunnel (No Domain, No Card)
```bash
cloudflared tunnel --url http://localhost:8000
```
- Cloudflared will connect to Cloudflare edge and output a public URL:
  `https://<random-name>.trycloudflare.com`

### Step 4: Live Phone Mobile Data Verification
1. Disconnect your mobile phone completely from Wi-Fi (use **Cellular Mobile Data**).
2. Open the `https://<random-name>.trycloudflare.com` URL in your mobile browser.
3. Submit an invented CV bullet point (e.g., *"Led a 3-person team to implement a responsive e-commerce platform using React and Node.js"*).
4. Display the resulting STAR/XYZ AI rewrite or ATS diagnostic score on the phone screen.

### Step 5: Prove No Public IP & No Open Inbound Port
While the demo is running, switch to a second terminal on the laptop and run:
```powershell
# Windows PowerShell:
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalAddress -eq '0.0.0.0' }
```
```bash
# Linux / macOS:
ss -tlnp
# or: netstat -an | grep LISTEN
```
- **Show Evaluator**: The laptop is listening only on `localhost:8000` (or `127.0.0.1`). There are **no public IP addresses** bound, and **no inbound firewall ports** open to the internet.

### Step 6: Terminate Tunnel & Prove Cutoff
1. Press `Ctrl + C` in the `cloudflared` terminal to terminate the tunnel.
2. Immediately refresh the browser page on the mobile phone.
3. Show the evaluator that the connection fails instantly with an HTTP 530 error or connection timeout.

### Step 7: Architecture Defense Explanation (Connection Direction)
Deliver this exact explanation during your defense:
> *"The Cloudflare Quick Tunnel establishes an **outbound-only TCP/QUIC connection** from our laptop to the nearest Cloudflare edge PoP over port 443. When the user requests the site on mobile data, Cloudflare proxies the request back through that pre-existing outbound tunnel. Our laptop never exposes a public IP address or listens on an open inbound internet port.*
>
> *This identically mirrors our **AWS Cloud Architecture**: our private ECS Fargate tasks and RDS database run in private subnets with **no public IPs and no open inbound internet ports**. Outbound traffic (such as calls to the Groq AI API or Google OAuth) is initiated through an outbound-only NAT Gateway, protecting internal services from unsolicited external scans and direct attacks."*

---

## 14. IaC Defense Protocol: Git History & Live One-Line Modification Drill

### 14.1 Git History Verification
Before defense, verify your commit history proves progressive development across all 3 levels:
```bash
git log --oneline -n 5
```
**Expected History**:
```text
a1b2c3d feat(infra): level 3 automated test runner and security scan pipeline
e4f5g6h feat(infra): level 2 full architecture with security rules S1-S4 tests
i7j8k9l feat(infra): level 1 network & firewall rules with automated tests
```

### 14.2 The 3 Spot-Checked Values (Match Check)
Check that these values match Deliverable 1B before the evaluator inspects:
1. **VPC CIDR**: `10.0.0.0/16` (`infra/terraform/vpc.tf`)
2. **Container Ports**: `5000` for backend, `3000` for frontend (`infra/terraform/ecs.tf`)
3. **RDS Configuration**: MySQL `8.0` on `db.t4g.micro`, `20` GB gp3 (`infra/terraform/rds.tf`)

### 14.3 Live Defense Drill: One-Line Live Change & Test Re-run
When the evaluator says: *"Change one line in your IaC live and re-run your tests"*, follow this script:

1. **Step 1: Run Baseline Test**:
   ```bash
   bash scripts/test-infra.sh
   # Expected output: ALL INFRASTRUCTURE TESTS PASSED!
   ```
2. **Step 2: Change One Line Live**:
   Open `infra/terraform/security_groups.tf` in VS Code / IDE. Go to `sg-rds` ingress:
   Change:
   ```hcl
   cidr_blocks = [] # Restricted to sg-ecs-backend
   ```
   To:
   ```hcl
   cidr_blocks = ["0.0.0.0/0"] # Malicious/misconfigured public opening
   ```
3. **Step 3: Re-run Test Command Live**:
   ```bash
   bash scripts/test-infra.sh
   ```
4. **Step 4: Show Evaluator Immediate Failure**:
   Output instantly flags:
   ```text
   FAIL: test_rds_no_public_ingress
   AssertionError: Security Group 'sg-rds' exposes port 3306 to public CIDR '0.0.0.0/0'! Rule S1 violated.
   ```
5. **Step 5: Revert and Re-run**:
   Undo the change (`Ctrl+Z` and save), re-run `bash scripts/test-infra.sh`, and show that all tests immediately return to green (**PASS**).




