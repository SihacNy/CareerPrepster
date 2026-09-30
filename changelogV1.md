# Changelog V1

Full-stack backend/frontend integration for CareerPrepster (Next.js 14 + Express + MySQL/Prisma + Gemini). Dual persistence: guests save to localStorage, authenticated users save to MySQL.

Branch: `module/cv-editor` · Base HEAD: `e27fbf6 "heavily buggy integration"`

## Latest (unreleased)

- **Email validation hardened** — empty/null/whitespace email now yields a single `Required`; malformed non-empty yields `Invalid email`. Final cause: zod 3.25's chained `.email()` double-fires (`Required` + `Invalid email`) on empty input; fixed with `.pipe(z.string().email(...))` (details in **P4** below).
- **Validation UX** — exact-field `data-validate` auto-focus (P2), collapsible-though-invalid entries that re-open on Continue (P1), inline error text next to labels (P3).
- Full detail in the **Validation UX (problems → fixes)** section below.

## Backend (`backend/`)

### Schema + service parity (`T007`)
- **`src/schemas/cv.schema.ts`** — Zod schemas synced with the frontend types:
  - `createCvSchema` now accepts `sections`, `skillGroups`, `targetRole`.
  - `cvItemSchema` relaxed `title` (optional) and added missing fields.
  - `cvSectionSchema` accepts `title` + `customTitle`.
- **`src/services/cv.service.ts`** — `createCv` now persists authored sections/items/bullets/skillGroups instead of hardcoded defaults; the update path maps `sec.title` → `customTitle`.

### Validation hardening
- **`src/schemas/cv.schema.ts`** — `bulletPointSchema.text` relaxed from `min(1)` to `default('')`: drafts legitimately contain empty bullet rows mid-edit, so blank bullets no longer reject `POST/PUT /api/cvs` with a 400.

### Google OAuth user → DB persistence
- **`src/services/auth.service.ts`** — `googleAuth()` dual path:
  1. `verifyIdToken(idToken)` (ID-token flow).
  2. Fallback to `getTokenInfo()` + userinfo fetch (access-token flow) for implicit-flow tokens.
  - Creates a user row in MySQL and issues a JWT.
- **`src/controllers/auth.controller.ts`** — sets the HttpOnly JWT cookie on login.

## Frontend (`frontend/`)

### Persistence layer (`T009`–`T014`)
- **`src/lib/storageKeys.ts`** (new) — centralizes all localStorage keys.
- **`src/lib/store.tsx`**:
  - `PersistenceState` (`isSynced`, `lastSync`, `saveSource: "cloud" | "local"`) exposed on the CV context.
  - `saveDraft()` async — cloud when real session, localStorage when guest, mirrors cloud saves to localStorage for sign-out continuity.
  - Hydration — authenticated users load from MySQL, guests from localStorage; promotes guest-origin drafts on sign-in (`isLocalDraftId()`).
  - `loadFromHistory()` — routes by id type: update existing cloud CV (`PUT`) vs promote local one (`POST`); no more duplicate creation.
  - Public legacy API mirrored into existing `cvApi` calls.
- **`src/lib/historyStore.ts`** — `getCloudHistory()`, `getUnifiedHistory()`, `deleteFromHistory()`, `duplicateHistoryItem()` — dual persistence for history CRUD + list. Cloud-facing take a `cloudAuth: boolean` flag (backed by `isBackendSession`) instead of a raw `user`, so local-only profiles never trigger doomed cloud requests.

### Auth state (`T008`, `T014`)
- **`src/lib/auth.tsx`**:
  - `checkSession` restores user from backend via `authApi.getMe()` with localStorage fallback.
  - **NEW `isBackendSession`** — `true` only when the backend confirms the session (`/auth/me` OK or Google token exchange returned a user); `false` for any localStorage-restored profile. Cloud writes are only attempted when `user && isBackendSession`; a fake profile degrades to guest (local) persistence instead of silently 401-ing.
  - `loginWithGoogleCredential` hits the backend first (ID-token or access-token path) before the client-only fallback.
  - Logout clears the user + draft + history keys (no more cross-account localStorage leak).
- **`src/components/auth/AuthModal.tsx`** — sends the Google access token to `authApi.loginWithGoogle()`; marks backend-confirmed logins with `{ backendSession: true }`. Scope: `openid email profile`.

### Editor integration (`T015`)
- **`src/components/editor/ContinueActionBar.tsx`** — save-source indicator: "Synced to cloud" vs "Saved locally"; `handleContinue` calls `saveDraft()` and blocks navigation to `/editor/job-match` when it returns `false` (validation failed). Early design rendered a red panel listing field paths here — **removed** (see "Validation UX" below for why).

### Frontend input validation
- **`src/lib/cvValidation.ts`** (new) — Zod rules mirroring `backend/src/schemas/cv.schema.ts`, adapted to the nested `personalInfo` shape: `fullName` and `email` required (+ valid email format when non-empty), URLs valid-if-non-empty, `targetRoleId` UUID-if-set, skill category names required; bullet text may be empty (matches backend relaxation). Messages standardized to short forms: `Required`, `Invalid email`, `Invalid URL`.
- **`src/lib/store.tsx`** — `validateCV()` runs in `saveDraft` before any cloud call; invalid payloads never hit the server (no more 400). Invalid drafts still persist to localStorage (no data loss) and record `validationErrors` on `PersistenceState` (`isSynced: false`, `saveSource: "local"`). `saveDraft()` returns `Promise<boolean>` so the Continue button can gate on it.
- **All section items validated** — beyond `personalInfo`/skills, every authored entry is required to be filled: item `title` non-empty for education/experience/projects/custom items, plus a `.superRefine` requiring `subtitle` (institution/company) for `EDUCATION`/`EXPERIENCE` items. A blank template's placeholder entries (`edu-init-1`, `exp-init-1`, `proj-init-1`) count as kept and are flagged until removed or filled.

