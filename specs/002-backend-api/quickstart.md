# Quickstart & Verification Guide: Module 2 - Backend API

**Branch**: `module/backend-api` | **Date**: 2026-09-12 | **Status**: Complete

---

## 1. Prerequisites

- **Node.js**: 20 LTS or higher (`node -v`)
- **Docker & Docker Compose**: Installed and running (`docker compose version`)
- **Google Gemini API Key**: Valid key with Gemini 2.5 Flash access

---

## 2. Environment Configuration

Create or update `.env` in the repository root and `backend/.env`:

```env
# Backend Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database (MySQL 8.0)
DATABASE_URL="mysql://root:rootpassword@localhost:3306/careerprepster"

# Authentication
JWT_SECRET="super-secret-jwt-key-for-development-mode-only"
JWT_EXPIRES_IN="7d"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key-here"
```

---

## 3. Starting the Services

### Option A: Docker Compose (Recommended)

```bash
# Start MySQL, Backend API, and Frontend concurrently
docker compose up -d

# View backend logs
docker compose logs -f backend
```

### Option B: Local Development

```bash
# 1. Start MySQL container
docker compose up -d mysql

# 2. Install backend dependencies
cd backend
npm install

# 3. Apply Prisma migrations & seed 15+ job roles + 50 starter bullets
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start backend dev server with hot reload
npm run dev
```

The Express API is now listening at `http://localhost:5000`.

---

## 4. End-to-End Verification with `curl`

### Step 1: Health Check
```bash
curl -X GET http://localhost:5000/api/health
# Expected: {"status":"healthy","database":"connected","timestamp":"..."}
```

### Step 2: Register a New User
```bash
curl -i -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Password123!","name":"Jane Doe"}'
# Expected: 201 Created + Set-Cookie: token=...
```

### Step 3: Search Job Role Catalog (Pre-Seeded)
```bash
curl -X GET "http://localhost:5000/api/job-roles?q=frontend"
# Expected: 200 OK with array containing "Frontend Developer" role and skills
```

### Step 4: AI Bullet Enhancement (Google Gemini)
```bash
curl -X POST http://localhost:5000/api/ai/enhance-bullet \
  -H "Content-Type: application/json" \
  --cookie "token=<YOUR_JWT_TOKEN>" \
  -d '{"rawBullet":"I made our website load faster by optimizing images.","framework":"XYZ"}'
# Expected: 200 OK with structured suggestions containing power verbs and metrics
```

### Step 5: Resume Import (PDF Parsing + Gemini Structuring)
```bash
curl -X POST http://localhost:5000/api/cvs/import \
  -F "file=@sample_resume.pdf"
# Expected: 200 OK with fully structured CV JSON tree
```

### Step 6: ATS Scoring Engine (Deterministic Rule Engine)
```bash
curl -X POST http://localhost:5000/api/ats/score \
  -H "Content-Type: application/json" \
  --cookie "token=<YOUR_JWT_TOKEN>" \
  -d '{"cvId":"<CV_UUID>"}'
# Expected: 200 OK with 4 pillar breakdown and actionable findings
```
