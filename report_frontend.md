# 💻 CareerPrepster Frontend — Technical Architecture & UI/UX Documentation Report

**Project Name:** CareerPrepster Web Application  
**Framework:** Next.js 14.2 (App Router)  
**Language:** TypeScript 5.7  
**Styling:** Tailwind CSS 3.4 & Custom Design Tokens  
**State Architecture:** Context API with Generic Relational Schema (`CVProvider`)  
**PDF Engine:** `@react-pdf/renderer` 4.1  
**Authentication:** `@react-oauth/google` with HttpOnly Session Cookies  

---

## 📑 Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [Technology Stack & Infrastructure](#2-technology-stack--infrastructure)
3. [Application Architecture & Component Hierarchy](#3-application-architecture--component-hierarchy)
4. [Route & Page Catalog](#4-route--page-catalog)
5. [Core Features & UI Subsystems](#5-core-features--ui-subsystems)
6. [State Management & Generic Relational Schema](#6-state-management--generic-relational-schema)
7. [Design System & Dual-Theme Engine](#7-design-system--dual-theme-engine)
8. [ATS Diagnostic & Keyword Matching Interface](#8-ats-diagnostic--keyword-matching-interface)
9. [PDF Generation & Template Architecture](#9-pdf-generation--template-architecture)
10. [Local Development & Build Guide](#10-local-development--build-guide)

---

## 1. Executive Overview

**CareerPrepster Frontend** is an AI-powered resume engineering workspace built specifically for university students, recent graduates, and career switchers. It bridges the gap between raw student experience and competitive applicant tracking system (ATS) requirements.

### Key Capabilities:
- **Real-Time Split-Pane WYSIWYG Editor:** Synchronous live editing with instant canvas preview rendering across standard single-column and modern double-column layouts.
- **Generic Relational State Store:** Full schema alignment with backend relational models, enabling arbitrary custom sections (e.g. *Leadership*, *Volunteering*, *Certifications*).
- **Google Gemini AI Enhancement Studio:** In-editor AI modal that rewrites weak resume bullet points using Google's **XYZ Formula** (*Accomplished [X] as measured by [Y] by doing [Z]*) and the **STAR Method**.
- **Interactive 4-Pillar ATS Diagnostic Dashboard:** Visual circular gauge scoring (0–100), pillar breakdowns (*Parsability*, *Impact*, *Skills*, *Brevity*), and real-time keyword gap analysis against target job postings.
- **Client-Side Vector PDF Export:** Deterministic compilation of ATS-parsable vector PDFs using `@react-pdf/renderer` directly in the browser.
- **Version History & Snapshot Restore:** Local snapshot engine with automatic timestamping, word count diagnostics, ATS score logging, and single-click restoration.
- **Dual-Theme Studio:** Instant toggling between **Slate-50 Clean Canvas** and **Slate-900 Command Center** with full contrast preservation.

---

## 2. Technology Stack & Infrastructure

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 14.2.21 | Server & Client Components, hybrid static site generation, file-based routing |
| **Language** | TypeScript | 5.7.2 | End-to-end type safety, strict interface contracts, IntelliSense |
| **Core UI** | React & React DOM | 18.3.1 | Component rendering, concurrent features, hooks lifecycle |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS, custom design tokens, dark/light theme variables |
| **Icons** | Lucide React | 0.468.0 | Consistent, modern iconography across navigation, actions, and status badges |
| **PDF Engine** | `@react-pdf/renderer` | 4.1.2 | In-browser vector PDF compilation and download stream generation |
| **Auth Client** | `@react-oauth/google` | 0.13.5 | Google Sign-In button integration and ID token acquisition |
| **Parsing** | `mammoth` & `pdf-parse` | 1.12 / 2.4 | Client/edge extraction of raw text from `.pdf` and `.docx` uploads |
| **Validation** | Zod | 3.24.1 | Runtime payload and schema verification |
| **Class Utilities** | `clsx`, `tailwind-merge` | 2.1 / 2.5 | Dynamic class combination and conflict resolution |

---

## 3. Application Architecture & Component Hierarchy

```
                               ┌─────────────────────────┐
                               │       RootLayout        │
                               │   (globals.css, Fonts)  │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │       Providers         │
                               │  (GoogleOAuth, AuthCtx, │
                               │        CVCtx)           │
                               └────────────┬────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
      ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
      │   LandingPage   │          │   EditorLayout  │          │   HistoryPage   │
      │      (`/`)      │          │ (`/editor/*`)   │          │  (`/history`)   │
      └─────────────────┘          └────────┬────────┘          └─────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
      ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
      │  CVForm (Left)  │          │LivePreview(Rgt) │          │  EditorStepper  │
      │ (Sections Tree) │          │ (Classic/Modern)│          │  (Stages 1 - 4) │
      └────────┬────────┘          └─────────────────┘          └─────────────────┘
               │
   ┌───────────┼───────────┬───────────┬───────────┐
   ▼           ▼           ▼           ▼           ▼
Personal   Education  Experience   Projects     Custom
Section     Section     Section     Section    Sections
```

---

## 4. Route & Page Catalog

| Route | File Location | Access | Description | State Connections |
| :--- | :--- | :---: | :--- | :--- |
| `/` | `src/app/page.tsx` | Public | High-conversion hero landing page, feature highlights, ATS score demo preview, FAQ accordion, CTA triggers. | `AuthContext` |
| `/editor` | `src/app/editor/page.tsx` | Public / Guest | Master dual-pane workspace: Form controls on left, real-time A4 preview on right, role autocomplete drawer. | `CVContext`, `useHistory` |
| `/editor/job-match` | `src/app/editor/job-match/page.tsx` | Public / Guest | Targeted job description ingestion panel, compact textarea, role keyword scanner, and match readiness indicator. | `CVContext` |
| `/editor/ats` | `src/app/editor/ats/page.tsx` | Public / Guest | Comprehensive 4-pillar ATS audit dashboard, circular score gauge, missing keyword recommendations, actionable findings. | `CVContext`, `useATSScoring` |
| `/editor/export` | `src/app/editor/export/page.tsx` | Public / Guest | Final export hub: Template selector (`classic-ats` vs. `modern-compact`), PDF download button, print layout trigger. | `CVContext`, `@react-pdf` |
| `/history` | `src/app/history/page.tsx` | Public / Guest | Snapshot timeline cards, version comparisons, word count metrics, ATS score badges, single-click snapshot restore. | `historyStore` |
| `/api/cvs/import` | `src/app/api/cvs/import/route.ts` | Public | Next.js route handler parsing uploaded `.pdf` or `.docx` resume files into structured CVData JSON. | Edge Parser |

---

## 5. Core Features & UI Subsystems

### 1. Split-Pane Synchronized WYSIWYG Editor
- **Dynamic Form Input:** Left pane hosts collapsible cards for **Personal Info**, **Education**, **Experience**, **Projects**, **Skills**, and dynamic **Custom Sections**.
- **Live Canvas Preview:** Right pane maintains real-time DOM representation with precise A4 dimensions (aspect ratio `210mm x 297mm`), selectable font styling, and zoom scaling (`80%` to `120%`).
- **Quick Jump Dropdown:** A floating navigation menu allows jump-scrolling straight to any section without manually scrolling through lengthy resumes.
- **Mobile Responsive Drawer:** On viewports `< 1024px`, the editor activates a toggle bar switching between `Form Input` and `Document Preview` tabs.

### 2. Google Gemini AI Enhancement Studio (`AIEnhanceModal.tsx`)
- **Trigger Points:** Purple sparkle button (`Sparkles`) on every bullet row.
- **Transformation Frameworks:**
  - **Google XYZ Formula:** *"Accomplished [X] as measured by [Y] by doing [Z]"*
  - **STAR Methodology:** *Situation, Task, Action, Result*
- **Visual Diff Comparison:** Displays the original bullet alongside AI-generated variations with highlighted metric tokens and power verbs.
- **One-Click Application:** Replaces or appends the chosen enhancement directly into the active resume item.

### 3. Role Autocomplete & Pre-Authored Starter Bullets
- **Role Search (`RoleAutocomplete.tsx`):** Instant dropdown searching across 17 technical tracks (e.g. *Full Stack Developer*, *Data Scientist*, *DevOps Engineer*, *Cybersecurity Analyst*).
- **Bullet Drawer (`TemplateBulletDrawer.tsx`):** Provides 51 pre-seeded action bullets categorized by skill (e.g., *Frontend Optimization*, *CI/CD Automation*, *Model Training*).
- **Direct Insertion:** Clicking `+ Insert` injects the pre-formatted STAR bullet into the active role item.

### 4. Custom Sections Engine (`CustomSection.tsx`)
- **Arbitrary Extensibility:** Users can click `+ Add Custom Section` to append arbitrary categories (e.g. *Leadership & Activities*, *Certifications & Licenses*, *Publications*, *Volunteering*).
- **Inline Renaming:** Title input field features an inline edit icon with an accent border (`border-sky-400`), allowing custom section renaming.
- **Full Relational Schema Support:** Each custom section contains generic `CVItem` entities with title, subtitle, dates, and nested `BulletPoint` objects with AI enhance capability.

### 5. Snapshot Version History & Restore (`historyStore.ts`)
- **Automated Versioning:** Saves named snapshots to `localStorage` on key events (manual save, export, ATS audit).
- **Snapshot Diagnostics:** Computes total document word count, section count, and ATS score per revision.
- **One-Click Restore:** Loads the selected snapshot into `CVContext` with toast confirmation, restoring previous drafts instantly.

---

## 6. State Management & Generic Relational Schema

The application uses an enterprise-grade React Context (`CVContext`) adhering to relational database constraints.

### TypeScript Schema (`src/types/cv.ts`):
```typescript
export interface BulletPoint {
  id: string;
  text: string;
  actionVerb?: string;
  hasMetric?: boolean;
  framework?: "STAR" | "XYZ" | "STANDARD";
  orderIndex: number;
}

export interface CVItem {
  id: string;
  title: string;       // Job Role, Degree, Project Name, or Award Title
  subtitle: string;    // Company, University, or Organization
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  url?: string;
  orderIndex: number;
  bulletPoints: BulletPoint[];
}

export interface CVSection {
  id: string;
  sectionType: "EXPERIENCE" | "EDUCATION" | "PROJECTS" | "SKILLS" | "CERTIFICATIONS" | "CUSTOM";
  title: string;
  orderIndex: number;
  isVisible: boolean;
  items: CVItem[];
}

export interface SkillGroup {
  id: string;
  categoryName: string; // e.g. "Languages & Frameworks", "Cloud & DevOps"
  skills: string[];
  orderIndex: number;
}

export interface CVData {
  id?: string;
  title: string;
  templateId: "classic-ats" | "modern-compact";
  targetRoleId?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    summary?: string;
  };
  sections: CVSection[];
  skillGroups: SkillGroup[];
}
```

### Context Dispatch Methods (`src/lib/store.tsx`):
- `updatePersonalInfo(fields)`: Updates contact details and career objective.
- `updateSectionItems(sectionType, items)`: Replaces item tree for a given core section.
- `addCustomSection(title)`: Appends a new user-defined custom section.
- `updateSectionTitle(sectionId, title)`: Renames section heading.
- `removeSection(sectionId)`: Deletes custom section.
- `updateSkillGroups(groups)`: Manages categorized skill sets.
- `loadCV(data)`: Hydrates full document state from API or history snapshot.

---

## 7. Design System & Dual-Theme Engine

The UI is built on a responsive, accessible design system supporting instant theme switching.

### Theme Comparison:

| Element | Slate-50 Clean Canvas (Default) | Slate-900 Command Center |
| :--- | :--- | :--- |
| **Page Background** | `#F8FAFC` (`bg-slate-50`) | `#0F172A` (`bg-slate-900`) |
| **Card Surfaces** | `#FFFFFF` with `border-slate-200/80` | `#1E293B` with `border-slate-800` |
| **Primary Typography** | `#0F172A` (`text-slate-900`) | `#F8FAFC` (`text-slate-100`) |
| **Muted Labels** | `#64748B` (`text-slate-500`) | `#94A3B8` (`text-slate-400`) |
| **Primary Accent** | Deep Sky Blue (`#0284C7` / `sky-600`) | Neon Sky Blue (`#38BDF8` / `sky-400`) |
| **AI Accent** | Violet Glow (`#7C3AED` / `violet-600`) | Purple Neon (`#A855F7` / `purple-400`) |
| **Preview Canvas** | Pure White Paper (`#FFFFFF`) with subtle shadow | Pure White Paper with glowing elevation ring |

### Design Tokens:
- **Font Stack:** Inter / System UI with high legibility across small print sizes (9pt–11pt).
- **Borders & Dividers:** Crisp 1px borders (`border-slate-200`, `border-sky-300`) without heavy rings.
- **Glassmorphism:** `backdrop-blur-md` used on sticky action bars and navigation headers.

---

## 8. ATS Diagnostic & Keyword Matching Interface

The `/editor/ats` route gives applicants transparency into automated screening systems.

### Scoring Pillars:
1. **Parsability (25 pts):**
   - Single-column standard flow
   - Section heading detection (`Education`, `Experience`, `Projects`, `Skills`)
   - Complete contact headers (valid email format, location, reachable phone)
2. **Impact & Metrics (30 pts):**
   - High-leverage power verbs detected at the beginning of bullet points (*Orchestrated, Accelerated, Architected*)
   - Quantifiable metrics detected (*%, $, numbers, user counts, latency reductions*)
3. **Skills Alignment (25 pts):**
   - Categorized skills count (minimum 8 technical competencies)
   - Real-time keyword overlap ratio against user-provided job descriptions
4. **Brevity & Layout (20 pts):**
   - Word count calibration (ideal: 450–700 words for university graduates)
   - Bullet density (3–5 bullets per experience item)

### Visual Feedback Components:
- **Circular Gauge (`ScoreGauge.tsx`):** SVG ring rendering score with dynamic color transition (Red `< 50`, Amber `50–74`, Emerald `≥ 75`).
- **Pillar Breakdown (`PillarBreakdown.tsx`):** Horizontal progress bars with individual point tallies and diagnostic descriptions.
- **Actionable Findings (`ActionableFindingsList.tsx`):** Categorized badges (`CRITICAL`, `RECOMMENDED`, `GOOD`) linking directly to the editor form fields that need revision.

---

## 9. PDF Generation & Template Architecture

PDFs are compiled on the client side using `@react-pdf/renderer` without requiring server round-trips.

### Template Designs:

#### 1. Classic ATS Template (`ClassicPdfDocument.tsx` & `ClassicAts.tsx`)
- **Layout:** Strictly single-column, top-to-bottom layout.
- **Font Hierarchy:** Serif / Clean Sans with horizontal divider rules (`border-b border-gray-900`).
- **ATS Compliance:** 100% parsable by legacy Taleo, Workday, and Greenhouse parsers.

#### 2. Modern Compact Template (`ModernPdfDocument.tsx` & `ModernCompact.tsx`)
- **Layout:** High-density header banner with soft slate accents.
- **Skill Pills:** Categorized competencies organized in tight, readable pill clusters.
- **Target Audience:** Tech startups, design-focused engineering roles, and portfolio submissions.

---

## 10. Local Development & Build Guide

### Prerequisites:
- Node.js 18+ or 20 (LTS)
- npm 9+ or pnpm 8+

### Setup & Run:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env.local
cp .env.example .env.local

# 4. Start Next.js development server
npm run dev
# Running on http://localhost:3000
```

### Production Build & Validation:
```bash
# Type check all TypeScript files
npx tsc --noEmit

# Compile Next.js production bundle
npm run build

# Start production server locally
npm run start
```

### Environment Configuration (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

*Report generated and validated for the CareerPrepster Frontend Module (`careerprepster-frontend@0.1.0`).*
