# AGENTS.md

Full-stack AI CV editor (Next.js 14 App Router + Tailwind frontend, Express + Prisma/MySQL backend, Gemini for AI rewrites). Spec-driven workflow via Git Spec Kit. Active branch `module/cv-editor` is a WIP integration replacing frontend mocks with live backend calls.

## Layout

- `backend/` — Express TS/ESM API (port 5000). Entry `src/index.ts`. Architecture: routes → controllers → services; Zod validation; `src/schemas/*`.
- `frontend/` — Next.js 14 App Router app (port 3000). Pages under `src/app`; shared state `src/lib/store.tsx`, API client `src/lib/api.ts`.
- `docker-compose.yml` — dev stack: mysql (host port **3307**), backend, frontend. Source is volume-mounted, so edits hot-reload (`tsx watch` / `next dev`).
- `specs/<feature-id>/` — spec/plan/tasks artifacts; `.specify/memory/constitution.md` = project rules; `SPEC_GUIDE.md` = workflow. Backend API reference: `backend/backend.md`. State audits: `report_backend.md`, `report_frontend.md`, `COVERAGE_MATRIX.md`.

## Commands

- Full stack: `docker compose up -d` (then backend :5000, frontend :3000, mysql on localhost:3307).
- Backend: `npm run dev` (tsx watch), `npm run build` (`tsc`, also the typecheck — no separate lint/typecheck script), `npm run test:api`.
- DB (in `backend/`): `npx prisma db push`, `npx prisma db seed`, `npx prisma studio`. Uses **`db push`, no migrations folder** — `schema.prisma` is the source of truth.
- Frontend: `npm run dev`, `npm run build`, `npm run lint` (`next lint`). No frontend test suite.

## Gotchas

- **Auth is Google-OAuth-only.** Actual routes are `/api/auth/google|me|logout`. `backend.md`'s route table and `test-backend.mjs` still reference `/api/auth/register|login` (stale — `npm run test:api` will fail at the auth step). Don't reintroduce email/password auth without a spec; `COVERAGE_MATRIX.md` codifies the OAuth-only policy.
- **Backend is NodeNext ESM**: relative imports in `backend/src` must use explicit `.js` extensions (e.g. `import { env } from './config/env.js'`) or `tsc` fails. Mirror existing imports.
- `backend/src/config/env.ts` validates env at boot with Zod and throws if `DATABASE_URL` or `JWT_SECRET` (min 8 chars) is missing. Copy `backend/.env.example`; pass `GEMINI_API_KEY` to use AI endpoints.
- After editing `schema.prisma` run `npx prisma db push && npx prisma generate`. `binaryTargets` includes `linux-musl-openssl-3.0.x` for the Alpine Docker build — keep it.
- API response shape is `{ success, data }` / `{ success, error: { code, message, details } }`. Frontend `api.ts` sends `credentials: include` (HttpOnly JWT cookie); backend CORS is locked to `CLIENT_URL`.
- `DATABASE_URL` differs: `mysql:3306` inside Docker vs `localhost:3306` for local `npm run dev`; the compose MySQL port is 3307, not 3306.

## Workflow

- Follow the spec-driven lifecycle (SPEC_GUIDE.md + constituent in `.specify/memory/constitution.md`): new features go through `/speckit-*` skills producing `specs/<id>/{spec,plan,tasks}.md` before code.
- Remaining integration work for the current branch is tracked in `specs/001-cv-editor/tasks.md` (T081–T089: replace mock data/utils with `lib/api.ts` calls).