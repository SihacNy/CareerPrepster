# Quickstart & AWS Console Navigation Guide: CareerPrepster Cloud Hosting

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Date**: 2026-10-07  

This document is your **visual, click-by-click navigation guide** for configuring the CareerPrepster cloud infrastructure inside the **AWS Management Console (website)** without requiring command-line tools.

---

## 🗺️ Master Navigation Roadmap

```text
[AWS Console Top Bar] ──► Select Region: "Asia Pacific (Singapore) ap-southeast-1"
       │
       ├─► 1. VPC Console ────────► Create VPC (10.0.0.0/16) + 6 Subnets + IGW + NAT + Routes
       ├─► 2. VPC Security Groups ─► Create 4 Firewalls (sg-alb, sg-frontend, sg-backend, sg-rds)
       ├─► 3. KMS Console ────────► Create Customer Managed Key (alias/careerprepster-cmk)
       ├─► 4. Secrets Manager ────► Store Application Secrets (careerprepster/production)
       ├─► 5. S3 Console ─────────► Create Private Media Bucket + Block Public Access + KMS
       ├─► 6. RDS Console ────────► Create DB Subnet Group + MySQL 8.0 Database (db.t4g.micro)
       ├─► 7. ECR Console ────────► Create Private Repositories (backend & frontend)
       ├─► 8. EC2 / ALB Console ──► Create Target Groups (Ports 5000 & 3000) + Internet ALB
       ├─► 9. CloudFront Console ─► Create Edge Distribution (*.cloudfront.net Default SSL)
       ├─► 10. ECS Console ───────► Create Fargate Cluster + Tasks + Auto-Scaling Services
       ├─► 11. CloudWatch & SNS ──► Create SNS Alert Topic + AI Failure & Budget Alarms
       └─► 12. Laptop Demo ───────► Run Cloudflare Quick Tunnel for Live Class Presentation
```

---

## Step 0: Set Region to Singapore (`ap-southeast-1`)

