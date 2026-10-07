# Phase 1 Data Model: Database Schema, Storage Entities & AWS IAM/KMS Policies

**Feature ID**: `004-aws-cloud-hosting`  
**Scenario**: `Scenario 8 - CareerPrepster (custom capstone)`  
**Date**: 2026-10-07  

---

## 1. Network Topology & Subnet Allocations

### 1.1 VPC Specification
- **VPC Name**: `careerprepster-vpc`
- **Primary Region**: `ap-southeast-1` (Singapore)
- **Domain Strategy**: AWS Default Domains (Amazon CloudFront `https://<distribution-id>.cloudfront.net` with native AWS wildcard SSL; no custom domain / Route 53 required)
- **DNS Hostnames & Resolution**: Enabled (`true`)

### 1.2 Subnet Allocation Table (Multi-AZ Architecture)

| Subnet Name | AZ | IPv4 CIDR | Gateway Route Target | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `public-subnet-1a` | `ap-southeast-1a` | `10.0.1.0/24` | `0.0.0.0/0` -> Internet Gateway (`careerprepster-igw`) | ALB Node A, NAT Gateway |
| `public-subnet-1b` | `ap-southeast-1b` | `10.0.2.0/24` | `0.0.0.0/0` -> Internet Gateway (`careerprepster-igw`) | ALB Node B |
| `private-app-subnet-1a` | `ap-southeast-1a` | `10.0.10.0/24` | `0.0.0.0/0` -> NAT Gateway (`nat-gateway-1a`) | ECS Fargate Backend & Frontend Tasks |
| `private-app-subnet-1b` | `ap-southeast-1b` | `10.0.11.0/24` | `0.0.0.0/0` -> NAT Gateway (`nat-gateway-1a`) | ECS Fargate Backend & Frontend Tasks |
| `private-db-subnet-1a` | `ap-southeast-1a` | `10.0.20.0/24` | Isolated (`10.0.0.0/16` local only) | RDS MySQL Primary Instance |
| `private-db-subnet-1b` | `ap-southeast-1b` | `10.0.21.0/24` | Isolated (`10.0.0.0/16` local only) | RDS MySQL Multi-AZ Standby / Read Replica |

---

## 2. Security Group Ingress / Egress Matrix

| Security Group | ID / Name | Inbound Rules | Outbound Rules |
| :--- | :--- | :--- | :--- |
| **`sg-careerprepster-alb`** | `sg-alb` | - Port 80 (HTTP) from `0.0.0.0/0`<br>- Port 443 (HTTPS) from `0.0.0.0/0` | - Port 3000 to `sg-ecs-frontend`<br>- Port 5000 to `sg-ecs-backend` |
| **`sg-careerprepster-frontend`** | `sg-ecs-frontend` | - Port 3000 from `sg-careerprepster-alb` | - Port 443 to `0.0.0.0/0` via NAT (package/CDN assets) |
| **`sg-careerprepster-backend`** | `sg-ecs-backend` | - Port 5000 from `sg-careerprepster-alb` | - Port 3306 to `sg-careerprepster-rds`<br>- Port 443 to `0.0.0.0/0` via NAT (Groq API, Google OAuth, S3, Secrets Manager) |
| **`sg-careerprepster-rds`** | `sg-rds` | - Port 3306 strictly from `sg-careerprepster-backend` | - None (isolated) |

---

## 3. Relational Database Schema (Amazon RDS MySQL)

Conforming to the exact Capstone specification data records:

### 3.1 Table Definitions

