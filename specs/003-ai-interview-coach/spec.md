# Feature Specification: Module 3 - AI Interview Coach & Mock Drill Simulation

**Feature Branch**: `module/ai-interview-coach`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "add feature ai interview caoch"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contextual Session Setup & CV Ingestion (Priority: P1)

As a graduating university student, I want to launch an interview practice session by selecting one of my existing CVs (or specifying a target job role and optional job description) and choosing an interview track, session length, and practice mode, so that the interview simulation asks realistic questions directly tied to my background and career goals.

**Why this priority**: Without session setup and contextual baseline ingestion, the interview simulation cannot generate personalized, relevant questions tailored to the student's claimed experiences.

**Independent Test**: Can be tested by navigating to the Interview Coach setup screen, selecting a saved CV profile, selecting a target role (e.g., "Junior Software Engineer"), picking "Behavioral (STAR Method)" with a 3-question drill in "Instant Feedback" mode, and verifying that the session initializes with customized questions referencing projects and skills extracted from the CV.

**Acceptance Scenarios**:

1. **Given** an authenticated student on the Interview Coach screen, **When** they initiate a new session, **Then** the system displays options to select a saved CV from their account or proceed by entering a target job role and optional job description.
2. **Given** a selected CV, **When** the student configures the session, **Then** they can choose an **Interview Track** (Behavioral / STAR, Technical & Project Deep-Dive, or Mixed Situational), a **Session Length** (Quick Drill: 3 questions, Standard Practice: 5 questions, Full Mock: 8 questions), and a **Practice Mode** (Instant Feedback after each answer, or Exam Mode with full evaluation at the end).
3. **Given** completed configuration options, **When** the student clicks "Start Interview", **Then** the system validates all selections, initializes an active interview session, and presents the first interview question tailored to the student's CV experiences and chosen role within 4 seconds.
4. **Given** a student without an existing CV, **When** they provide a target role and paste a job description, **Then** the system successfully initializes an interview session tailored to the job description expectations.

---

### User Story 2 - Interactive Conversational Interview Drill & Adaptive Probing (Priority: P1)

As a student participating in an active interview session, I want the AI Interview Coach to deliver questions one at a time, accept my spoken or typed response, maintain realistic conversational context, and ask targeted follow-up probing questions if my answer lacks critical details, so that I experience the depth and realism of an actual interview.

**Why this priority**: Real interviews are dynamic, multi-turn dialogues where interviewers probe vague or incomplete answers. Static one-and-done question forms fail to train students for real interview scrutiny.

**Independent Test**: Can be tested by starting a session, receiving Question 1, submitting a brief or high-level answer lacking measurable impact, and verifying that the AI Interview Coach asks an intelligent follow-up question specifically probing for the student's personal contribution and quantifiable results before proceeding to Question 2.

**Acceptance Scenarios**:

1. **Given** an active interview session, **When** a question is displayed, **Then** the student can provide their answer via a rich text input area or by toggling voice-to-text dictation.
2. **Given** a question with an active pacing timer, **When** the student speaks or types, **Then** the interface displays an elapsed time indicator and word count to help the student manage their speaking or response pace.
3. **Given** a student submits an answer lacking concrete actions or measurable outcomes, **When** the AI evaluates the response, **Then** the system generates one targeted follow-up probing question (e.g., "What specific tools did you use to achieve that result?", "How did your team measure success?") to encourage elaboration.
4. **Given** a student provides a comprehensive response or completes the follow-up probe, **When** they submit, **Then** the system acknowledges the response and advances to the next scheduled interview question.
5. **Given** an in-progress session, **When** the student needs to pause or exit, **Then** the system automatically saves the session progress so the student can resume later without losing their answers.

---

### User Story 3 - Turn-by-Turn STAR Rubric Feedback & Model Answers (Priority: P1)

As a student practicing in Instant Feedback mode, I want immediate, rubric-based feedback on my answer right after submitting each question—including an analysis of the STAR components (Situation, Task, Action, Result), power action verbs, clarity, and an exemplary model answer—so that I can learn how to restructure my response while the thought is fresh.

**Why this priority**: Immediate feedback loops accelerate learning. Students immediately see where their answers undersell their achievements and how applying the STAR/XYZ framework transforms a weak answer into a compelling one.

