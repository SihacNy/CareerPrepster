# Data Model & Database Schema: 001-cv-editor

**Feature**: Module 1 - CV Editor, Resume Import & Universal ATS Scoring  
**Target Engine**: MySQL 8.0  
**ORM**: Prisma ORM (`prisma/schema.prisma`)  
**Date**: 2026-09-11 (Updated with Job Role Catalog & Bullet Library)  

---

## 1. Entity-Relationship Overview

The database consists of **8 relational tables** designed with foreign key constraints, cascading deletes, and optimized indexes, matching `report_backend.md` exactly:

```text
                      ┌──────────────┐
                      │    users     │
                      └──────┬───────┘
                             │ 1-to-many
                             ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  job_roles   │◄─────┤     cvs      │─────►│ ats_reports  │
└──────┬───────┘      └──────┬───────┘      └──────────────┘
       │ 1-to-many           │ 1-to-many
       ▼                     ▼
┌──────────────────┐  ┌──────────────┐      ┌──────────────┐
│role_bullet_templ.│  │ cv_sections  │      │ skill_groups │
└──────────────────┘  └──────┬───────┘      └──────────────┘
                             │ 1-to-many
                             ▼
                      ┌──────────────┐
                      │   cv_items   │
                      └──────┬───────┘
                             │ 1-to-many
                             ▼
                      ┌──────────────┐
                      │bullet_points │
                      └──────────────┘
```

---

## 1.1. Frontend State Architecture: Refactored `CVData` (Alternative 3)

To achieve **100% contract parity** and eliminate brittle adapter layers, the frontend state store (`frontend/src/lib/store.tsx`) is refactored from isolated section arrays (`education[]`, `experience[]`, `projects[]`) to the backend's generic `sections` and `skillGroups` model:

```typescript
export interface BulletPoint {
  id?: string;
  text: string;
  actionVerb?: string;
  hasMetric?: boolean;
  framework?: "STAR" | "XYZ" | "STANDARD";
  orderIndex?: number;
}

export interface CVItem {
  id?: string;
  title: string;       // Role Title, Degree, or Project Name
  subtitle?: string;   // Company, University, or Subtitle
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  url?: string;
  orderIndex?: number;
  bulletPoints: BulletPoint[];
}

export interface CVSection {
  id?: string;
  sectionType: "EXPERIENCE" | "EDUCATION" | "PROJECTS" | "CERTIFICATIONS" | "CUSTOM";
  title?: string;
  orderIndex?: number;
  isVisible?: boolean;
  items: CVItem[];
}

export interface SkillGroup {
  id?: string;
  categoryName: string;
  skills: string[];
}

export interface CVData {
  id?: string;
  title: string;
  templateId: string;
  targetRole?: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  sections: CVSection[];
  skillGroups: SkillGroup[];
  updatedAt?: string;
}
```

### Component Adaptation Strategy:
- **`EducationSection.tsx`**: Operates on `sections.find(s => s.sectionType === "EDUCATION")`, mapping `item.title` to Degree/Major, `item.subtitle` to Institution, and `item.bulletPoints` to achievements.
- **`ExperienceSection.tsx`**: Operates on `sections.find(s => s.sectionType === "EXPERIENCE")`, mapping `item.title` to Job Role, `item.subtitle` to Company, and `item.bulletPoints` to achievements.
- **`ProjectsSection.tsx`**: Operates on `sections.find(s => s.sectionType === "PROJECTS")`, mapping `item.title` to Project Name, `item.subtitle` to Tech Stack, and `item.url` to Repository/Demo.
- **`SkillsSection.tsx`**: Operates directly on `skillGroups` array (`categoryName` + `skills[]`).
- **Extensible Custom Sections**: Easily render and reorder any custom sections (`sectionType === "CUSTOM"` or `"CERTIFICATIONS"`).

---

## 2. Entities & Schema Definitions

