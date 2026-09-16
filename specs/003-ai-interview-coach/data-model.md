# Data Model & Database Schema: 003-ai-interview-coach

**Feature**: Module 3 - AI Interview Coach & Mock Drill Simulation  
**Target Engine**: MySQL 8.0  
**ORM**: Prisma ORM (`backend/prisma/schema.prisma`)  
**Date**: 2026-09-16  

---

## 1. Entity-Relationship Diagram

Module 3 integrates seamlessly into the existing relational database architecture by connecting to `User`, `CV`, and `JobRole`. All interview questions, responses, turn evaluations, and final scorecards are persisted in five relational tables with foreign keys and cascading deletes:

```text
       ┌──────────────┐
       │    users     │
       └──────┬───────┘
              │ 1-to-many
              ▼
       ┌──────────────┐◄─────── [Optional CV Context] ──────── ┌──────────────┐
       │  interview_  │                                       │     cvs      │
       │   sessions   │◄─────── [Optional Role Seed] ───────── ├──────────────┤
       └──────┬───────┘                                       │  job_roles   │
              │ 1-to-many                                     └──────────────┘
              ▼
       ┌──────────────┐
       │  interview_  │
       │  questions   │
       └──────┬───────┘
              │ 1-to-many
              ▼
       ┌──────────────┐
       │  interview_  │
       │  responses   │
       └──────┬───────┘
              │ 1-to-1
              ▼
       ┌──────────────┐
       │turn_feedback │
       └──────────────┘

       ┌──────────────┐
       │  interview_  │
       │   sessions   │
       └──────┬───────┘
              │ 1-to-1
              ▼
       ┌──────────────┐
       │  interview_  │
       │  scorecards  │
       └──────────────┘
```

---

## 2. Prisma Schema Extensions (`backend/prisma/schema.prisma`)

```prisma
// ==========================================
// 9. AI INTERVIEW COACH & DRILLS
// ==========================================

enum InterviewTrack {
  BEHAVIORAL
  TECHNICAL
  MIXED
}

enum SessionLength {
  QUICK      // 3 questions (~10 min)
  STANDARD   // 5 questions (~20 min)
  FULL       // 8 questions (~35 min)
}

enum PracticeMode {
  INSTANT_FEEDBACK  // Turn-by-turn STAR critique immediately after submission
  EXAM              // Continuous interview, full evaluation delivered at scorecard
}

enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

enum InputModality {
  TEXT
  VOICE
}

model InterviewSession {
  id                   String              @id @default(uuid())
  userId               String
  cvId                 String?
  targetRoleId         String?
  targetRoleTitle      String              @db.VarChar(100)
  jobDescription       String?             @db.Text
  track                InterviewTrack      @default(BEHAVIORAL)
  sessionLength        SessionLength       @default(STANDARD)
  mode                 PracticeMode        @default(INSTANT_FEEDBACK)
  status               SessionStatus       @default(IN_PROGRESS)
  currentQuestionIndex Int                 @default(1)
  overallScore         Int?                // 0 - 100 upon completion
  startedAt            DateTime            @default(now())
  completedAt          DateTime?

  user                 User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  cv                   CV?                 @relation(fields: [cvId], references: [id], onDelete: SetNull)
  targetRole           JobRole?            @relation(fields: [targetRoleId], references: [id], onDelete: SetNull)
  questions            InterviewQuestion[]
  scorecard            InterviewScorecard?

  @@index([userId])
  @@index([userId, status])
  @@index([userId, startedAt])
  @@map("interview_sessions")
}

model InterviewQuestion {
  id               String              @id @default(uuid())
  sessionId        String
  questionIndex    Int                 // 1 to N
  questionText     String              @db.Text
  competency       String              @db.VarChar(100) // e.g., "Conflict Resolution", "System Design"
  contextReference String?             @db.VarChar(255) // e.g., "Capstone Project: AI Search Engine"
  isProbe          Boolean             @default(false)  // true if adaptive follow-up
  parentQuestionId String?             @db.VarChar(36)  // references primary question if probe
  createdAt        DateTime            @default(now())

  session          InterviewSession    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  responses        InterviewResponse[]

  @@index([sessionId])
  @@index([sessionId, questionIndex])
  @@map("interview_questions")
}

model InterviewResponse {
  id              String             @id @default(uuid())
  questionId      String
  responseText    String             @db.Text
  inputModality   InputModality      @default(TEXT)
  durationSeconds Int                @default(0)
  wordCount       Int                @default(0)
  createdAt       DateTime           @default(now())

  question        InterviewQuestion  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  feedback        TurnFeedback?

  @@index([questionId])
  @@map("interview_responses")
}

model TurnFeedback {
  id                  String            @id @default(uuid())
  responseId          String            @unique
  starSituationScore  Int               // 1 - 5
  starSituationNotes  String?           @db.Text
  starTaskScore       Int               // 1 - 5
  starTaskNotes       String?           @db.Text
  starActionScore     Int               // 1 - 5
  starActionNotes     String?           @db.Text
  starResultScore     Int               // 1 - 5
  starResultNotes     String?           @db.Text
  impactScore         Int               // 1 - 5
  clarityScore        Int               // 1 - 5
  powerVerbsUsed      Json              // Array of strings: ["Engineered", "Optimized"]
  strengths           Json              // Array of strings
  improvements        Json              // Array of strings
  modelAnswer         String            @db.Text
  createdAt           DateTime          @default(now())

  response            InterviewResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)

  @@map("turn_feedback")
}

model InterviewScorecard {
  id                 String           @id @default(uuid())
  sessionId          String           @unique
  overallScore       Int              // 0 - 100
  readinessTier      String           @db.VarChar(60) // "Interview Ready", "Solid Foundation", etc.
  starScore          Int              // 0 - 100
  technicalScore     Int              // 0 - 100
  communicationScore Int              // 0 - 100
  impactScore        Int              // 0 - 100
  keyStrengths       Json             // Array of strings
  keyGrowthAreas     Json             // Array of strings
  cvRecommendations  Json             // Array of { cvItemId, bulletPointId, originalText, recommendation, reason }
  createdAt          DateTime         @default(now())

  session            InterviewSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("interview_scorecards")
}
```