**Independent Test**: Can be tested by submitting an answer to a behavioral question in Instant Feedback mode, verifying that the feedback panel displays a structured breakdown of Situation, Task, Action, and Result, highlights missing metrics, and generates an improved model phrasing demonstrating proper impact framing.

**Acceptance Scenarios**:

1. **Given** a student submitting an answer in Instant Feedback mode, **When** submission completes, **Then** the system renders a structured feedback card before prompting for the next question.
2. **Given** the structured feedback card, **When** inspected by the student, **Then** it presents an evaluation across key criteria:
   - **STAR Framework Analysis**: Presence and strength of Situation, Task, Action, and Result elements.
   - **Impact & Quantification**: Feedback on whether the student cited measurable metrics, technologies, or clear business/project outcomes.
   - **Clarity & Delivery Tone**: Feedback on conciseness, professional vocabulary, and power verbs used.
3. **Given** the feedback card, **When** the student reviews improvement recommendations, **Then** the system displays a tailored **Model Answer** illustrating how the student's specific experience could be framed using STAR/XYZ structure for maximum employer appeal.
4. **Given** the student has reviewed their feedback, **When** they click "Next Question", **Then** the interface transitions smoothly to the subsequent question.

---

### User Story 4 - Comprehensive Post-Interview Scorecard & CV Improvement Recommendations (Priority: P2)

As a student concluding an interview drill, I want a comprehensive final scorecard with an overall readiness rating (0–100), dimensional competency scores (Communication, Technical Depth, STAR Structure, Impact), and actionable suggestions for updating my CV bullet points based on weak spots discovered during the drill, so that I have a clear roadmap for improvement.

**Why this priority**: Synthesizes the entire session into an actionable debrief. Connecting interview struggles back to CV wording bridges the loop between CV claims and interview defense as mandated by the project constitution.

**Independent Test**: Can be tested by completing all questions in a session, navigating to the final summary view, and verifying the presence of an overall composite score (0–100), four competency category scores, a question-by-question review accordion, and specific bullet-improvement recommendations for the student's CV.

**Acceptance Scenarios**:

1. **Given** the final question of a session is submitted, **When** the interview concludes, **Then** the system displays a comprehensive **Interview Scorecard** within 5 seconds.
2. **Given** the Interview Scorecard, **When** viewed, **Then** it presents:
   - **Overall Readiness Score** (0–100) with a qualitative readiness tier (e.g., "Interview Ready", "Solid Foundation", "Needs Practice").
   - **Dimensional Competency Breakdown**: Scores for STAR Framework Adherence, Technical & Project Depth, Communication & Conciseness, and Quantifiable Impact.
   - **Key Strengths**: 2–3 specific callouts of what the student did exceptionally well.
   - **High-Priority Growth Areas**: 2–3 concrete coaching points to address in future interviews.
3. **Given** the session review section, **When** the student expands any question, **Then** they can review the original question, their submitted answer, the AI's critique, and the model response.
4. **Given** weak points identified during the interview (e.g., student struggled to quantify results for a specific project), **When** reviewing recommendations, **Then** the system provides actionable suggestions to enhance corresponding bullet points in their saved CV (e.g., "Add the specific metric you mentioned about reducing latency to your capstone project bullet on your CV").

---

### User Story 5 - Interview Session History & Progress Tracking (Priority: P3)

As a returning student, I want to review my past interview sessions, historical scores, and progress trends over time, so that I can track my growth, revisit past feedback, and target specific competencies that need additional practice.

**Why this priority**: Reinforces user retention and habit formation. Enables students to observe measurable improvement across multiple practice sessions leading up to real interviews.

**Independent Test**: Can be tested by completing multiple interview sessions, opening the Interview History dashboard, verifying past sessions are listed with dates, target roles, and scores, and filtering by interview track to inspect progress over time.

**Acceptance Scenarios**:

