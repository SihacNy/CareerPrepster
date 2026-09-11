# Data Model & Database Schema: 001-cv-editor

**Feature**: Module 1 - CV Editor, Resume Import & Universal ATS Scoring  
**Target Engine**: MySQL 8.0  
**ORM**: Prisma ORM (`prisma/schema.prisma`)  
**Date**: 2026-09-11 (Updated with Job Role Catalog & Bullet Library)  

---

## 1. Entity-Relationship Overview

```text
┌─────────────────┐       1:N       ┌─────────────────┐       1:N       ┌─────────────────┐
│      User       ├────────────────►│       CV        ├────────────────►│    CVSection    │
└─────────────────┘                 └────────┬────────┘                 └────────┬────────┘
                                             │                                   │ 1:N
                                             │ 1:N                               ▼
                                             │                          ┌─────────────────┐
                                             │                          │     CVItem      │
                                             │                          └────────┬────────┘
                                             │                                   │ 1:N
                                             │ 1:N                               ▼
                                             │                          ┌─────────────────┐
                                             ▼                          │   BulletPoint   │
                                    ┌─────────────────┐                 └─────────────────┘
                                    │    ATSReport    │
                                    └─────────────────┘

┌─────────────────┐       1:N       ┌───────────────────────┐
│     JobRole     ├────────────────►│  RoleBulletTemplate   │
│ (Seeded Catalog)│                 │ (Curated ATS Bullets) │
└─────────────────┘                 └───────────────────────┘
```

---

## 2. Entities & Schema Definitions

### 2.1. `User`
Represents the authenticated student/job seeker account.
- `id` (`VARCHAR(36)`, Primary Key, UUID)
- `email` (`VARCHAR(255)`, Unique, Indexed)
- `passwordHash` (`VARCHAR(255)`)
- `firstName` (`VARCHAR(100)`)
- `lastName` (`VARCHAR(100)`)
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
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  cvs          CV[]

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
  skillGroups SkillGroup[]

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
  sectionId    String
  categoryName String    @db.VarChar(100)
  skills       Json      // Array of skill strings: ["React", "Node.js", "TypeScript"]
  orderIndex   Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  section      CVSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@index([sectionId, orderIndex])
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
