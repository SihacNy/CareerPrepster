# Feature Specification: Module 1 - CV Editor & Universal ATS Scoring

**Feature Branch**: `module/cv-editor`

**Created**: 2026-09-11

**Status**: Ready for Planning

**Input**: User description: "start planning for the cv-editor module one workflow now"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Template Selection & Structured CV Content Authoring (Priority: P1)

As a graduating university student, I want to select a clean, ATS-compliant CV template and author my academic achievements, capstone projects, work history, and technical skills through structured form sections with live document preview, so that my resume maintains industry-standard formatting without layout breakage.

**Why this priority**: Core baseline MVP functionality. Without structured content input and template rendering, no downstream AI suggestions or ATS checks can operate.

**Independent Test**: Can be fully tested by creating a new CV profile, selecting a template, filling out contact info, education, project, experience, and skill fields, and verifying the structured resume renders live in the document preview pane.

**Acceptance Scenarios**:

1. **Given** a user enters the CV editor, **When** they view the template picker, **Then** they see a gallery of structured, single-column, ATS-friendly templates and can switch active templates with instant layout updates.
2. **Given** an open template, **When** the user inputs their personal info, education, work experience, projects, and skills, **Then** the form validates required fields, updates the preview in real-time, and saves changes reliably.
3. **Given** an existing section, **When** the user reorders entries (e.g. moves projects above work experience) or adds custom bullet points, **Then** the preview reflects the adjusted hierarchy immediately.

---

### User Story 2 - AI-Assisted Bullet Point Wording Enhancement (Priority: P2)

As a student with raw project descriptions, I want an in-line AI writing assistant that transforms my basic bullet points into high-impact, quantifiable achievements using the STAR (Situation, Task, Action, Result) and XYZ (Accomplished [X], measured by [Y], by doing [Z]) frameworks, so that employers immediately recognize my value.

**Why this priority**: Solves the central "Translation Gap" where students struggle to articulate academic and project work in professional business language.

**Independent Test**: Can be tested by entering a generic draft bullet point (e.g., "Worked on a web application for booking flights"), triggering the AI wording assistant, reviewing 2–3 suggested phrasing options with power verbs and metric slots, and choosing one to replace the original text.

**Acceptance Scenarios**:

1. **Given** a draft bullet point in a project or experience entry, **When** the user clicks "Enhance with AI", **Then** the assistant generates 2–3 alternative phrasings framed in action verbs and quantifiable outcomes (XYZ format).
2. **Given** AI-suggested wording options, **When** the user reviews them, **Then** the user can accept a suggestion, edit it in-line, or reject it to keep their original text.
3. **Given** an empty or single-word bullet point, **When** the user requests AI enhancement, **Then** the system prompts the user with clarifying guidance rather than generating hallucinated experiences.

---

### User Story 3 - Universal ATS Compatibility Scoring & Explainable Feedback (Priority: P3)

As an applicant preparing job submissions, I want an automated, universal ATS scoring scan that evaluates my CV across parsability, action verb density, quantifiable metrics, and section health, so that I can eliminate filter-rejection risks before applying.

**Why this priority**: Gives students confidence and actionable guidance on how applicant tracking bots and human screeners will interpret their document.

**Independent Test**: Can be tested by running the ATS score check on a completed CV, verifying a 0–100 overall score is generated along with categorized actionable findings (Critical Issues, Suggestions, and Passed Checks).

**Acceptance Scenarios**:

1. **Given** an active CV draft, **When** the user requests an ATS check, **Then** the system evaluates the CV across 4 pillars: Parsability & Section Structure (25 pts), Impact & Action-Oriented Phrasing (30 pts), Skills Depth & Categorization (25 pts), and Readability & Length (20 pts).
2. **Given** an ATS score report, **When** issues are identified (e.g., weak passive verbs, missing metrics, unformatted skills), **Then** each issue is highlighted with specific remediation advice and links directly to the offending section in the editor.
3. **Given** optional job description text provided by the user, **When** the ATS scan runs in Targeted Mode, **Then** the system extracts keyword frequency from the job post, calculates a keyword match percentage, and lists missing critical skills.

---

### User Story 4 - High-Fidelity ATS-Compliant PDF Export (Priority: P4)

As a finished user, I want to download my polished CV as an ATS-optimized, selectable-text PDF that mirrors the chosen template precisely, so that I can upload it to job application portals without formatting distortions.

**Why this priority**: Completes the authoring lifecycle by providing the final deliverable needed to apply for jobs.

**Independent Test**: Can be tested by clicking "Export PDF" from the editor, downloading the file, verifying text selectability, and validating that font hierarchy and margin structures match the chosen template.

**Acceptance Scenarios**:

1. **Given** a completed CV, **When** the user clicks "Download PDF", **Then** the system produces a clean, single-page (or controlled multi-page) PDF with embedded fonts and selectable text.
2. **Given** generated PDFs, **When** tested against standard PDF text extractors, **Then** all sections, dates, and bullet points extract cleanly in correct reading order without overlapping artifacts.

