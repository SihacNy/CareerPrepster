# Quickstart Validation Guide: 003-ai-interview-coach

This guide outlines how to start, test, and validate the **Module 3 (AI Interview Coach & Mock Drill Simulation)** feature end-to-end.

---

## 1. Prerequisites

- Docker & Docker Compose installed (or Node.js 20+ and MySQL 8.0 running locally)
- Git branch: `module/ai-interview-coach` (or active feature branch)
- Backend configured with a valid `GEMINI_API_KEY` in `.env`
- Data models referenced: [data-model.md](./data-model.md)
- API contracts referenced: [contracts/session-api.md](./contracts/session-api.md), [contracts/turn-api.md](./contracts/turn-api.md), [contracts/scorecard-api.md](./contracts/scorecard-api.md)

---

## 2. Environment Setup

1. Verify environment configuration in `backend/.env`:
   ```bash
   DATABASE_URL="mysql://prepster:prepster_pass@mysql:3306/careerprepster"
   GEMINI_API_KEY="your-gemini-api-key"
   JWT_SECRET="your-jwt-secret-min-8-chars"
   CLIENT_URL="http://localhost:3000"
   ```
2. Apply Prisma schema updates to your database:
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

---

## 3. Launching Services

```bash
# From repository root
docker compose up -d
```

- **Frontend App**: `http://localhost:3000/interview`
- **Backend API**: `http://localhost:5000/api/interviews`
- **MySQL Database**: `localhost:3307` (Docker host port)

---

## 4. End-to-End Validation Scenarios

### Scenario 1: Setup Session with Contextual CV Ingestion
1. Navigate to `http://localhost:3000/interview`.
2. Click **"New Practice Drill"**.
3. In the setup modal:
   - Select an existing saved CV (e.g., "Full-Stack Software Engineer").
   - Select Track: **Behavioral (STAR Method)**.
   - Select Length: **Quick Drill (3 questions)**.
   - Select Mode: **Instant Feedback**.
4. Click **"Start Interview"**.
5. **Expected Outcome**:
   - The session initializes within 4 seconds.
   - Question 1 appears, referencing a specific project or achievement from the selected CV (e.g. capstone project or internship role).
   - An active pacing timer and word counter are visible in the interface.

---

### Scenario 2: Adaptive Follow-Up Probing on Vague Answer
1. For Question 1, enter a brief, non-quantified answer:
   > *"I noticed our database queries were running slow, so I added some indexes and it worked much better."*
2. Click **"Submit Answer"**.
3. **Expected Outcome**:
   - The AI recognizes that the answer lacks concrete tools, action specifics, and measurable outcomes.
   - An adaptive follow-up probe appears:
     > *"What specific indexes did you create, what tools did you use to profile the queries, and by how much did latency decrease?"*
   - The primary question remains visible for context while the candidate responds to the probe.

---

### Scenario 3: Instant STAR Rubric Feedback & Model Answer
1. Respond to the follow-up probe with quantified details:
   > *"I used pg_stat_statements to identify sequential scans, added composite B-Tree indexes on departure_date and flight_id, which reduced query execution time by 85% from 2.8s to 380ms."*
2. Click **"Submit Response"**.
3. **Expected Outcome**:
   - Within 3.5 seconds, a structured **STAR Feedback Card** appears.
   - Situation (4/5), Task (4/5), Action (5/5), and Result (5/5) sub-scores are rendered with positive callouts and identified strengths.
   - Power action verbs used (*Profiled*, *Engineered*, *Reduced*) are highlighted.
   - A tailored **Model Answer** is displayed showing an optimal STAR phrasing.
   - A **"Next Question →"** button transitions the session to Question 2.

---

### Scenario 4: Voice-to-Text Dictation & Seamless Fallback
1. On Question 2, click the **Microphone icon** next to the text input.
2. Allow browser microphone permissions when prompted.
3. Speak an answer into the microphone.
4. **Expected Outcome**:
   - Spoken words stream in real-time into the text response box.
   - The candidate can pause dictation and manually edit typos via the keyboard before clicking Submit.
   - If microphone permissions are denied, a discreet prompt explains that text input is active and typing remains fully functional.

---

### Scenario 5: Conclude Interview & Inspect Scorecard with CV Recommendations
1. Complete the remaining questions in the drill.
2. Upon submitting the final answer, the interface automatically navigates to the **Interview Scorecard**.
3. **Expected Outcome**:
   - Within 5 seconds, the comprehensive scorecard is displayed.
   - An **Overall Readiness Score** (e.g., `86/100`) and tier (*"Solid Foundation"*) are shown.
   - 4 dimensional scores (STAR Alignment, Technical Depth, Communication, Impact) appear in a breakdown card.
   - A **CV Improvement Recommendations** section appears, suggesting specific revisions to bullet points on the linked CV to incorporate the numbers and technical details articulated during the drill.
   - The completed session is automatically saved to the student's interview history.
