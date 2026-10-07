# Contract: ECS Fargate Task Definitions & Container Specifications

**Feature ID**: `004-aws-cloud-hosting`  
**Date**: 2026-10-07  

---

## 1. Backend Service Task Definition

- **Family**: `careerprepster-backend-task`
- **Launch Type**: `FARGATE`
- **Network Mode**: `awsvpc`
- **CPU**: `512` (0.5 vCPU)
- **Memory**: `1024` (1024 MB)
- **Execution Role ARN**: `arn:aws:iam::<account>:role/CareerPrepsterEcsTaskExecutionRole`
- **Task Role ARN**: `arn:aws:iam::<account>:role/CareerPrepsterBackendTaskRole`

### Container Definition: `backend`
- **Image**: `<account>.dkr.ecr.<region>.amazonaws.com/careerprepster-backend:latest`
- **Essential**: `true`
- **Port Mappings**:
  - Container Port: `5000`
  - Protocol: `tcp`
- **Environment Variables**:
  - `NODE_ENV`: `"production"`
  - `PORT`: `"5000"`
- **Secrets**: Injected from `careerprepster/production` (see `secrets-contract.md`)
- **Command**:
  ```sh
  ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
  ```
- **Log Configuration**:
  ```json
  {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/careerprepster-backend",
      "awslogs-region": "<target-region>",
      "awslogs-stream-prefix": "backend",
      "awslogs-create-group": "true"
    }
  }
  ```
- **Health Check**:
  - Command: `["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1"]`
  - Interval: `30`
  - Timeout: `5`
  - Retries: `3`
  - Start Period: `45`

---

## 2. Frontend Service Task Definition

- **Family**: `careerprepster-frontend-task`
- **Launch Type**: `FARGATE`
- **Network Mode**: `awsvpc`
- **CPU**: `512` (0.5 vCPU)
- **Memory**: `1024` (1024 MB)
- **Execution Role ARN**: `arn:aws:iam::<account>:role/CareerPrepsterEcsTaskExecutionRole`
- **Task Role ARN**: `arn:aws:iam::<account>:role/CareerPrepsterEcsTaskExecutionRole`

### Container Definition: `frontend`
- **Image**: `<account>.dkr.ecr.<region>.amazonaws.com/careerprepster-frontend:latest`
- **Essential**: `true`
- **Port Mappings**:
  - Container Port: `3000`
  - Protocol: `tcp`
- **Environment Variables**:
  - `NODE_ENV`: `"production"`
  - `PORT`: `"3000"`
  - `HOSTNAME`: `"0.0.0.0"`
  - `NEXT_PUBLIC_API_URL`: `"/api"`
- **Secrets**: Injected from `careerprepster/production` (see `secrets-contract.md`)
- **Command**:
  ```sh
  ["node", "server.js"]
  ```
- **Log Configuration**:
  ```json
  {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/careerprepster-frontend",
      "awslogs-region": "<target-region>",
      "awslogs-stream-prefix": "frontend",
      "awslogs-create-group": "true"
    }
  }
  ```
- **Health Check**:
  - Command: `["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1"]`
  - Interval: `30`
  - Timeout: `5`
  - Retries: `3`
  - Start Period: `30`
