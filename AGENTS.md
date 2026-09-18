# AGENTS.md

CareerPrepster: full-stack AI CV editor (Next.js 14 + Express + MySQL/Prisma + Gemini). Root npm workspaces link `shared/` (`@careerprepster/shared`), `backend/`, and `frontend/`. Run npm commands from each package dir or with `--workspace=<name>`; `docker compose` from the root.

## Commands

Backend (`backend/`) — Express + TS **ESM**, Prisma/MySQL, Google Gemini:
- `npm run dev` — tsx watch `src/index.ts` (port 5000)
- `npm run build` — `tsc`; requires `npx prisma generate` first
- Tests: `npm run test:api` runs `test-backend.mjs`, a smoke suite against a live server. Needs MySQL up, DB seeded, and `GEMINI_API_KEY` set. No unit-test framework.
- DB: `npx prisma migrate dev`, `npx prisma db push`, `npx prisma db seed`, `npx prisma studio`. Seed populates 15+ job roles + 50 starter bullets.
- Copy `backend/.env.example` → `backend/.env` before first run.

Frontend (`frontend/`) — Next.js 14 App Router + Tailwind:
- `npm run dev` (port 3000), `npm run build`
- There is no ESLint config/dependency: `npm run lint` (= `next lint`) will prompt interactively and hang. Typecheck with `npx tsc --noEmit` instead. No test setup.
- Copy `frontend/.env.example` → `frontend/.env.local` for `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

Docker (root `docker-compose.yml`): `docker compose up -d` brings up mysql → backend → frontend. MySQL is exposed on **host port 3307** (local dev DB URL uses 3306). Compose hardcodes a dev `JWT_SECRET` and a default `GEMINI_API_KEY` — never log or commit them.

## Gotchas

- Backend is ESM (`"type": "module"`, NodeNext): relative imports MUST include `.js` extension (`import x from '../config/env.js'`). The `@/*` alias in `backend/tsconfig.json` is unused — keep it that way.
- After any `prisma/schema.prisma` change run `npx prisma generate`, or `tsc`/dev fail. The generator pins `linux-musl-openssl-3.0.x`/`debian-openssl-3.0.x` binary targets for the Alpine Docker images.
- Auth is a JWT in an HttpOnly cookie; `frontend/src/lib/api.ts` fetches with `credentials: "include"`. The frontend is intentionally Google-OAuth-only (no password forms) even though the backend still exposes `POST /api/auth/register|login`.
- The Docker backend image runs `npx prisma db push && npx prisma db seed` on every start.

## Data model

Prisma relational CV tree: `CV → CVSection → CVItem → BulletPoint`, plus `SkillGroup`, `ATSReport`, `JobRole`/`RoleBulletTemplate`. `frontend/src/types/cv.ts` and `frontend/src/lib/store.tsx` mirror it but wrap header fields in a nested `personalInfo` object — NOT the flat `fullName`/`email` shape drawn in `COVERAGE_MATRIX.md`. The report files (`report_backend.md`, `report_frontend.md`, `COVERAGE_MATRIX.md`) drift from the code; verify against source. The frontend↔backend integration is incomplete and mid-refactor (uncommitted changes at HEAD `e27fbf6 "heavily buggy integration"`).

## Spec-driven workflow

The project uses Speckit (spec → plan → tasks → implement), with skills under `.agents/skills/` (speckit-*) and the constitution at `.specify/memory/constitution.md`. Feature artifacts live in `specs/<feature-id>/` (`001-cv-editor`, `002-backend-api`). `SPEC_GUIDE.md` describes the lifecycle. Work happens on `module/*` branches (current: `module/cv-editor`).