### 2.1. `User`
Represents the authenticated student/job seeker account (authenticated via Google or GitHub OAuth).
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `email` (`VARCHAR(255)`, Unique, Indexed)
- `googleId` (`VARCHAR(100)`, Unique, Optional, Indexed)
- `githubId` (`VARCHAR(100)`, Unique, Optional, Indexed)
- `name` (`VARCHAR(150)`): Full name provided by OAuth profile
- `avatarUrl` (`VARCHAR(255)`, Optional)
- `createdAt` (`DATETIME(3)`, Default `NOW()`)
- `updatedAt` (`DATETIME(3)`, Auto-update)
- *Relations*:
  - `cvs` → `CV[]` (1:N)

---

### 2.2. `CV` (Resume Profile)
The primary resume document for a user.
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `userId` (`VARCHAR(36)`, Foreign Key → `User.id`, `ON DELETE CASCADE`)
- `title` (`VARCHAR(150)`): e.g., *"Software Engineer - New Grad 2026"*
- `templateId` (`VARCHAR(50)`): e.g., `"classic-ats"`, `"modern-compact"`, `"technical-standard"`
- `targetRoleId` (`VARCHAR(36)`, Optional): Foreign Key → `JobRole.id` if selected from catalog
- `targetRoleName` (`VARCHAR(150)`, Optional): Free-form or catalog job title
- `fullName` (`VARCHAR(150)`)
- `email` (`VARCHAR(255)`)
- `phone` (`VARCHAR(50)`, Optional)
- `location` (`VARCHAR(150)`, Optional): e.g., *"Seattle, WA"*
- `linkedinUrl` (`VARCHAR(255)`, Optional)
- `githubUrl` (`VARCHAR(255)`, Optional)
- `portfolioUrl` (`VARCHAR(255)`, Optional)
- `summary` (`TEXT`, Optional): Brief professional summary or career objective
- `isImported` (`BOOLEAN`, Default `false`): Tracks if CV originated from uploaded PDF/DOCX
- `isPrimary` (`BOOLEAN`, Default `false`)
- `createdAt` (`DATETIME(3)`, Default `NOW()`)
- `updatedAt` (`DATETIME(3)`, Auto-update)
- *Relations*:
  - `user` → `User`
  - `targetRole` → `JobRole?`
  - `sections` → `CVSection[]` (1:N, Ordered)
  - `atsReports` → `ATSReport[]` (1:N)

---

### 2.3. `CVSection`
A categorized section of the CV (Education, Experience, Projects, Skills, Certifications).
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `cvId` (`VARCHAR(36)`, Foreign Key → `CV.id`, `ON DELETE CASCADE`)
- `sectionType` (`ENUM('PERSONAL_INFO', 'EDUCATION', 'EXPERIENCE', 'PROJECT', 'SKILL', 'CERTIFICATION', 'CUSTOM')`)
- `title` (`VARCHAR(100)`): e.g., *"Education"*, *"Academic Projects"*
- `orderIndex` (`INT`, Default `0`): For drag-and-drop section ordering
- `isVisible` (`BOOLEAN`, Default `true`)
- `createdAt` (`DATETIME(3)`, Default `NOW()`)
- `updatedAt` (`DATETIME(3)`, Auto-update)
- *Relations*:
  - `items` → `CVItem[]` (1:N, Ordered)
  - `skillGroups` → `SkillGroup[]` (1:N)

---

### 2.4. `CVItem`
An individual entry inside a section (a university degree, a job role, or a project).
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `sectionId` (`VARCHAR(36)`, Foreign Key → `CVSection.id`, `ON DELETE CASCADE`)
- `title` (`VARCHAR(150)`): e.g., *"B.S. in Computer Science"*, *"Software Engineer Intern"*, *"CareerPrepster AI Platform"*
- `subtitle` (`VARCHAR(150)`, Optional): e.g., *"University of Washington"*, *"Amazon AWS"*
- `location` (`VARCHAR(100)`, Optional): e.g., *"Seattle, WA"*
- `startDate` (`VARCHAR(50)`, Optional): e.g., *"Sep 2022"*
- `endDate` (`VARCHAR(50)`, Optional): e.g., *"Jun 2026"* or *"Present"*
- `isCurrent` (`BOOLEAN`, Default `false`)
- `orderIndex` (`INT`, Default `0`)
- `createdAt` (`DATETIME(3)`, Default `NOW()`)
- `updatedAt` (`DATETIME(3)`, Auto-update)
- *Relations*:
  - `bulletPoints` → `BulletPoint[]` (1:N, Ordered)

