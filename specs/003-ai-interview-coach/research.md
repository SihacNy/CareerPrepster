# Research & Technical Decisions: 003-ai-interview-coach

**Feature**: Module 3 - AI Interview Coach & Mock Drill Simulation  
**Date**: 2026-09-16  
**Status**: Completed  

---

## 1. Multi-Turn Conversational AI Architecture & Session State

### Decision: Stateless LLM Invocations with Database-Backed Context Aggregation
- **Rationale**:
  - **Environment Parity & Scalability**: In accordance with Constitution Principle 1 & 5, application containers must remain stateless. Storing conversational history in-memory (e.g. Node process memory or WebSocket socket sessions) would fail upon container restart or load-balanced scaling.
  - **Database as Source of Truth**: All generated questions, user responses, and turn-by-turn evaluations are persisted immediately in MySQL via Prisma. When a new turn or evaluation request arrives at `POST /api/interviews/sessions/:id/responses`, the Express backend loads the active session tree (`session -> questions -> responses`), constructs a clean, formatted multi-turn prompt payload, and dispatches it to Google Gemini 1.5 Flash.
  - **Resilience & Interruptibility**: If a user refreshes their browser, closes a tab, or experiences a network dropout, zero conversation state is lost. The session resumes instantly from `currentQuestionIndex`.
- **Alternatives Considered**:
  - *Stateful WebSocket Server with in-memory sessions*: High complexity, state loss during container recycling, requires sticky sessions and complex reconnection logic.
  - *Client-side context management (frontend passes entire history)*: High security and cheating risk; user can tamper with past ratings, prompts, or questions.

---

## 2. Adaptive Probing Logic & STAR Evaluation Framework

### Decision: Dual-Outcome Turn Orchestration via Gemini Structured Output (`type: "PROBE" | "EVALUATION"`)
- **Rationale**:
  - **Realistic Interview Simulation**: Real recruiters do not immediately grade and jump to the next topic if a candidate's answer is promising but vague. If a candidate says "I built a dashboard that improved efficiency", an authentic interviewer asks: "What specific tech stack did you use, and how did you measure that efficiency improvement?"
  - **Controlled Probing Rules**:
    1. Maximum 1 follow-up probe per primary question to keep interview sessions within their target duration (FR-009).
    2. The backend passes `allowProbe: isPrimary && !hasProbedForThisQuestion` to the LLM orchestration pipeline.
    3. If `allowProbe` is true AND the candidate's response misses key STAR elements (Action or Result is missing or vague), Gemini returns a structured probe response:
       ```json
       {
         "type": "PROBE",
         "probeQuestion": "Could you elaborate on the specific tools and algorithms you utilized, and what percentage latency dropped?",
         "probingCategory": "Action & Impact Quantification"
       }
       ```
    4. If the response already contains concrete actions/metrics OR `allowProbe` is false, Gemini returns a structured evaluation containing STAR sub-scores (1–5), strengths, gaps, and an enhanced model answer.
  - **Deterministic Guardrails**: Zod schema validation enforces the output structure before persisting to MySQL or returning to the client.
- **Alternatives Considered**:
  - *Always asking a fixed follow-up question*: Frustrates candidates who already provided exhaustive, well-structured STAR responses.
  - *Unbounded open-ended probing*: Causes session duration to explode and risks derailment.

---

## 3. Speech-to-Text & Audio Dictation Strategy

### Decision: Client-Side Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with Seamless Text Fallback
- **Rationale**:
  - **Zero Backend Audio Latency & Bandwidth**: Processing streaming audio on the Express server requires heavy media codecs, binary uploads, and high bandwidth costs. The native browser Web Speech API provides real-time, on-device or native OS transcription with zero server load.
  - **Instant Live Transcription**: Candidate words stream into the text area in real-time as they speak, giving immediate visual feedback and allowing manual text corrections before submission.
  - **Universal Fallback**: If a browser lacks speech recognition support (or the candidate denies microphone access), the UI displays a subtle badge indicating keyboard mode and seamlessly enables the rich text editor without breaking user flow.
- **Alternatives Considered**:
  - *Server-side transcription via Whisper / Gemini Multimodal Audio*: Introduces significant round-trip upload latency (3–8s for audio files), high token/API billing costs, and heavy memory usage in Express.
  - *Third-party cloud STT SDKs (e.g. Deepgram, AssemblyAI)*: Adds vendor lock-in, recurring external API bills, and additional client bundle size.

---

## 4. Contextual CV Ingestion & PII Protection

### Decision: Sanitized CV Projection Pipeline
- **Rationale**:
  - **Constitution Alignment (Principle 3 & 4)**: The Interview Coach must ingest validated CV data as contextual baseline without leaking Personally Identifiable Information (PII) to external LLM calls.
  - **Sanitization Strategy**: When constructing the interviewer prompt from a selected `CV`, the backend extracts:
    - Target Role & Summary
    - Work Experience (company name, role title, duration, bullet points)
    - Projects (title, tools/technologies, bullet points)
    - Education (degree, university, graduation year)
    - Skills (categorized skill groups)
    - **PII Stripped**: Candidate full legal name is replaced with "Candidate", phone number, residential address, personal website, and social links are strictly excluded from the prompt payload.
  - **Non-CV Fallback**: If the student does not link a CV, the backend constructs the interviewer persona purely from `targetRole` and `jobDescription`, pulling standard industry competencies from the pre-seeded `JobRole` catalog.
- **Alternatives Considered**:
  - *Passing raw CV PDF or full JSON dump*: Leaks student contact PII and wastes LLM context tokens on irrelevant layout coordinates or header details.

---

## 5. End-of-Session Scorecard & Actionable CV Recommendations

### Decision: Two-Stage Scoring (Granular Turn Ratings + Holistic Scorecard Synthesis)
- **Rationale**:
  - **Granular Turn Scoring**: Each answered question receives structured rubric evaluation: Situation (1–5), Task (1–5), Action (1–5), Result (1–5), Impact (1–5), and Clarity (1–5).
  - **Holistic Scorecard Synthesis**: At session completion, the backend passes all turn summaries, average competency ratings, and the original CV bullet points to Gemini.
  - **Cross-Referenced CV Bullet Suggestions**: Gemini specifically pinpoints CV bullet points that sounded weak or unsupported during the interview dialogue and suggests concrete revisions (e.g., adding the quantitative metric the student mentioned during questioning directly to their CV bullet).
  - **Standardized Readiness Tiers**:
    - `90–100`: "Interview Ready - Exceptional STAR Delivery"
    - `75–89`: "Solid Foundation - Minor Refinements Needed"
    - `60–74`: "Developing - Focus on Quantifiable Results"
    - `< 60`: "Needs Practice - Revisit STAR Framework & Project Details"
- **Alternatives Considered**:
  - *Heuristic rule-based averaging without AI synthesis*: Misses nuanced conversational insights and cannot generate cross-referenced CV bullet recommendations.