```sql
-- 1. Students Table
CREATE TABLE students (
  student_id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  university VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_students_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CVs Table (Requirement R1 & R3)
CREATE TABLE cvs (
  cv_id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  template VARCHAR(128) NOT NULL DEFAULT 'modern-1',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  INDEX idx_cvs_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CV Sections Table (STAR/XYZ rewritten text)
CREATE TABLE cv_sections (
  section_id VARCHAR(64) PRIMARY KEY,
  cv_id VARCHAR(64) NOT NULL,
  type VARCHAR(64) NOT NULL, -- 'WORK_EXPERIENCE', 'PROJECTS', 'EDUCATION', 'SKILLS'
  text MEDIUMTEXT NOT NULL,
  FOREIGN KEY (cv_id) REFERENCES cvs(cv_id) ON DELETE CASCADE,
  INDEX idx_sections_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ATS Reviews Table (Requirement R2 & R3)
CREATE TABLE ats_reviews (
  review_id VARCHAR(64) PRIMARY KEY,
  cv_id VARCHAR(64) NOT NULL,
  score INT NOT NULL, -- Score from 0 to 100
  findings JSON NOT NULL, -- Exact fixes: missing keywords, weak phrasing, formatting
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cv_id) REFERENCES cvs(cv_id) ON DELETE CASCADE,
  INDEX idx_reviews_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Object Storage & File Asset Entity Model (Amazon S3)

### 4.1 S3 Bucket Specification
- **Bucket Name**: `careerprepster-media-<aws-account-id>`
- **Block Public Access**: All 4 settings enabled (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets`)
- **Server-Side Encryption**: `aws:kms` using Customer Managed Key `alias/careerprepster-cmk` (Security Rule S2)

### 4.2 S3 Object Key Hierarchy

```text
careerprepster-media-<account-id>/
├── exports/                                  # Exported student CV PDFs (Tenant Isolated)
│   ├── STU-00412/
│   │   ├── cv-2026-09-20.pdf                 # Exact capstone brief example key
│   │   └── cv-2026-10-05.pdf
│   └── STU-00891/
│       └── cv-2026-10-01.pdf
└── templates/                                # Read-only downloadable CV templates
    ├── modern-1.docx                         # Exact capstone brief example key
    ├── technical-lead-v2.docx
    └── academic-starter.docx
```

---

## 5. Security & Resource Policies in Real JSON (Deliverable 1B & Security S1–S4)

### 5.1 AWS KMS Customer Managed Key Policy (Security Rule S2)

```json
{
  "Version": "2012-10-17",
  "Id": "CareerPrepsterKmsKeyPolicy",
  "Statement": [
    {
      "Sid": "EnableRootManagement",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "AllowEcsTaskDecryptionAndEncryption",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::123456789012:role/CareerPrepsterBackendTaskRole",
          "arn:aws:iam::123456789012:role/CareerPrepsterEcsTaskExecutionRole"
        ]
      },
      "Action": [
        "kms:Decrypt",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowRdsEncryption",
      "Effect": "Allow",
      "Principal": {
        "Service": "rds.amazonaws.com"
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

### 5.2 S3 Bucket Policy (Enforcing HTTPS & KMS CMK Encryption)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedTraffic",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::careerprepster-media-123456789012",
        "arn:aws:s3:::careerprepster-media-123456789012/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Sid": "DenyUnencryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::careerprepster-media-123456789012/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    }
  ]
}
```

### 5.3 Backend Task IAM Role Policy (`CareerPrepsterBackendTaskRole`)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ExportReadWrite",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::careerprepster-media-123456789012/exports/*"
    },
    {
      "Sid": "AllowS3TemplateReadOnly",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::careerprepster-media-123456789012/templates/*"
    },
    {
      "Sid": "AllowKmsDecryption",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:ap-southeast-1:123456789012:key/careerprepster-cmk-id"
    }
  ]
}
```

### 5.4 ECS Task Execution IAM Role Policy (`CareerPrepsterEcsTaskExecutionRole`)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSecretsManagerDecryption",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production-*"
    },
    {
      "Sid": "AllowKmsDecryptForSecrets",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "arn:aws:kms:ap-southeast-1:123456789012:key/careerprepster-cmk-id"
    }
  ]
}
```