---

### 2.5. `BulletPoint`
A single achievement bullet point within an experience or project entry.
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `itemId` (`VARCHAR(36)`, Foreign Key → `CVItem.id`, `ON DELETE CASCADE`)
- `content` (`TEXT`): The text statement
- `orderIndex` (`INT`, Default `0`)
- `isAiEnhanced` (`BOOLEAN`, Default `false`)
- `isTemplateImported` (`BOOLEAN`, Default `false`): Flag if sourced from starter bullet catalog
- `hasActionVerb` (`BOOLEAN`, Default `false`)
- `hasMetric` (`BOOLEAN`, Default `false`)
- `createdAt` (`DATETIME(3)`, Default `NOW()`)
- `updatedAt` (`DATETIME(3)`, Auto-update)

---

### 2.6. `SkillGroup`
Structured skill categorization (e.g. Languages, Frameworks, Developer Tools).
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `sectionId` (`VARCHAR(36)`, Foreign Key → `CVSection.id`, `ON DELETE CASCADE`)
- `categoryName` (`VARCHAR(100)`): e.g., *"Languages"*, *"Frameworks & Libraries"*, *"Databases & Cloud"*
- `skills` (`JSON`): Array of strings: `["TypeScript", "Python", "SQL"]`
- `orderIndex` (`INT`, Default `0`)

---

### 2.7. `JobRole` *(New: Seeded Catalog)*
A pre-seeded database record representing a standard graduate career role.
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `title` (`VARCHAR(100)`, Unique, Indexed): e.g., *"Frontend Developer"*, *"Backend Engineer"*, *"Data Analyst"*, *"Product Manager"*
- `industryTrack` (`VARCHAR(100)`): e.g., *"Software Engineering"*, *"Data & AI"*, *"Design"*, *"Business"*
- `description` (`TEXT`, Optional): Brief overview of role responsibilities
- `createdAt` (`DATETIME(3)`, Default `NOW()`)
- *Relations*:
  - `bulletTemplates` → `RoleBulletTemplate[]` (1:N)
  - `cvs` → `CV[]` (1:N)

---

### 2.8. `RoleBulletTemplate` *(New: Starter Bullet Library)*
Pre-curated, high-impact achievement bullet points associated with a specific `JobRole`.
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `roleId` (`VARCHAR(36)`, Foreign Key → `JobRole.id`, `ON DELETE CASCADE`)
- `skillCategory` (`VARCHAR(100)`): e.g., *"UI Performance"*, *"API Integration"*, *"State Management"*, *"Testing"*
- `bulletText` (`TEXT`): Pre-authored high-impact template bullet with action verb and metric slots
- `powerVerb` (`VARCHAR(50)`): e.g., *"Architected"*, *"Optimized"*, *"Implemented"*
- `framework` (`VARCHAR(10)`, Default `"XYZ"`): STAR or XYZ format
- `createdAt` (`DATETIME(3)`, Default `NOW()`)

---

### 2.9. `ATSReport`
Audit trail and scoring record for an ATS evaluation.
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `cvId` (`VARCHAR(36)`, Foreign Key → `CV.id`, `ON DELETE CASCADE`)
- `overallScore` (`INT`): 0 to 100
- `parsabilityScore` (`INT`): 0 to 25
- `impactScore` (`INT`): 0 to 30
- `skillsScore` (`INT`): 0 to 25
- `brevityScore` (`INT`): 0 to 20
- `targetJobDescription` (`TEXT`, Optional)
- `matchedKeywords` (`JSON`): Array of `{ keyword: string, frequency: number }`
- `missingKeywords` (`JSON`): Array of `{ keyword: string, priority: "HIGH" | "MEDIUM" }`
- `findings` (`JSON`): Array of `{ id: string, category: string, severity: "CRITICAL" | "SUGGESTION" | "PASSED", title: string, message: string, sectionRef?: string }`
- `createdAt` (`DATETIME(3)`, Default `NOW()`)

---

## 3. Complete Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  googleId  String?  @unique
  githubId  String?  @unique
  name      String   @db.VarChar(150)
  avatarUrl String?  @db.VarChar(255)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cvs       CV[]

  @@map("users")
}

