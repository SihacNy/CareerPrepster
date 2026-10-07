# Contract: ALB & CloudFront Routing Architecture

**Feature ID**: `004-aws-cloud-hosting`  
**Date**: 2026-10-07  

---

## 1. CloudFront Distribution Contract

### 1.1 Origin Configuration
- **Origin Domain**: ALB Default DNS name: `careerprepster-alb-123456789.ap-southeast-1.elb.amazonaws.com`
- **Protocol**: HTTP (Port 80) between CloudFront and ALB (or HTTPS if custom SSL is configured later)
- **Origin SSL Protocols**: TLSv1.2, TLSv1.3 (Viewer to CloudFront uses native `*.cloudfront.net` SSL)
- **Custom Header**: `X-CloudFront-Secret: <custom-generated-uuid>` (Optionally ensures direct hits to ALB from the public web are blocked)

### 1.2 Cache Behaviors Matrix

| Precedence | Path Pattern | Target Origin | Allowed Methods | Cache Policy | Origin Request Policy | Viewer Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | `/api/*` | ALB Origin | `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE` | `CachingDisabled` | `AllViewerExceptHostHeader` | Redirect HTTP to HTTPS |
| **1** | `/_next/static/*` | ALB Origin | `GET, HEAD, OPTIONS` | `CachingOptimized` (TTL=31536000) | `CORS-S3Origin` | Redirect HTTP to HTTPS |
| **2** | `/static/*` | ALB Origin | `GET, HEAD, OPTIONS` | `CachingOptimized` | `CORS-S3Origin` | Redirect HTTP to HTTPS |
| **Default** | `*` | ALB Origin | `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE` | `CachingDisabled` (or 60s microcache) | `AllViewerExceptHostHeader` | Redirect HTTP to HTTPS |

---

## 2. Application Load Balancer (ALB) Routing Contract

### 2.1 Listeners (AWS Default Domain Architecture)

#### Listener 1: Port 80 (HTTP)
- **Default Action**:
  - In direct access / CloudFront HTTP origin: Forwards to Target Groups based on Path rules.
  - Path `/api/*` $\to$ `tg-careerprepster-backend` (Port 5000)
  - Default `/*` $\to$ `tg-careerprepster-frontend` (Port 3000)
*(Note: Because no custom domain is registered, ACM certificates cannot be bound to `*.elb.amazonaws.com`. End-user HTTPS termination is performed by Amazon CloudFront using its native `*.cloudfront.net` wildcard certificate).*

### 2.2 Routing Rules Hierarchy

```text
[ Incoming Request on Port 443 ]
               │
               ▼
   Is Path == "/api/*" ?
   ├── YES ──► Forward to Target Group: tg-careerprepster-backend (Port 5000)
   │
   └── NO ───► Default: Forward to Target Group: tg-careerprepster-frontend (Port 3000)
```

### 2.3 Target Group Specifications

#### Target Group 1: `tg-careerprepster-backend`
- **Target Type**: `IP` (required for ECS Fargate `awsvpc` network mode)
- **Protocol**: `HTTP`
- **Port**: `5000`
- **VPC**: `careerprepster-vpc`
- **Health Check Configuration**:
  - Protocol: `HTTP`
  - Path: `/api/health`
  - Port: `traffic-port`
  - Healthy Threshold: `2`
  - Unhealthy Threshold: `3`
  - Timeout: `5 seconds`
  - Interval: `30 seconds`
  - Success Codes: `200`
- **Deregistration Delay**: `30 seconds`

#### Target Group 2: `tg-careerprepster-frontend`
- **Target Type**: `IP` (required for ECS Fargate `awsvpc` network mode)
- **Protocol**: `HTTP`
- **Port**: `3000`
- **VPC**: `careerprepster-vpc`
- **Health Check Configuration**:
  - Protocol: `HTTP`
  - Path: `/`
  - Port: `traffic-port`
  - Healthy Threshold: `2`
  - Unhealthy Threshold: `4`
  - Timeout: `5 seconds`
  - Interval: `30 seconds`
  - Success Codes: `200-399`
- **Deregistration Delay**: `30 seconds`
