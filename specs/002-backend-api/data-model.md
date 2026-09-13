# Data Model & Database Architecture: Module 2 - Backend API

**Branch**: `module/backend-api` | **Date**: 2026-09-12 | **Status**: Complete

---

## 1. Entity-Relationship Diagram (ERD)

```text
┌─────────────────┐       1:N       ┌─────────────────┐       1:N       ┌─────────────────┐
│      User       ├────────────────►│       CV        ├────────────────►│    CVSection    │
│                 │                 │                 │                 │                 │
│ id (UUID) PK    │                 │ id (UUID) PK    │                 │ id (UUID) PK    │
│ email           │                 │ userId (FK)     │                 │ cvId (FK)       │
│ passwordHash    │                 │ title           │                 │ sectionType     │
│ name            │                 │ templateId      │                 │ customTitle     │
│ createdAt       │                 │ targetRoleId(FK)│                 │ orderIndex      │
│ updatedAt       │                 │ fullName        │                 │ isVisible       │
└────────┬────────┘                 │ email, phone    │                 └────────┬────────┘
         │                          │ location, links │                          │
         │                          │ summary         │                          │ 1:N
         │                          │ createdAt       │                          ▼
         │ 1:N                      │ updatedAt       │                 ┌─────────────────┐
         ▼                          └────────┬────────┘                 │     CVItem      │
┌─────────────────┐                          │                          │                 │
│    ATSReport    │◄─────────────────────────┘ 1:N                      │ id (UUID) PK    │
│                 │                                                     │ sectionId (FK)  │
│ id (UUID) PK    │                                                     │ title, subtitle │
│ cvId (FK)       │                 ┌─────────────────┐                 │ location        │
│ userId (FK)     │                 │   SkillGroup    │                 │ startDate       │
│ overallScore    │                 │                 │                 │ endDate         │
│ parsabilityScore│                 │ id (UUID) PK    │                 │ isCurrent       │
│ impactScore     │                 │ cvId (FK)       │                 │ orderIndex      │
│ skillsScore     │                 │ categoryName    │                 └────────┬────────┘
│ brevityScore    │                 │ skills (JSON)   │                          │
│ findings (JSON) │                 │ orderIndex      │                          │ 1:N
│ targetJobDesc   │                 └─────────────────┘                          ▼
│ createdAt       │                                                     ┌─────────────────┐
└─────────────────┘                                                     │   BulletPoint   │
                                                                        │                 │
┌─────────────────┐       1:N       ┌────────────────────────┐          │ id (UUID) PK    │
│     JobRole     ├────────────────►│   RoleBulletTemplate   │          │ itemId (FK)     │
│                 │                 │                        │          │ text            │
│ id (UUID) PK    │                 │ id (UUID) PK           │          │ actionVerb      │
│ title           │                 │ jobRoleId (FK)         │          │ hasMetric (bool)│
│ industry        │                 │ bulletText             │          │ framework       │
│ description     │                 │ powerVerb              │          │ orderIndex      │
│ skills (JSON)   │                 │ skillCategory          │          └─────────────────┘
│ isActive (bool) │                 │ framework (STAR/XYZ)   │
└─────────────────┘                 └────────────────────────┘
```

---

## 2. Complete Prisma Schema Definition (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// 1. USER & AUTHENTICATION
// ==========================================
model User {
  id           String      @id @default(uuid())
  email        String      @unique
  passwordHash String      @db.VarChar(255)
  name         String?     @db.VarChar(100)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  cvs          CV[]
  atsReports   ATSReport[]

  @@map("users")
}

// ==========================================
// 2. CV DOCUMENT ROOT
// ==========================================
model CV {
  id           String        @id @default(uuid())
  userId       String
  title        String        @default("Untitled CV") @db.VarChar(150)
  templateId   String        @default("classic-ats") @db.VarChar(50)
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
  summary      String?       @db.Text

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections     CVSection[]
  skillGroups  SkillGroup[]
  atsReports   ATSReport[]

  @@index([userId])
  @@index([userId, createdAt])
  @@map("cvs")
}

// ==========================================
// 3. CV SECTIONS
// ==========================================
enum SectionType {
  EXPERIENCE
  EDUCATION
  PROJECTS
  SKILLS
  CERTIFICATIONS
  CUSTOM
}

model CVSection {
  id          String      @id @default(uuid())
  cvId        String
  sectionType SectionType
  customTitle String?     @db.VarChar(100)
  orderIndex  Int         @default(0)
  isVisible   Boolean     @default(true)

  cv          CV          @relation(fields: [cvId], references: [id], onDelete: Cascade)
  items       CVItem[]

  @@index([cvId])
  @@index([cvId, orderIndex])
  @@map("cv_sections")
}

// ==========================================
// 4. CV SECTION ITEMS (Experiences, Degrees, Projects)
// ==========================================
model CVItem {
  id          String        @id @default(uuid())
  sectionId   String
  title       String        @db.VarChar(150) // Role title, Degree name, or Project name
  subtitle    String?       @db.VarChar(150) // Company, University, or Subtitle
  location    String?       @db.VarChar(100)
  startDate   String?       @db.VarChar(20)  // "2022-09" or "Sep 2022"
  endDate     String?       @db.VarChar(20)  // "2024-05" or "Present"
  isCurrent   Boolean       @default(false)
  url         String?       @db.VarChar(255) // Project live link or GitHub repo
  orderIndex  Int           @default(0)

  section     CVSection     @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  bulletPoints BulletPoint[]

  @@index([sectionId])
  @@index([sectionId, orderIndex])
  @@map("cv_items")
}

