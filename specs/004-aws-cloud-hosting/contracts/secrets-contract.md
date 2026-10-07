# Contract: Secrets Manager Schema & Environment Variable Injection

**Feature ID**: `004-aws-cloud-hosting`  
**Date**: 2026-10-07  

---

## 1. Secrets Manager Secret Definition

- **Secret Name**: `careerprepster/production`
- **Description**: Production credentials and API keys for CareerPrepster services.
- **KMS Key**: `alias/careerprepster-cmk` (AWS KMS Customer Managed Key - Security Rule S2)
- **Rotation**: Manual / 90-day recommended.

### 1.1 JSON Key-Value Schema

| Key | Type | Description | Example / Format |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | string | Full Prisma MySQL connection string pointing to private RDS instance | `mysql://careerprepster_admin:<PASS>@careerprepster-db.c123456.ap-southeast-1.rds.amazonaws.com:3306/careerprepster?sslaccept=strict` |
| `JWT_SECRET` | string | Cryptographically secure secret key for user session tokens | `64-character hexadecimal or base64 string` |
| `GROQ_API_KEY` | string | Groq Cloud API key for high-speed LLM inference | `gsk_...` |
| `GROQ_MODEL` | string | Target model ID | `openai/gpt-oss-120b` or `llama-3.3-70b-versatile` |
| `GEMINI_API_KEY` | string | Optional fallback Google Cloud / AI Studio API key | `AIzaSy...` |
| `GOOGLE_CLIENT_ID` | string | Google OAuth 2.0 Web Application Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | string | Google OAuth 2.0 Web Application Client Secret | `GOCSPX-abc123xyz` |
| `CLIENT_URL` | string | Public HTTPS domain of the application | `https://<distribution-id>.cloudfront.net` (AWS Default Domain) |
| `S3_BUCKET_NAME` | string | Name of the S3 bucket for media and PDF storage | `careerprepster-media-123456789012` |

---

## 2. ECS Task Definition Injection Stanza

The AWS ECS Task Execution Agent reads secrets using the following format:

### 2.1 Backend Task Definition `secrets`

```json
[
  {
    "name": "DATABASE_URL",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:DATABASE_URL::"
  },
  {
    "name": "JWT_SECRET",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:JWT_SECRET::"
  },
  {
    "name": "GROQ_API_KEY",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:GROQ_API_KEY::"
  },
  {
    "name": "GROQ_MODEL",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:GROQ_MODEL::"
  },
  {
    "name": "GEMINI_API_KEY",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:GEMINI_API_KEY::"
  },
  {
    "name": "GOOGLE_CLIENT_ID",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:GOOGLE_CLIENT_ID::"
  },
  {
    "name": "GOOGLE_CLIENT_SECRET",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:GOOGLE_CLIENT_SECRET::"
  },
  {
    "name": "CLIENT_URL",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:CLIENT_URL::"
  },
  {
    "name": "S3_BUCKET_NAME",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:S3_BUCKET_NAME::"
  }
]
```

### 2.2 Frontend Task Definition `secrets`

```json
[
  {
    "name": "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
    "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:careerprepster/production:GOOGLE_CLIENT_ID::"
  }
]
```