1. **Given** an authenticated student with previous sessions, **When** they visit the Interview Dashboard, **Then** they see a historical log of past sessions showing date, target role, track type, question count, and overall readiness score.
2. **Given** any past session in the history list, **When** the student selects it, **Then** they can view the full read-only scorecard, question transcripts, and coaching recommendations.
3. **Given** past session records, **When** the dashboard renders, **Then** it displays progress indicators showing score trends over time across the core competencies.
4. **Given** a completed session, **When** the student chooses "Retake Similar Drill", **Then** the system initializes a new session with the same role and track configuration while generating fresh, non-duplicate questions.

---

### Edge Cases

- **Extremely Short or Non-Responsive Input**: When a student enters a single word, gibberish, or "I don't know" / "Pass", the system does not fail or generate hallucinated praise; instead, it provides encouraging coaching guidance, explains how to structure an answer even when uncertain, and offers a guided starter template.
- **Sparse or Incomplete CV Profile**: When a student selects a CV with minimal descriptions or empty project entries, the system falls back gracefully to standard entry-level industry question banks for the selected target role without crashing.
- **Session Interruption & Network Loss**: When a student's network drops, the browser is refreshed, or the user navigates away mid-session, all completed turns and draft responses are safely preserved, allowing the student to resume the session seamlessly upon return.
- **Speech-to-Text Unsupported or Denied**: When a student's browser does not support speech recognition or microphone permission is denied, the system displays a clear, non-intrusive notification and seamlessly defaults to the text input mode without blocking the interview flow.
- **Off-Topic Answers**: When a student's response is completely unrelated to the asked question (e.g. discussing lunch instead of project conflict), the AI Coach politely redirects the student back to the question's premise without penalizing technical competency scores unfairly.
- **Excessively Long Answers**: When a student enters an answer exceeding reasonable interview response length (> 600 words), the system provides specific feedback regarding conciseness and time management in addition to content evaluation.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated students to initiate an interview practice session either by selecting an existing saved CV or by specifying a target job role and optional job description.
- **FR-002**: System MUST support three distinct **Interview Tracks**:
  1. *Behavioral (STAR Method)*: Focusing on teamwork, leadership, conflict resolution, problem-solving, and adaptability.
  2. *Technical & Project Deep-Dive*: Focusing on architectural decisions, technologies used, technical hurdles, and project execution claims from the CV.
  3. *Mixed Situational*: Combining behavioral, project defense, and situational judgment scenarios.
- **FR-003**: System MUST provide configurable **Session Lengths**:
  1. *Quick Drill* (3 questions, ~10 minutes).
  2. *Standard Practice* (5 questions, ~20 minutes).
  3. *Full Mock Interview* (8 questions, ~35 minutes).
- **FR-004**: System MUST support two distinct **Practice Modes**:
  1. *Instant Feedback Mode*: Turn-by-turn evaluation delivered immediately after each answer submission.
  2. *Exam Mode*: Continuous interview experience with all feedback and scoring deferred to the end-of-session scorecard.
- **FR-005**: System MUST dynamically generate interview questions tailored to the student's specific CV entries (capstone projects, work experience, tools, and technical skills) and chosen target role.
- **FR-006**: System MUST ensure questions are served sequentially, one question at a time, to simulate an authentic interview flow.
- **FR-007**: System MUST provide both text-based input and voice speech-to-text dictation for student responses.
- **FR-008**: System MUST display an elapsed timer and word counter during active answering to assist students in tracking response pacing.
- **FR-009**: System MUST support adaptive follow-up probing questions (maximum 1 probe per primary question) when a student's initial response lacks clarity, specific action details, or measurable outcomes.
- **FR-010**: System MUST evaluate student responses using a standardized **STAR Rubric**:
  - Situation: Context and problem background.
  - Task: Specific responsibility or objective.
  - Action: Specific personal actions, technical methodologies, and tools applied.
  - Result: Quantifiable outcomes, impact metrics, and lessons learned.