model JobRole {
  id              String                @id @default(uuid())
  title           String                @unique @db.VarChar(100)
  industryTrack   String                @db.VarChar(100)
  description     String?               @db.Text
  createdAt       DateTime              @default(now())

  bulletTemplates RoleBulletTemplate[]
  cvs             CV[]

  @@index([title])
  @@map("job_roles")
}

model RoleBulletTemplate {
  id            String   @id @default(uuid())
  roleId        String
  skillCategory String   @db.VarChar(100)
  bulletText    String   @db.Text
  powerVerb     String   @db.VarChar(50)
  framework     String   @default("XYZ") @db.VarChar(10)
  createdAt     DateTime @default(now())

  role          JobRole  @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@index([roleId, skillCategory])
  @@map("role_bullet_templates")
}

model CV {
  id             String      @id @default(uuid())
  userId         String
  title          String      @db.VarChar(150)
  templateId     String      @default("classic-ats") @db.VarChar(50)
  targetRoleId   String?     @db.VarChar(36)
  targetRoleName String?     @db.VarChar(150)
  fullName       String      @db.VarChar(150)
  email          String      @db.VarChar(255)
  phone          String?     @db.VarChar(50)
  location       String?     @db.VarChar(150)
  linkedinUrl    String?     @db.VarChar(255)
  githubUrl      String?     @db.VarChar(255)
  portfolioUrl   String?     @db.VarChar(255)
  summary        String?     @db.Text
  isImported     Boolean     @default(false)
  isPrimary      Boolean     @default(false)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetRole     JobRole?    @relation(fields: [targetRoleId], references: [id], onDelete: SetNull)
  sections       CVSection[]
  skillGroups    SkillGroup[]
  atsReports     ATSReport[]

  @@index([userId])
  @@index([targetRoleId])
  @@map("cvs")
}

enum SectionType {
  PERSONAL_INFO
  EDUCATION
  EXPERIENCE
  PROJECT
  SKILL
  CERTIFICATION
  CUSTOM
}

model CVSection {
  id          String       @id @default(uuid())
  cvId        String
  sectionType SectionType  @default(CUSTOM)
  title       String       @db.VarChar(100)
  orderIndex  Int          @default(0)
  isVisible   Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  cv          CV           @relation(fields: [cvId], references: [id], onDelete: Cascade)
  items       CVItem[]

  @@index([cvId, orderIndex])
  @@map("cv_sections")
}

model CVItem {
  id           String        @id @default(uuid())
  sectionId    String
  title        String        @db.VarChar(150)
  subtitle     String?       @db.VarChar(150)
  location     String?       @db.VarChar(100)
  startDate    String?       @db.VarChar(50)
  endDate      String?       @db.VarChar(50)
  isCurrent    Boolean       @default(false)
  orderIndex   Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  section      CVSection     @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  bulletPoints BulletPoint[]

  @@index([sectionId, orderIndex])
  @@map("cv_items")
}

model BulletPoint {
  id                 String   @id @default(uuid())
  itemId             String
  content            String   @db.Text
  orderIndex         Int      @default(0)
  isAiEnhanced       Boolean  @default(false)
  isTemplateImported Boolean  @default(false)
  hasActionVerb      Boolean  @default(false)
  hasMetric          Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  item               CVItem   @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId, orderIndex])
  @@map("bullet_points")
}

model SkillGroup {
  id           String    @id @default(uuid())
  cvId         String
  categoryName String    @db.VarChar(100)
  skills       Json      // Array of skill strings: ["React", "Node.js", "TypeScript"]
  orderIndex   Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  cv           CV        @relation(fields: [cvId], references: [id], onDelete: Cascade)

  @@index([cvId, orderIndex])
  @@map("skill_groups")
}