// ==========================================
// 5. BULLET POINTS
// ==========================================
enum BulletFramework {
  STAR
  XYZ
  STANDARD
}

model BulletPoint {
  id         String          @id @default(uuid())
  itemId     String
  text       String          @db.Text
  actionVerb String?         @db.VarChar(50)
  hasMetric  Boolean         @default(false)
  framework  BulletFramework @default(STANDARD)
  orderIndex Int             @default(0)

  item       CVItem          @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId])
  @@index([itemId, orderIndex])
  @@map("bullet_points")
}

// ==========================================
// 6. CATEGORIZED SKILL GROUPS
// ==========================================
model SkillGroup {
  id           String   @id @default(uuid())
  cvId         String
  categoryName String   @db.VarChar(100) // e.g., "Languages", "Frameworks & Libraries", "Developer Tools"
  skills       Json     // Array of strings: ["TypeScript", "Python", "SQL"]
  orderIndex   Int      @default(0)

  cv           CV       @relation(fields: [cvId], references: [id], onDelete: Cascade)

  @@index([cvId])
  @@map("skill_groups")
}

// ==========================================
// 7. ATS AUDIT REPORTS
// ==========================================
model ATSReport {
  id               String   @id @default(uuid())
  cvId             String
  userId           String
  overallScore     Int      // 0 - 100
  parsabilityScore Int      // 0 - 25
  impactScore      Int      // 0 - 30
  skillsScore      Int      // 0 - 25
  brevityScore     Int      // 0 - 20
  findings         Json     // Array of finding objects with { pillar, severity, title, message, remediation }
  targetJobDesc    String?  @db.Text
  matchPercentage  Int?     // 0 - 100 (when target JD is provided)
  createdAt        DateTime @default(now())

  cv               CV       @relation(fields: [cvId], references: [id], onDelete: Cascade)
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([cvId])
  @@index([userId])
  @@map("ats_reports")
}

// ==========================================
// 8. JOB ROLE CATALOG & PRE-AUTHORED STARTER BULLETS
// ==========================================
model JobRole {
  id          String               @id @default(uuid())
  title       String               @unique @db.VarChar(100)
  industry    String               @db.VarChar(100)
  description String?              @db.Text
  skills      Json                 // Array of recommended keywords: ["React", "TypeScript", "Node.js", "Jest"]
  isActive    Boolean              @default(true)

  bullets     RoleBulletTemplate[]
  cvs         CV[]

  @@index([title])
  @@index([industry])
  @@map("job_roles")
}

model RoleBulletTemplate {
  id            String          @id @default(uuid())
  jobRoleId     String
  bulletText    String          @db.Text
  powerVerb     String          @db.VarChar(50)
  skillCategory String          @db.VarChar(100) // e.g., "Frontend Architecture", "API Integration"
  framework     BulletFramework @default(XYZ)

  jobRole       JobRole         @relation(fields: [jobRoleId], references: [id], onDelete: Cascade)

  @@index([jobRoleId])
  @@index([jobRoleId, skillCategory])
  @@map("role_bullet_templates")
}
```

---

## 3. Seed Catalog Breakdown (15+ Graduate Roles)

The database seed (`prisma/seed.ts`) populates 15+ high-demand graduate job roles with 50+ pre-curated starter bullets across 4 primary industries:

| Industry | Job Roles Seeded | Target Starter Bullets |
| :--- | :--- | :--- |
| **Software Engineering** | Frontend Developer, Backend Developer, Full Stack Engineer, Mobile App Developer (React Native/Flutter), DevOps & Cloud Engineer, QA Automation Engineer | 24 bullets (XYZ framework with metrics) |
| **Data & AI** | Data Analyst, Data Engineer, Machine Learning Engineer, Business Intelligence Analyst | 16 bullets (metrics on data pipelines, dashboards, models) |
| **Product & Design** | UI/UX Designer, Product Manager (Associate), Technical Project Coordinator | 12 bullets (user metrics, sprint throughput, adoption) |
| **IT & Security** | Cybersecurity Analyst, Cloud Infrastructure Administrator, IT Systems Engineer | 12 bullets (uptime SLA, vulnerability remediation, patching) |

---

## 4. Prisma Atomic Transaction Strategy for CV Updates

When saving a modified CV, the frontend submits the complete nested CV structure. The backend executes an atomic `$transaction` that:
1. Updates root personal info on the `CV` table.
2. Synchronizes sections (updates existing by `id`, creates new sections, deletes sections absent from the payload).
3. Synchronizes items within each section (updates by `id`, creates new items, deletes removed items).
4. Synchronizes bullets within each item (updates by `id`, creates new bullets, deletes removed bullets).
5. Synchronizes skill groups (replaces or upserts skill arrays).

This prevents orphaned rows and partial writes on network interruption.