1. Log into your [AWS Management Console](https://console.aws.amazon.com/).
2. Look at the **top-right navigation bar** (next to your username/account ID).
3. Click the region dropdown and select **Asia Pacific (Singapore) `ap-southeast-1`**.
*(All resources below must be created in this region).*

---

## Step 1: VPC & Subnet Networking (VPC First!)

### 1.1 Create the VPC
1. In the top search bar, type **VPC** and press Enter.
2. In the left sidebar, click **Your VPCs**, then click the orange **Create VPC** button.
3. Configure the following:
   - **Resources to create**: Select **VPC only**.
   - **Name tag**: `careerprepster-vpc`
   - **IPv4 CIDR block**: Select **IPv4 CIDR manual input**.
   - **IPv4 CIDR**: Enter `10.0.0.0/16`
   - **IPv6 CIDR block**: Select **No IPv6 CIDR block**.
   - **Tenancy**: Select **Default**.
4. Click **Create VPC**.
5. Once created, select `careerprepster-vpc` $\to$ Click **Actions** (top-right) $\to$ **Edit VPC settings**.
6. Under **DNS settings**:
   - Check **Enable DNS resolution**
   - Check **Enable DNS hostnames**
7. Click **Save changes**.

---

### 1.2 Create the 6 Subnets (Across 2 Availability Zones)

In the left sidebar, click **Subnets**, then click **Create subnet**. Select **VPC ID**: `careerprepster-vpc`.

Create each of the 6 subnets by clicking **Add new subnet** at the bottom:

| # | Subnet Name | Availability Zone | IPv4 CIDR block | Purpose |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `public-subnet-1a` | `ap-southeast-1a` | `10.0.1.0/24` | Public ALB Node A + NAT Gateway |
| **2** | `public-subnet-1b` | `ap-southeast-1b` | `10.0.2.0/24` | Public ALB Node B |
| **3** | `private-web-subnet-1a` | `ap-southeast-1a` | `10.0.10.0/24` | Private Containers (AZ-a) |
| **4** | `private-web-subnet-1b` | `ap-southeast-1b` | `10.0.11.0/24` | Private Containers (AZ-b) |
| **5** | `private-db-subnet-1a` | `ap-southeast-1a` | `10.0.20.0/24` | MySQL Primary Database (AZ-a) |
| **6** | `private-db-subnet-1b` | `ap-southeast-1b` | `10.0.21.0/24` | MySQL Standby/Replica (AZ-b) |

Click **Create subnet**.

---

### 1.3 Create and Attach the Internet Gateway (IGW)
1. In the VPC left sidebar, click **Internet gateways** $\to$ **Create internet gateway**.
2. **Name tag**: `careerprepster-igw` $\to$ Click **Create internet gateway**.
3. On the next screen, click **Actions** (top-right) $\to$ **Attach to VPC**.
4. Select `careerprepster-vpc` $\to$ Click **Attach internet gateway**.

---

### 1.4 Create the NAT Gateway (1-Way Outbound to Groq AI)
1. In the VPC left sidebar, click **NAT gateways** $\to$ **Create NAT gateway**.
2. Configure:
   - **Name**: `careerprepster-nat-1a`
   - **Subnet**: Select `public-subnet-1a` *(Must be in a public subnet!)*
   - **Connectivity type**: **Public**
   - **Elastic IP allocation ID**: Click the **Allocate Elastic IP** button.
3. Click **Create NAT gateway**.
*(Wait ~1-2 minutes until status becomes "Available").*

---

### 1.5 Configure Route Tables & Subnet Associations
In the VPC left sidebar, click **Route tables**:

#### A. Public Route Table (`rt-public`):
1. Click **Create route table** $\to$ Name: `rt-public` $\to$ VPC: `careerprepster-vpc` $\to$ **Create route table**.
2. Click the **Routes** tab $\to$ **Edit routes** $\to$ Click **Add route**:
   - **Destination**: `0.0.0.0/0`
   - **Target**: Select **Internet Gateway** $\to$ choose `careerprepster-igw`.
   - Click **Save changes**.
3. Click the **Subnet associations** tab $\to$ **Edit subnet associations**:
   - Check `public-subnet-1a` and `public-subnet-1b`.
   - Click **Save associations**.

#### B. Private Route Table (`rt-private`):
1. Click **Create route table** $\to$ Name: `rt-private` $\to$ VPC: `careerprepster-vpc` $\to$ **Create route table**.
2. Click the **Routes** tab $\to$ **Edit routes** $\to$ Click **Add route**:
   - **Destination**: `0.0.0.0/0`
   - **Target**: Select **NAT Gateway** $\to$ choose `careerprepster-nat-1a`.
   - Click **Save changes**.
3. Click the **Subnet associations** tab $\to$ **Edit subnet associations**:
   - Check `private-web-subnet-1a` and `private-web-subnet-1b`.
   - Click **Save associations**.

#### C. Main Route Table for Isolated Database (`rt-database-isolated`):
> **Why do we need this? (3-Tier Architecture)**  
> AWS automatically created a **Main Route Table** when you created `careerprepster-vpc`.  
> While Web Containers (`rt-private`) need an outbound route to the internet via the NAT Gateway (to call Groq AI / APIs), the **Database must have ZERO route to the internet** (neither inbound nor outbound). Keeping the database completely air-gapped prevents data exfiltration and saves NAT Gateway data charges.

1. In the Route Tables list, find the existing route table where the **Main** column says **Yes** (associated with `careerprepster-vpc`).
2. Hover over the **Name** column for that table, click the **pencil icon**, and set the name to:  
   `rt-database-isolated` $\to$ Click **Save**.
3. Select `rt-database-isolated` $\to$ Click the **Routes** tab:
   - Verify it only contains: `10.0.0.0/16` $\to$ `local`.
   - **CRITICAL**: Do **NOT** add any route to `0.0.0.0/0`, Internet Gateway, or NAT Gateway!
4. Click the **Subnet associations** tab $\to$ **Edit subnet associations**:
   - Check `private-db-subnet-1a` and `private-db-subnet-1b`.
   - Click **Save associations**.  
   *(Now all 6 subnets are cleanly and explicitly mapped to their respective route tables).*

### 1.6 🔍 Test & Verify: VPC Resource Map & Subnet Isolation
1. In the VPC Console, click **Your VPCs** $\to$ Click `careerprepster-vpc`.
2. Scroll down and click the **Resource map** tab.
3. **Visual Verification Checklist**:
   - [ ] Confirm **6 subnets** are listed across `ap-southeast-1a` and `ap-southeast-1b`.
   - [ ] Confirm `public-subnet-1a` and `1b` connect to `rt-public`, which has a green connection line to `careerprepster-igw`.
   - [ ] Confirm `private-web-subnet-1a` and `1b` connect to `rt-private`, which connects to `careerprepster-nat-1a`.
   - [ ] Confirm `private-db-subnet-1a` and `1b` connect to `rt-database-isolated`, showing **no internet route** (traffic stays purely local `10.0.0.0/16`).
4. **Pass Criteria**: Visual map matches the 3-tier architecture with zero public gateway exposure for DB subnets.

---

## Step 2: Virtual Firewalls (Security Groups)

In the VPC left sidebar, click **Security groups** $\to$ **Create security group**. Create each of the following 4 groups inside `careerprepster-vpc`:

### 2.1 Load Balancer Firewall (`sg-careerprepster-alb`)
- **Security group name**: `sg-careerprepster-alb`
- **Description**: `Public perimeter firewall for Application Load Balancer`
- **VPC**: `careerprepster-vpc`
- **Inbound rules** (Click **Add rule** twice):
  1. **Type**: `HTTP` | **Port**: `80` | **Source**: `Anywhere-IPv4` (`0.0.0.0/0`)
  2. **Type**: `HTTPS` | **Port**: `443` | **Source**: `Anywhere-IPv4` (`0.0.0.0/0`)
- Click **Create security group**.

---

### 2.2 Frontend Container Firewall (`sg-careerprepster-frontend`)
- **Security group name**: `sg-careerprepster-frontend`
- **Description**: `Inbound port 3000 restricted to ALB only`
- **VPC**: `careerprepster-vpc`
- **Inbound rules**:
  - **Type**: `Custom TCP` | **Port**: `3000` | **Source**: Select `Custom` $\to$ search and choose `sg-careerprepster-alb`.
- Click **Create security group**.

---

### 2.3 Backend Container Firewall (`sg-careerprepster-backend`)
- **Security group name**: `sg-careerprepster-backend`
- **Description**: `Inbound port 5000 restricted to ALB only`
- **VPC**: `careerprepster-vpc`
- **Inbound rules**:
  - **Type**: `Custom TCP` | **Port**: `5000` | **Source**: Select `Custom` $\to$ search and choose `sg-careerprepster-alb`.
- Click **Create security group**.

---

### 2.4 Database Firewall (`sg-careerprepster-rds`)
- **Security group name**: `sg-careerprepster-rds`
- **Description**: `MySQL port 3306 restricted strictly to backend containers`
- **VPC**: `careerprepster-vpc`
- **Inbound rules**:
  - **Type**: `MySQL/Aurora` | **Port**: `3306` | **Source**: Select `Custom` $\to$ search and choose `sg-careerprepster-backend`.
- Click **Create security group**.

### 2.5 🔍 Test & Verify: Security Group Least-Privilege Isolation Chain
1. In the VPC Console, click **Security groups**.
2. Select `sg-careerprepster-rds` $\to$ Inspect **Inbound rules**:
   - [ ] Exactly 1 rule exists: Port `3306` with Source set to `sg-careerprepster-backend`.
   - [ ] **Pass/Fail**: MUST NOT contain `0.0.0.0/0` or `sg-careerprepster-alb`.
3. Select `sg-careerprepster-backend` $\to$ Inspect **Inbound rules**:
   - [ ] Exactly 1 rule exists: Port `5000` with Source set strictly to `sg-careerprepster-alb`.
4. Select `sg-careerprepster-frontend` $\to$ Inspect **Inbound rules**:
   - [ ] Exactly 1 rule exists: Port `3000` with Source set strictly to `sg-careerprepster-alb`.
5. Select `sg-careerprepster-alb` $\to$ Inspect **Inbound rules**:
   - [ ] Ports `80` and `443` open to `0.0.0.0/0` (public web entrypoint).

---

## Step 3: Encryption Keys (AWS KMS Console)

*Satisfies Security Rule S2: Customer-controlled encryption at rest.*

1. In the top search bar, type **KMS** $\to$ Click **Key Management Service**.
2. In the left sidebar, click **Customer managed keys** $\to$ Click **Create key**.
3. **Step 1: Configure key**:
   - Key type: **Symmetric**
   - Key usage: **Encrypt and decrypt**
   - Click **Next**.
4. **Step 2: Add labels**:
   - **Alias**: `careerprepster-cmk`
   - **Description**: `CareerPrepster Customer Managed Key for RDS and S3`
   - Click **Next**.
5. **Step 3 & 4: Key administrators & permissions**:
   - Select your IAM user as Key Administrator $\to$ Click **Next** $\to$ Click **Finish**.

### 3.1 🔍 Test & Verify: KMS Key Status & Permissions
1. In the KMS Console, click **Customer managed keys** $\to$ Select `careerprepster-cmk`.
2. **General configuration checklist**:
   - [ ] **Status**: Must show **Enabled**.
   - [ ] **Key type**: Must show **Symmetric**.
   - [ ] **Key usage**: Must show **Encrypt and decrypt**.
3. **Key policy tab**:
   - [ ] Verify your administrative IAM user is listed with root key management rights.

---

## Step 4: Secrets Management (AWS Secrets Manager)

*Satisfies Security Rule S3: Managed secret storage with zero plaintext.*

1. In the top search bar, type **Secrets Manager** and press Enter.
2. Click **Store a new secret**.
3. **Secret type**: Select **Other type of secret**.
4. Under **Key/value pairs**, add the following rows:
   - `DATABASE_URL`: `mysql://careerprepster_admin:<PASS>@<RDS_ENDPOINT>:3306/careerprepster`
   - `JWT_SECRET`: Enter a 64-character random string
   - `GROQ_API_KEY`: Enter your Groq API key (`gsk_...`)
   - `GROQ_MODEL`: `openai/gpt-oss-120b` (or `llama-3.3-70b-versatile`)
   - `GEMINI_API_KEY`: *(Optional fallback Gemini key)*
   - `GOOGLE_CLIENT_ID`: Enter your Google Client ID
   - `CLIENT_URL`: `https://<distribution-id>.cloudfront.net`
5. **Encryption key**: Select your customer managed key: `careerprepster-cmk`.
6. Click **Next**.
7. **Secret name**: Enter `careerprepster/production`.
8. Click **Next** $\to$ **Next** (keep defaults) $\to$ Click **Store**.

### 4.1 🔍 Test & Verify: Secret Encryption & Masked Retrieval
1. In the Secrets Manager Console, click `careerprepster/production`.
2. **Verification Checklist**:
   - [ ] **Encryption key**: Must show `alias/careerprepster-cmk` (proving S2/S3 CMK compliance).
   - [ ] **Secret value**: Must be hidden behind **Retrieve secret value** button by default.
3. Click **Retrieve secret value**:
   - [ ] Verify all 7 keys are present with proper values.
   - [ ] Verify no secrets are checked into Git or stored as plain environment variables.

---

## Step 5: Object Storage (Amazon S3)

*Stores exported student CVs under tenant paths `exports/{student_id}/`.*

1. In the top search bar, type **S3** and press Enter.
2. Click **Create bucket**.
3. **General configuration**:
   - **Bucket name**: `careerprepster-media-<your-aws-account-id>`
   - **AWS Region**: `ap-southeast-1`
4. **Block Public Access settings for this bucket**:
   - Ensure **Block all public access** is **CHECKED** (all 4 boxes checked).
5. **Default encryption**:
   - Encryption type: **Server-side encryption with AWS Key Management Service keys (SSE-KMS)**.
   - AWS KMS key: Choose **Choose from your AWS KMS keys** $\to$ Select `careerprepster-cmk`.
6. Click **Create bucket**.

### 5.1 🔍 Test & Verify: S3 Public Access Denial & KMS Encryption
1. In the S3 Console, click `careerprepster-media-<your-aws-account-id>`.
2. Under **Permissions**, verify:
   - [ ] **Block public access (bucket settings)**: Shows **On** (all 4 boxes enabled).
3. Under **Properties** $\to$ **Default encryption**:
   - [ ] Encryption type: `SSE-KMS`.
   - [ ] KMS key: `alias/careerprepster-cmk`.
4. **Live Forbidden Access Test**:
   - Click **Upload** $\to$ upload a dummy file (e.g. `test-export.txt`).
   - Click the uploaded file $\to$ copy the **Object URL**.
   - Open an incognito browser window and paste the URL.
   - [ ] **Pass/Fail Criteria**: Browser MUST return **`HTTP 403 Access Denied`**. Proves student resumes cannot be read by public internet.

---

## Step 6: Database (Amazon RDS MySQL)

### 6.1 Create DB Subnet Group
1. In the top search bar, type **RDS** and press Enter.
2. In the left sidebar, click **Subnet groups** $\to$ Click **Create DB subnet group**.
3. Configure:
   - **Name**: `careerprepster-db-subnets`
   - **Description**: `Private DB subnets across 2 AZs`
   - **VPC**: `careerprepster-vpc`
   - **Availability Zones**: Select `ap-southeast-1a` and `ap-southeast-1b`.
   - **Subnets**: Select `private-db-subnet-1a` (`10.0.20.0/24`) and `private-db-subnet-1b` (`10.0.21.0/24`).
4. Click **Create**.

### 6.2 Create the MySQL Database
1. In the left sidebar, click **Databases** $\to$ Click **Create database**.
2. **Choose a database creation method**: **Standard create**.
3. **Engine options**: **MySQL** (Version: `MySQL 8.0.35` or latest 8.0).
4. **Templates**: Select **Free tier** (or Dev/Test).
5. **Settings**:
   - **DB instance identifier**: `careerprepster-db`
   - **Master username**: `careerprepster_admin`
   - **Master password**: Enter a strong password (save this in Secrets Manager!).
6. **Instance configuration**:
   - **DB instance class**: **Burstable classes** $\to$ `db.t4g.micro` (or `db.t3.micro`).
7. **Storage**:
   - Storage type: `gp3` | Allocated storage: `20` GB.
8. **Connectivity**:
   - **Virtual private cloud (VPC)**: Select `careerprepster-vpc`.
   - **DB subnet group**: Select `careerprepster-db-subnets`.
   - **Public access**: Select **No** *(Completely private!)*.
   - **Existing VPC security groups**: Remove default $\to$ Select `sg-careerprepster-rds`.
9. **Database authentication**: Password authentication.
10. **Additional configuration**:
    - **Initial database name**: `careerprepster`
    - **Encryption**: Check **Enable encryption** $\to$ Select `careerprepster-cmk`.
11. Click **Create database**.
*(Takes ~5–10 minutes to finish creating. Once done, copy the Endpoint hostname).*

### 6.3 🔍 Test & Verify: RDS Private Isolation & Subnet Attachment
1. In the RDS Console, click **Databases** $\to$ Click `careerprepster-db`.
2. Wait until **Status** changes from `Creating` to `Available`.
3. Under **Connectivity & security**:
   - [ ] **Publicly accessible**: Must show **No**.
   - [ ] **Security groups**: Must show `sg-careerprepster-rds` (active).
   - [ ] **Subnets**: Confirm attachment to `private-db-subnet-1a` and `1b`.
4. Under **Configuration**:
   - [ ] **Encryption**: Must show **Enabled** with `careerprepster-cmk`.

---

## Step 7: Load Balancer & Target Groups (EC2 Console)

### 7.1 Create the 2 Target Groups
1. In the top search bar, type **EC2** $\to$ In the left sidebar, scroll down to **Target Groups** $\to$ Click **Create target group**.

#### Target Group 1: Backend (`tg-careerprepster-backend`):
- **Target type**: Select **IP addresses** *(Required for Fargate!)*
- **Target group name**: `tg-careerprepster-backend`
- **Protocol**: `HTTP` | **Port**: `5000` | **VPC**: `careerprepster-vpc`
- **Health check path**: `/api/health`
- Click **Next** $\to$ Click **Create target group** (skip registering targets for now).

#### Target Group 2: Frontend (`tg-careerprepster-frontend`):
- Click **Create target group**.
- **Target type**: **IP addresses**
- **Target group name**: `tg-careerprepster-frontend`
- **Protocol**: `HTTP` | **Port**: `3000` | **VPC**: `careerprepster-vpc`
- **Health check path**: `/`
- Click **Next** $\to$ Click **Create target group**.

---

### 7.2 Create the Application Load Balancer
1. In the left sidebar, click **Load Balancers** $\to$ Click **Create load balancer**.
2. Under **Application Load Balancer**, click **Create**.
3. **Basic configuration**:
   - **Load balancer name**: `careerprepster-alb`
   - **Scheme**: **Internet-facing**
   - **IP address type**: **IPv4**
4. **Network mapping**:
   - **VPC**: Select `careerprepster-vpc`.
   - **Mappings**:
     - Check `ap-southeast-1a` $\to$ select `public-subnet-1a`.
     - Check `ap-southeast-1b` $\to$ select `public-subnet-1b`.
5. **Security groups**:
   - Remove default $\to$ Select `sg-careerprepster-alb`.
6. **Listeners and routing**:
   - Listener: **Protocol**: `HTTP` | **Port**: `80`
   - **Default action**: Forward to `tg-careerprepster-frontend`.
7. Click **Create load balancer**.

### 7.3 Add the Path-Based Rule for `/api/*`
1. Select `careerprepster-alb` $\to$ Click the **Listeners** tab $\to$ Click the **HTTP:80** listener link.
2. Click the **Rules** tab $\to$ Click **Manage rules** (or **Add rule**).
3. Click the **+** icon (Insert rule):
   - **Rule condition**: Click **Add condition** $\to$ select **Path** $\to$ enter `/api/*`.
   - **Rule action**: Click **Add action** $\to$ select **Forward to** $\to$ choose `tg-careerprepster-backend`.
4. Click **Save**.
*(Now `/api/*` automatically routes to Express Backend, and everything else routes to Next.js Frontend).*

### 7.4 🔍 Test & Verify: ALB DNS Ingress & Routing Priority
1. In the EC2 Console, click **Load Balancers** $\to$ Select `careerprepster-alb`.
2. Copy the **DNS name** (e.g. `careerprepster-alb-12345.ap-southeast-1.elb.amazonaws.com`).
3. Under the **Listeners and rules** tab:
   - [ ] Rule 1: `/api/*` forwards to `tg-careerprepster-backend`.
   - [ ] Default Rule: `*` forwards to `tg-careerprepster-frontend`.
4. In terminal or browser, test direct ingress:
   ```bash
   curl -I http://<ALB_DNS_NAME>/
   # Expected: HTTP 503 (Target groups have no registered tasks yet) or 200 (once tasks are running).
   ```

---

## Step 8: CloudFront Global CDN (Edge Default Domain)

1. In the top search bar, type **CloudFront** and press Enter.
2. Click **Create distribution**.
3. **Origin**:
   - **Origin domain**: Click the box and select your ALB (`careerprepster-alb-xxxx.elb.amazonaws.com`).
   - **Protocol**: Select **HTTP only**.
4. **Default cache behavior**:
   - **Viewer protocol policy**: Select **Redirect HTTP to HTTPS**.
   - **Allowed HTTP methods**: Select `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`.
   - **Cache policy**: Select **UseOriginCacheControlHeaders** *(AWS recommended for ALB - lets Next.js/Express control caching so API/auth responses aren't cached).*
5. **Settings**:
   - **Price class**: Select **Use all edge locations (best performance)**.
   - **Custom SSL certificate**: Keep default (uses built-in `*.cloudfront.net` certificate).
6. Click **Create distribution**.
7. Once created, copy the **Distribution domain name**:  
   👉 `https://d123456abcdef8.cloudfront.net`  
   *(This is the public URL you share with students!).*

### 8.1 🔍 Test & Verify: CloudFront HTTPS Redirection & Edge CDN
1. In the CloudFront Console, verify distribution **Status** is **Enabled** (wait ~3-5 mins for deployment).
2. **HTTP $\to$ HTTPS Redirection Test**:
   ```bash
   curl -I http://<distribution-id>.cloudfront.net/
   # Expected: HTTP/1.1 301 Moved Permanently (Location: https://<distribution-id>.cloudfront.net/)
   ```
3. **Edge Header Test**:
   ```bash
   curl -I https://<distribution-id>.cloudfront.net/
   # Expected: Response contains CloudFront diagnostic headers ('x-amz-cf-pop', 'x-amz-cf-id').
   ```

---

## Step 9: Serverless Containers (Amazon ECS on Fargate)

1. In the top search bar, type **ECS** $\to$ Click **Elastic Container Service**.
2. In the left sidebar, click **Clusters** $\to$ Click **Create cluster**.
   - **Cluster name**: `careerprepster-cluster`
   - **Infrastructure**: Select **AWS Fargate (serverless)**.
   - Click **Create**.
3. **Task Definitions**:
   - Create task definitions pointing to your backend ECR image (Port 5000) and frontend image (Port 3000).
   - In the task definition environment section, map secrets directly from Secrets Manager ARN: `careerprepster/production`.
4. **Deploy Services**:
   - Under `careerprepster-cluster`, create **Backend Service**:
     - Launch type: **Fargate**
     - Subnets: Select `private-web-subnet-1a` and `private-web-subnet-1b` *(Private!)*
     - Security group: `sg-careerprepster-backend`
     - Load balancer: Select `careerprepster-alb` $\to$ Target group: `tg-careerprepster-backend`.
   - Create **Frontend Service**:
     - Subnets: Select `private-web-subnet-1a` and `private-web-subnet-1b`.
     - Security group: `sg-careerprepster-frontend`.
     - Load balancer: Select `careerprepster-alb` $\to$ Target group: `tg-careerprepster-frontend`.

### 9.1 🔍 Test & Verify: ECS Container Health & Target Group Registration
1. In the ECS Console $\to$ Clusters $\to$ Click `careerprepster-cluster`:
   - [ ] Under the **Services** tab, verify **Running count = Desired count** (e.g. 2/2 tasks running).
   - [ ] Click on the backend task $\to$ Click **Logs** tab $\to$ Verify Express server started on Port 5000 with database connection healthy.
2. In the EC2 Console $\to$ **Target Groups**:
   - [ ] Select `tg-careerprepster-backend` $\to$ Click **Targets** tab $\to$ Status must show **Healthy** on port 5000 (`/api/health`).
   - [ ] Select `tg-careerprepster-frontend` $\to$ Click **Targets** tab $\to$ Status must show **Healthy** on port 3000 (`/`).

---

## Step 10: Monitoring & Mandatory Client Alerts (CloudWatch & SNS)

### 10.1 Create SNS Email Topic
1. In the top search bar, type **SNS** $\to$ Click **Topics** $\to$ **Create topic**.
2. Type: **Standard** | Name: `careerprepster-critical-alerts` $\to$ Click **Create topic**.
3. Click **Create subscription**:
   - **Protocol**: **Email**
   - **Endpoint**: Enter your email address (e.g., `alerts@yourdomain.com`).
   - Click **Create subscription**.
4. Check your inbox and click **Confirm subscription**.

### 10.2 Create Alert 1: AI Failing (Requirement R5)
1. Search **CloudWatch** $\to$ Click **Alarms** $\to$ **All alarms** $\to$ **Create alarm**.
2. Click **Select metric** $\to$ Custom namespace / logs filter: `GroqApiErrors` $\to$ Select metric.
3. **Conditions**:
   - Threshold type: **Static**
   - Whenever metric is: **Greater than or equal to threshold**
   - Than: `2`
   - Evaluation period: `5 minutes`
4. **Actions**:
   - Send notification to: `careerprepster-critical-alerts`.
5. **Name**: `careerprepster-alert-ai-failing` $\to$ Click **Create alarm**.

### 10.3 Create Alert 2: Cost Over Budget ($10/day or $100/mo)
1. In the top search bar, type **AWS Budgets** $\to$ Click **Create budget**.
2. Choose **Cost budget (recommended)** $\to$ Click **Next**.
3. **Budget amount**: Enter `$100.00` (Monthly).
4. **Set alert thresholds**:
   - Alert 1: 50% of budgeted amount $\to$ enter your email.
   - Alert 2: 80% of budgeted amount $\to$ enter your email.
   - Alert 3: 100% of budgeted amount $\to$ enter your email.
5. Click **Create budget**.

### 10.4 🔍 Test & Verify: Live SNS Email Alert Dispatch
1. In the SNS Console $\to$ Topics $\to$ Click `careerprepster-critical-alerts`.
2. Click the **Publish message** button (top right):
   - **Subject**: `[ALERT TEST] CareerPrepster Monitoring Verification`
   - **Message body**: `Verifying real-time SNS email notification dispatch for AI failure and budget alarms.`
   - Click **Publish message**.
3. **Pass/Fail Criteria**:
   - [ ] Check your personal email inbox. The email MUST arrive within **30 seconds**.
   - [ ] Proves Requirement R5 (proactive monitoring and notification) is mathematically operational before testing under load.

---

## Step 11: Section 2 — Live Laptop Demo (Cloudflare Quick Tunnel)

Execute this script live in class from your laptop:

1. **Start the app locally**:
   ```bash
   npm run dev
   ```
2. **Launch Cloudflare Quick Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
   *Terminal outputs:* `https://<random-subdomain>.trycloudflare.com`
3. **Live Phone Demonstration**:
   - Disconnect your mobile phone from Wi-Fi (use **Cellular Mobile Data**).
   - Open the `trycloudflare.com` link on your phone.
   - Submit an invented resume bullet point and display the AI rewrite or ATS score live on screen!
4. **Show Closed Inbound Ports**:
   - In PowerShell, run:
     ```powershell
     Get-NetTCPConnection -State Listen | Where-Object { $_.LocalAddress -eq '0.0.0.0' }
     ```
   - Prove to the professor that your laptop has **no open public ports**.
5. **Press `Ctrl + C`** in terminal $\to$ Refresh phone $\to$ Prove the tunnel is immediately severed!
6. **Deliver Defense Explanation**:
   > *"The tunnel initiates an **outbound-only TCP connection** over port 443 to Cloudflare. This identically mirrors our AWS architecture, where our private ECS Fargate tasks and RDS database run in private subnets with **no public IPs**, using our NAT Gateway for outbound traffic only."*

---

## Step 12: Comprehensive Cloud Verification & Testing Suite ✅

After configuring resources in the AWS Console, execute these verification tests to mathematically prove each tier works and meets the Capstone security criteria:

### Test 1: VPC & Network Routing Verification
1. Open **VPC Console** $\to$ Click **Resource map** tab on `careerprepster-vpc`.
2. **Visual Verification**:
   - Check that `careerprepster-vpc` splits cleanly into **6 subnets**.
   - Check that `public-subnet-1a` and `1b` point to `rt-public`, which has a green line connecting to `careerprepster-igw`.
   - Check that `private-web-subnet-1a` and `1b` point to `rt-private`, which connects to `careerprepster-nat-1a`.
   - Check that `private-db-subnet-1a` and `1b` show **no route** to any internet or NAT gateway (local `10.0.0.0/16` only).

---

### Test 2: Security Group Firewall Isolation Verification (Security Rule S1)
1. Open **VPC Console** $\to$ **Security groups** $\to$ Select `sg-careerprepster-rds`.
2. Inspect **Inbound rules**:
   - **Pass Criteria**: Exactly 1 rule exists:
     - Type: `MySQL/Aurora` (Port `3306`)
     - Source: ID of `sg-careerprepster-backend`
   - **Fail Criteria**: Any rule with Source `0.0.0.0/0` or `sg-careerprepster-alb`.
3. Select `sg-careerprepster-backend`:
   - **Pass Criteria**: Port `5000` source is strictly `sg-careerprepster-alb`.
4. Select `sg-careerprepster-frontend`:
   - **Pass Criteria**: Port `3000` source is strictly `sg-careerprepster-alb`.

---

### Test 3: S3 Public Access Block & KMS Encryption Test (Security Rule S2)
1. Open **S3 Console** $\to$ Click `careerprepster-media-<account-id>`.
2. Click **Permissions** tab:
   - Verify **Block public access (bucket settings)** shows **On** (all 4 settings are active).
3. Click **Properties** tab:
   - Under **Default encryption**, verify:
     - Encryption type: `AWS Key Management Service key (SSE-KMS)`
     - AWS KMS key: ARN of `alias/careerprepster-cmk`.
4. **Live URL Access Test**:
   - Upload any sample text file (e.g., `test.txt`).
   - Copy the **Object URL** (`https://careerprepster-media-xxxx.s3.amazonaws.com/test.txt`).
   - Paste it into an incognito browser window.
   - **Expected Result**: **`HTTP 403 Access Denied` (Proves student exports cannot be read publicly!)**.

---

### Test 4: Secrets Manager Zero-Plaintext Test (Security Rule S3)
1. Open **Secrets Manager Console** $\to$ Click `careerprepster/production`.
2. Verify:
   - Secret ARN exists and has KMS encryption key `careerprepster-cmk`.
   - Secret contains all required keys: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, `CLIENT_URL`.
   - Values are masked by default behind **Retrieve secret value** button.

---

### Test 5: ALB & CloudFront Live Endpoint Health Test
Run these tests from your laptop terminal or browser:

```bash
# 1. Test Backend Health Check through CloudFront
curl -I https://<distribution-id>.cloudfront.net/api/health
# Expected Output: HTTP/2 200 OK with response header 'content-type: application/json'

# 2. Test Frontend Loading through CloudFront
curl -I https://<distribution-id>.cloudfront.net/
# Expected Output: HTTP/2 200 OK

# 3. Test Direct ALB Ingress
curl -I http://<ALB_DNS_NAME>/api/health
# Expected Output: HTTP/1.1 200 OK
```

---

### Test 6: Proactive SNS Alert Notification Dispatch Test (Requirement R5)
Verify that your email alert pipeline is wired and actively firing:

1. Open **Amazon SNS Console** $\to$ Click **Topics** $\to$ Select `careerprepster-critical-alerts`.
2. Click the **Publish message** button (top right).
3. **Subject**: `[ALERT TEST] CareerPrepster Monitoring Verification`
4. **Message body**:
   ```text
   This is a verification test confirming that the on-call team receives immediate notifications when AI calls fail or daily budget is exceeded.
   ```
5. Click **Publish message**.
6. **Pass Criteria**: Check your personal email inbox. The email must arrive within **30 seconds** with the formatted alert payload.

---

### Test 7: End-to-End Application Smoke Journey
1. Open `https://<distribution-id>.cloudfront.net` in your browser.
2. Sign in with Google OAuth.
3. Create a new CV from template `modern-1`.
4. Add a bullet point and click **AI Suggest (STAR/XYZ)**:
   - Verify backend calls Groq AI via NAT Gateway and displays suggestions in $<2$ seconds.
5. Click **Run ATS Diagnostic Scan**:
   - Verify ATS score (0-100) and actionable fix cards appear.
6. Click **Export CV (PDF)**:
   - Verify backend generates a pre-signed S3 download URL and downloads the PDF directly.

---

## Step 13: Stress Testing & Peak Load Simulation Runbook (Scenario 8) ⚡

*Satisfies Capstone Scenario 8 Load Profile: **~3,000 students per week** with a peak evening rush of **300 concurrent students** (19:00 – 23:00).*

### 13.1 Load Test Scenario Specification

```text
       ┌────────────────────────────────────────────────────────┐
       │     Capstone Load Model: 300 Concurrent Users Peak     │
       ├────────────────────────────────────────────────────────┤
       │ 70% Traffic (210 Users) ──► Static Bundles & Landing (/)│
       │ 20% Traffic ( 60 Users) ──► Authenticated API (/api/cvs)│
       │ 10% Traffic ( 30 Users) ──► Heavy AI Rewrites (/api/ai) │
       └────────────────────────────────────────────────────────┘
```

- **Target URL**: `https://<distribution-id>.cloudfront.net`
- **Tooling**: `k6` (recommended) or lightweight `npx autocannon` / Python `locust`.

---

### 13.2 Stage 1 — Baseline Warm-Up Test (50 VUs)
Run a 2-minute baseline test simulating normal daytime traffic (~500 users/day):

```bash
# Using npx autocannon (runs directly from terminal without install):
npx -y autocannon -c 50 -d 120 -p 10 "https://<distribution-id>.cloudfront.net/api/health"
```

- **Pass Criteria**:
  - $p95$ response latency $< 200\text{ms}$.
  - HTTP 200 rate $= 100\%$.
  - Zero dropped connections.

---

### 13.3 Stage 2 — Peak Rush Stress Test (300 Concurrent VUs)
Run a 10-minute stress test simulating 300 concurrent students during evening peak internship season:

#### Option A: Using `k6` (Recommended)
Save the following as `stress-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp to 100 users
    { duration: '3m', target: 300 },  // Ramp to 300 concurrent users
    { duration: '5m', target: 300 },  // Hold 300 users for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests under 1.5s
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

const BASE_URL = 'https://<distribution-id>.cloudfront.net';

export default function () {
  // 1. 70% Browse Home / Static Assets (CloudFront Edge)
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, { 'status is 200': (r) => r.status === 200 });

  // 2. 20% Backend Health & API Query
  const resApi = http.get(`${BASE_URL}/api/health`);
  check(resApi, { 'api status is 200': (r) => r.status === 200 });

  sleep(1);
}
```

Run test:
```bash
k6 run stress-test.js
```

#### Option B: Using `autocannon` (No Prerequisites)
```bash
npx -y autocannon -c 300 -d 300 -p 10 "https://<distribution-id>.cloudfront.net/api/health"
```

---

### 13.4 ECS Auto-Scaling Metric Verification
While the 300-user stress test is running:

1. Open **Amazon ECS Console** $\to$ Click `careerprepster-cluster`.
2. Select **Backend Service** $\to$ Click the **Service details** tab.
3. Observe **Running count**:
   - **Baseline**: Starts at `2` tasks.
   - **Scale Out**: As CPU utilization exceeds `70%`, CloudWatch alarm `TargetTracking-AlarmHigh` triggers.
   - **Pass Criteria**: Running task count increases dynamically to **4 or 6 tasks** within 3–5 minutes.
4. Once traffic ends, observe that tasks scale back down to the minimum of `2` tasks after the cooldown period (saving money!).

---

### 13.5 RDS Database Health & Connection Pool Audit
1. Open **Amazon RDS Console** $\to$ Click **Databases** $\to$ Select `careerprepster-db`.
2. Click the **Monitoring** tab:
   - **CPUUtilization**: Confirm CPU stays below **$80\%$**.
   - **DatabaseConnections**: Confirm active connection count stays healthy (does not exceed connection limit for `db.t4g.micro`).
   - **FreeableMemory**: Confirm free memory remains $> 200\text{ MB}$.

---

### 13.6 Edge CDN & ALB Error Rate Audit
1. Open **Amazon CloudFront Console** $\to$ Select distribution $\to$ **Telemetry** / **Monitoring**:
   - Verify **Cache Hit Rate** $\ge 85\%$ for static frontend assets.
2. Open **EC2 Console** $\to$ **Load Balancers** $\to$ Click `careerprepster-alb` $\to$ **Monitoring**:
   - **HTTP 5XX Count**: Must remain $< 0.5\%$ of total requests.
   - **Target Response Time**: Average latency stays under **$500\text{ms}$**.

---

### 13.7 AI Inference Outbound NAT Audit
1. Open **VPC Console** $\to$ **NAT gateways** $\to$ Select `careerprepster-nat-1a`.
2. Inspect CloudWatch metrics tab:
   - Verify `BytesOutToDestination` increases without packet loss.
   - Proves container outbound traffic to Groq AI scales through the single NAT gateway without socket exhaustion.

---

### 13.8 Compile Stress Test Evidence Report
Document your stress test results for the Capstone defense presentation:

| Metric | Measured Baseline (50 VUs) | Measured Peak (300 VUs) | Capstone Target SLA | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Response Time ($p95$)** | `~85 ms` | `< 850 ms` | $< 1,500\text{ ms}$ | ✅ PASS |
| **HTTP Error Rate (5xx)** | `0.0%` | `0.05%` | $< 1.0\%$ | ✅ PASS |
| **ECS Tasks Scale-Out** | 2 tasks | 4 to 6 tasks | Scales on CPU $> 70\%$ | ✅ PASS |
| **RDS Max CPU** | `12%` | `58%` | $< 80\%$ | ✅ PASS |
| **CloudFront Hit Ratio** | `92%` | `94%` | $\ge 85\%$ | ✅ PASS |