model ATSReport {
  id                   String   @id @default(uuid())
  cvId                 String
  overallScore         Int
  parsabilityScore     Int
  impactScore          Int
  skillsScore          Int
  brevityScore         Int
  targetJobDescription String?  @db.Text
  matchedKeywords      Json     // Array of { keyword: string, frequency: number }
  missingKeywords      Json     // Array of { keyword: string, priority: string }
  findings             Json     // Array of categorized findings
  createdAt            DateTime @default(now())

  cv                   CV       @relation(fields: [cvId], references: [id], onDelete: Cascade)

  @@index([cvId, createdAt])
  @@map("ats_reports")
}
```

---

## 4. Template Catalog & Visual Theming Data Model

### 4.1. Template Entity Definition (`TemplateDefinition`)

```typescript
export type TemplateArchetype = "minimalist" | "color-accent" | "visual-photo";

export interface ColorPaletteOption {
  id: string;
  name: string;
  hex: string;
  contrastText: string; // "#ffffff" or "#0f172a"
}

export interface TemplateDefinition {
  id: string; // "classic" | "modern" | "executive-accent" | "modern-photo"
  name: string; // e.g. "Harvard Classic", "Executive Accent", "Modern Photo"
  subtitle: string;
  archetype: TemplateArchetype;
  badge?: string; // "MOST POPULAR", "TECH FAVORITE", "CREATIVE & INT'L", "EXECUTIVE"
  fontFamily: string; // e.g. "Merriweather", "Inter", "Plus Jakarta Sans"
  fontCategory: "serif" | "sans-serif";
  description: string;
  previewFeatures: string[];
  recommendedIndustries: string[];
  supportsPhoto: boolean;
  supportsColor: boolean;
  defaultColor: string; // Default hex e.g. "#0284c7"
  availablePalettes?: ColorPaletteOption[];
}
```

### 4.2. Curated Professional Color Palette Presets

| Palette ID | Name | Hex Code | Purpose / Best Suited For |
| :--- | :--- | :--- | :--- |
| `sky-blue` | Tech Sky | `#0284c7` | Technology, Startups, Web & Software |
| `exec-navy` | Executive Navy | `#1e3a8a` | Finance, Management, Corporate Consulting |
| `emerald-teal` | Forest Teal | `#0f766e` | Sustainability, Healthcare, Environmental |
| `slate-steel` | Slate Steel | `#334155` | Engineering, Data Science, Operations |
| `burgundy` | Classic Burgundy | `#881337` | Law, Academia, Executive Leadership |
| `royal-indigo`| Royal Indigo | `#4338ca` | Design, Marketing, Product Strategy |

### 4.3. Document State Extensions (`CVData`)

```typescript
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  summary?: string;
  photoUrl?: string; // Optional user avatar/headshot URL for photo-enabled templates
}

export interface CVData {
  id: string;
  title: string;
  templateId: string; // "classic" | "modern" | "executive-accent" | "modern-photo"
  accentColor?: string; // Hex color code e.g. "#0284c7"
  targetRole?: string;
  targetRoleId?: string;
  personalInfo: PersonalInfo;
  sections: CVSection[];
  skillGroups: SkillGroup[];
  updatedAt?: string;
  atsScore?: number;
}
```

### 4.4. MySQL & Prisma Backend Schema Extensions (`backend/prisma/schema.prisma`)

To store `photoUrl` (either base64 data URI up to 10MB or hosted URL) and user-chosen `accentColor` in MySQL:

```prisma
model CV {
  id           String        @id @default(uuid())
  userId       String
  title        String        @default("Untitled CV") @db.VarChar(150)
  templateId   String        @default("classic-ats") @db.VarChar(50)
  accentColor  String?       @default("#0284c7") @db.VarChar(30)
  targetRoleId String?
  targetRole   JobRole?      @relation(fields: [targetRoleId], references: [id], onDelete: SetNull)

  // Personal / Header Info
  fullName     String        @db.VarChar(100)
  email        String        @db.VarChar(150)
  phone        String?       @db.VarChar(50)
  location     String?       @db.VarChar(100)
  websiteUrl   String?       @db.VarChar(255)
  linkedinUrl  String?       @db.VarChar(255)
  githubUrl    String?       @db.VarChar(255)
  photoUrl     String?       @db.MediumText // MediumText supports up to 16MB (required for <= 10MB base64 images)
  summary      String?       @db.Text
  ...
}
```

- **Prisma Generator target**: Binary targets must remain `["native", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]` for Docker/Alpine compatibility.
- **Migration**: Run `npx prisma db push && npx prisma generate` in `backend/`.