### Validation UX (problems → fixes)

**P1 — Errored entries could not be collapsed.**
- *Problem:* entries with validation errors were force-expanded (`isCollapsed = hasError ? false : …`), so a long CV could not be tidied while still invalid.
- *Fix:* `isCollapsed` is purely user-controlled again. Added `validationRunId` to `PersistenceState` — incremented on **every** validate run inside `saveDraft`. New `useReopenErroredEntries()` hook (`FieldError.tsx`) in each section re-expands entries that still carry errors **only when that run id advances**, i.e. precisely when the user hits Continue. So you can close a section mid-edit, but the act of retrying (Continue) re-opens the offending entries and hands focus to them.

**P2 — Auto-jump went to the *first* field of the section, not the invalid one.**
- *Problem:* the validation `useEffect` in `CVForm.tsx` expanded the section, then focused its **first** input. After filling field 1, hitting Continue recomputed `errors[0]` = field 2 but the effect still focused field 1 — so it felt like "it doesn't register and brings you back", even though the value was saved.
- *Fix:* every validated input carries `data-validate="<field.path>"` (e.g. `sections.0.items.1.subtitle`, `skillGroups.1.categoryName`). The effect now looks up the exact first-invalid field by that attribute and scrolls it into center / focuses **it**, falling back to the section's first input only if no match. It also:
  - skips re-focusing when `document.activeElement` is already the target (no focus-steal churn),
  - dropped `cvData` from the effect deps so typing (which updates `cvData`) no longer re-triggers scrolling/focusing on every keystroke,
  - resolves the owning section by `section.sectionType` (custom sections use their own `section-<id>` open/scroll path, no more broken idx→skills mapping).

**P3 — Error text placement.**
- *Problem:* `FieldError` rendered as a paragraph under the input, which scrolled the layout and was easy to miss next to the field it belonged to.
- *Fix:* `FieldError` gained an `inline` variant rendered inside the `<label>`, right after the field name (`Full Name * Required`), with the rose border kept on the input (`fieldErrorInputClass`). Removed the under-input paragraphs.

**P4 — Email could be `null` and slip past validation.**
- *Problem:* a CV loaded/imported with `email: null` (or `undefined`) reached validation intact, and the email union only rejected non-empty *malformed* values — so a null/blank email passed even though the input is labelled required (`*`). A null elsewhere would also surface as a raw "Expected string, received null".
- *Fix:* dropped the email `union`/`refine` workaround — `email` is a required `z.string()` with the library's built-in error overrides: `{ invalid_type_error: "Required", required_error: "Required" }`, then `.trim().min(1, "Required").pipe(z.string().email("Invalid email"))`. Final root cause of the "still says Invalid email when empty" symptom: zod 3.25's chained `.email()` does **not** short-circuit on the earlier `min` failure — for an empty value it emits **two** issues (`Required` **and** `Invalid email`), and `buildValidationMap`'s last-write-wins left `Invalid email` on the label. `.pipe()` runs the format check only when the previous stage passed, so `null`/`undefined`/`""`/whitespace-only → `Required`, malformed non-empty → `Invalid email` — exactly one issue, always.

### Docker dev hot-reload
- **`docker-compose.yml`** — bind-mounted dev servers (`tsx watch`, `next dev`) didn't pick up host file edits on Windows (filesystem events don't propagate into containers).
- *Fix:* backend `CHOKIDAR_USEPOLLING: "true"` + `CHOKIDAR_INTERVAL: 500`; frontend `WATCHPACK_POLLING: "true"` + `CHOKIDAR_USEPOLLING: "true"`. Validated with `docker compose config`; apply with `docker compose up -d`.

### Bug fixes
- **`loadCV`** (`store.tsx`) — now routes by id type: real cloud UUID → `cvApi.update()` (in-place update, no duplicates); guest/local id or none → `cvApi.create()` (create/promote); guest → localStorage.
- **`frontend/src/app/history/page.tsx`** — remote CV merge/`cvApi.delete` gated on `isBackendSession` so fake profiles don't fire doomed 401 requests.
- **Root cause: "logged in but saving locally"** — `checkSession` kept a localStorage-only profile alive even when the backend cookie was missing/invalid, so `user` was truthy while every `cvApi` call 401'd → silent local fallback. Fixed via `isBackendSession` gating (see Auth state above) across `store.tsx`, `historyStore.ts`, and the history page.

- **`src/components/editor/CVForm.tsx`** — after a blocked save, the section containing the first invalid field is auto-expanded, scrolled to, and its offending input focused (exact-`data-validate` targeting, see P2 above). Custom sections are opened via `customOpen[sec.id]` and scrolled to `section-<id>`.

## Verification
- MySQL container healthy; `prisma db push` applied; seed verified (17 job roles, 51 starter bullets).
- Frontend `npx tsc --noEmit` exits 0 (post-validation-UX build).
- Backend `tsc` only has 2 pre-existing errors (`@types/morgan`, `@types/multer`), unrelated to these changes.

## Tasks
- `T001`–`T015` all marked `[x]` in `specs/001-cv-editor/tasks.md`.

## Requirements
- Copy `backend/.env.example` → `backend/.env` before first local run (contains `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `GOOGLE_CLIENT_ID`).
- Copy `frontend/.env.example` → `frontend/.env.local` with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
- Docker backend runs `npx prisma db push && npx prisma db seed` on every start (bind-mounted + `tsx watch`, so source edits hot-reload).