---

### Edge Cases

- **Excessively Long Content**: If user content exceeds 1 page, the editor warns the student about optimal student CV length (450–750 words) and displays dynamic page break indicators in the preview.
- **Empty or Incomplete Sections**: If required sections (such as Education or Contact Email) are left blank, the system flags them as Critical in the ATS check without blocking draft saving.
- **Network or AI Service Disruption**: If the AI wording assistant is temporarily unavailable, the editor allows uninterrupted manual editing and informs the user with a graceful retry notification.
- **Special Characters and Symbols**: Unusual unicode characters, non-standard bullets, or complex emojis are automatically normalized to ATS-safe equivalents during rendering and export.
- **Job Description Parsing with No Match**: When targeted mode is run with an unrelated job description, the system gracefully handles low match percentages without crashing and suggests relevant transferable skill bridges.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a gallery of at least 3 distinct, ATS-optimized, single-column curriculum vitae templates.
- **FR-002**: Users MUST be able to switch active templates at any time without losing entered section data.
- **FR-003**: System MUST provide dedicated, structured input forms for Personal Information, Education, Work Experience, Technical/Academic Projects, Skills, and Certifications.
- **FR-004**: System MUST render a real-time, interactive preview of the document alongside the input forms.
- **FR-005**: System MUST allow users to add, edit, delete, and reorder entries within list-based sections (Projects, Experience, Education).
- **FR-006**: Users MUST be able to trigger AI wording suggestions for individual experience or project bullet points.
- **FR-007**: AI wording suggestions MUST provide 2 to 3 alternative phrasings utilizing power action verbs and the XYZ / STAR achievement framework.
- **FR-008**: System MUST preserve user agency by requiring explicit user acceptance or modification before applying any AI-generated phrasing to the CV.
- **FR-009**: System MUST perform deterministic validation on all input fields prior to dispatching prompts to AI pipelines.
- **FR-010**: System MUST generate an explainable ATS score from 0 to 100 based on a 4-pillar composite rubric (Parsability, Impact Verbs, Skills Taxonomy, Readability).
- **FR-011**: System MUST categorize ATS findings into Critical Issues, Actionable Suggestions, and Passed Checks.
- **FR-012**: System MUST allow optional user input of a target Job Description to compute role-specific keyword match percentages and identify missing skills.
- **FR-013**: System MUST allow exporting the finalized CV as a clean, selectable-text PDF matching the selected template layout.
- **FR-014**: System MUST automatically autosave user edits locally and persist changes to the user's profile.
- **FR-015**: System MUST sanitize and protect all Personally Identifiable Information (PII) during storage and external AI API transmissions.

### Key Entities *(include if feature involves data)*

- **CV Profile**: Represents the user's overall resume document. Attributes include document title, selected template ID, target job role, creation date, and last modified timestamp.
- **CV Section**: Represents a categorized segment of the CV (Personal Info, Education, Experience, Projects, Skills, Certifications). Contains ordered child items and section-specific fields.
- **Bullet Item**: A discrete achievement statement within an experience or project entry. Contains raw text, enhanced text flag, and detected metrics.
- **Template**: Definition of an ATS-compliant visual layout. Contains styling rules, typography constraints, margin specs, and section ordering rules.
- **ATS Report**: Generated analysis for a CV version. Contains overall numerical score (0-100), sub-scores for the 4 pillars, list of identified issues with severity ratings, and target keyword match stats.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select a template and populate all core sections in under 10 minutes.
- **SC-002**: 90% of user-submitted bullet points sent to the AI wording assistant receive viable STAR/XYZ suggestions within 3 seconds.
- **SC-003**: 100% of exported PDFs have selectable text and follow standard single-column ATS reading order without text overlap.
- **SC-004**: The ATS scoring scan generates a comprehensive, explainable breakdown within 2 seconds of document submission.
- **SC-005**: User task completion rate (from starting a CV to downloading an ATS-checked PDF) exceeds 80% on first session.

---

## Assumptions

- **Target Audience**: Graduating university students and early-career job seekers with academic projects, coursework, or internship experience.
- **Device Support**: Primary target is desktop and tablet browsers (screen widths >= 768px) where dual-pane form and preview editing is ergonomic; responsive read/review mode for mobile.
- **AI Scope**: The AI is an advisory wording and impact coach, not an autonomous page generator; layout remains constrained by the selected ATS template.
- **Storage & State**: User CVs are persisted to the user account with real-time browser draft caching to prevent data loss on accidental tab closure.
- **Downstream Decoupling**: Module 1 is fully self-contained. The CV data produced here will serve as input for downstream Module 2 (Mock Interviews) and Module 3 (Job Matching), but Module 1 does not depend on them.