- **FR-011**: System MUST provide constructive, actionable feedback highlighting strengths, missed opportunities, power verb usage, and tone for each answered question.
- **FR-012**: System MUST generate an AI-enhanced **Model Answer** for each question showing how the student could have articulated their specific experience using high-impact STAR/XYZ framing.
- **FR-013**: System MUST calculate an overall session readiness score (0–100) and dimensional competency sub-scores (STAR Alignment, Technical Depth, Communication & Conciseness, Quantifiable Impact).
- **FR-014**: System MUST generate a comprehensive post-interview scorecard summarizing session performance, question reviews, and cross-referenced recommendations for updating the student's CV bullet points.
- **FR-015**: System MUST persist session state in real time so that interrupted, paused, or refreshed sessions can be resumed from the exact current question without data loss.
- **FR-016**: System MUST maintain a historical archive of completed interview sessions accessible from the student's dashboard.
- **FR-017**: System MUST allow students to review transcripts, scores, and coaching notes of any previously completed session.
- **FR-018**: System MUST allow students to retake an interview session with identical configuration while generating fresh, non-repetitive questions.
- **FR-019**: System MUST perform deterministic validation on all session creation parameters and answer submissions prior to dispatching requests to AI processing pipelines.
- **FR-020**: System MUST sanitize and protect student Personally Identifiable Information (PII) from CVs and interview transcripts, ensuring conversational data is stored securely and never exposed across user boundaries.

---

### Key Entities *(include if feature involves data)*

- **Interview Session (`InterviewSession`)**: Represents an individual interview practice run. Attributes include user ID, associated CV ID (optional), target job role, job description, track type (Behavioral, Technical, Mixed), session length, practice mode (Instant Feedback vs Exam), status (Configuring, In Progress, Completed, Abandoned), overall readiness score (0–100), started at, and completed at.
- **Interview Question (`InterviewQuestion`)**: Represents a specific question asked during a session. Attributes include session ID, question index (1 to N), question text, question category/competency targeted, referenced CV section or skill (if applicable), and flag indicating whether it is a primary question or an adaptive follow-up probe.
- **Interview Response (`InterviewResponse`)**: Represents the student's submitted answer to a specific question. Attributes include question ID, response text, input modality (text vs voice transcription), duration/time spent (seconds), and submission timestamp.
- **Turn Feedback (`TurnFeedback`)**: Represents the AI-generated evaluation for a specific response. Attributes include response ID, STAR component breakdown (ratings and notes for Situation, Task, Action, Result), impact rating, clarity rating, strengths summary, improvement suggestions, and generated model answer text.
- **Interview Scorecard (`InterviewScorecard`)**: Represents the final aggregated performance report of a completed session. Attributes include session ID, composite score (0–100), dimensional sub-scores (STAR structure, technical depth, communication, impact), qualitative readiness tier, key overall strengths, key growth areas, and specific CV bullet update recommendations.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Session initialization and presentation of the first tailored interview question occurs in under 4 seconds from clicking "Start Interview".
- **SC-002**: Turn feedback in Instant Feedback mode and adaptive follow-up questions are delivered within 3.5 seconds of response submission.
- **SC-003**: At least 85% of interview questions in a CV-linked session directly reference concrete projects, tools, or experiences listed on the student's CV.
- **SC-004**: 90% of evaluated student responses receive specific, actionable feedback across all four STAR components rather than generic ratings.
- **SC-005**: 100% of interrupted or abruptly closed interview sessions can be resumed from the exact state and question where the user left off.
- **SC-006**: The comprehensive post-interview scorecard is generated and rendered within 5 seconds of the final question submission.
- **SC-007**: Students who complete at least two drill sessions demonstrate a measurable average improvement of at least 15% in their STAR structure adherence score on subsequent attempts.

---

## Assumptions

- **Target Users**: The primary audience is university students, recent graduates, and early-career job seekers preparing for campus recruitment, technical screenings, and behavioral interviews.
- **Decoupled Architecture**: In accordance with Constitution Principle 3, the AI Interview Coach is an independent, opt-in module. It consumes polished CV data when available, but does not require a completed CV to function (users may input a target role and job description directly). It does not block or gate CV drafting or ATS scoring.
- **Input Modality**: The application provides a responsive, accessible text-first conversational user interface. Speech recognition utilizes standard web platform voice-to-text capabilities with graceful fallback to keyboard typing.
- **AI Processing**: Interview question generation, adaptive probing, response evaluation, and scorecard synthesis are executed through backend AI pipeline integrations adhering to system privacy and rate-limiting policies.
- **Data Retention & Privacy**: Session transcripts, voice transcriptions, and generated scorecards are private to the authenticated user account and are retained until the user explicitly deletes their session history or account.