---

## 3. Existing Model Relation Updates

To link `InterviewSession` to existing tables in `schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  interviewSessions InterviewSession[]
}

model CV {
  // ... existing fields ...
  interviewSessions InterviewSession[]
}

model JobRole {
  // ... existing fields ...
  interviewSessions InterviewSession[]
}
```

---

## 4. Frontend & Shared TypeScript Interfaces

```typescript
// Shared Types: shared/src/types/interview.ts

export type InterviewTrack = 'BEHAVIORAL' | 'TECHNICAL' | 'MIXED';
export type SessionLength = 'QUICK' | 'STANDARD' | 'FULL';
export type PracticeMode = 'INSTANT_FEEDBACK' | 'EXAM';
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type InputModality = 'TEXT' | 'VOICE';

export interface TurnFeedbackData {
  id: string;
  responseId: string;
  starSituationScore: number;
  starSituationNotes?: string;
  starTaskScore: number;
  starTaskNotes?: string;
  starActionScore: number;
  starActionNotes?: string;
  starResultScore: number;
  starResultNotes?: string;
  impactScore: number;
  clarityScore: number;
  powerVerbsUsed: string[];
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export interface InterviewResponseData {
  id: string;
  questionId: string;
  responseText: string;
  inputModality: InputModality;
  durationSeconds: number;
  wordCount: number;
  createdAt: string;
  feedback?: TurnFeedbackData;
}

export interface InterviewQuestionData {
  id: string;
  sessionId: string;
  questionIndex: number;
  questionText: string;
  competency: string;
  contextReference?: string;
  isProbe: boolean;
  parentQuestionId?: string;
  responses: InterviewResponseData[];
}

export interface CVRecommendation {
  cvItemId?: string;
  bulletPointId?: string;
  originalText?: string;
  recommendation: string;
  reason: string;
}

export interface InterviewScorecardData {
  id: string;
  sessionId: string;
  overallScore: number;
  readinessTier: string;
  starScore: number;
  technicalScore: number;
  communicationScore: number;
  impactScore: number;
  keyStrengths: string[];
  keyGrowthAreas: string[];
  cvRecommendations: CVRecommendation[];
  createdAt: string;
}

export interface InterviewSessionData {
  id: string;
  userId: string;
  cvId?: string;
  targetRoleId?: string;
  targetRoleTitle: string;
  jobDescription?: string;
  track: InterviewTrack;
  sessionLength: SessionLength;
  mode: PracticeMode;
  status: SessionStatus;
  currentQuestionIndex: number;
  overallScore?: number;
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestionData[];
  scorecard?: InterviewScorecardData;
}
```
