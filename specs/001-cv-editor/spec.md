# Feature Specification: Module 1 - CV Editor, Resume Import & Universal ATS Scoring

**Feature Branch**: `module/cv-editor`

**Created**: 2026-09-11

**Status**: Ready for Planning

**Input**: User description: "I want the first one where we extract from their cv into one of our design. The flow can be before making the CV they are prompted with question if they have CV or if they don't. If they don't have it as it is right now but if they do extract it and let them choose a template they want it on and it can go on the ATS score review like the normal one."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Onboarding Entry Fork & Existing CV Import (Priority: P1)

As a student with an existing resume, I want to upload my current PDF or Word document when starting, so that the system automatically extracts my work history, education, and skills into structured fields without requiring me to re-type everything from scratch.

As a student without a resume, I want to start from scratch, so that I can be guided step-by-step through template selection and section authoring.

**Why this priority**: Eliminates massive user friction at the front door. Users with existing resumes get instant value in seconds, while new users are guided cleanly without confusion.

**Independent Test**: Can be tested by navigating to `/editor/new`, selecting "Upload Existing Resume", uploading a sample student PDF, and verifying that the system immediately presents an ATS diagnostic score report before transitioning to the structured editor with pre-populated fields.

**Acceptance Scenarios**:

1. **Given** a user initiates CV creation, **When** they land on the creation modal, **Then** they are presented with a clear choice: **"Create from Scratch"** or **"Upload Existing Resume (PDF/DOCX)"**.
2. **Given** the user selects "Upload Existing Resume", **When** they upload their PDF or DOCX file (up to 5MB), **Then** the system extracts structured sections (personal info, education, experience, projects, skills) and immediately performs a baseline 4-pillar ATS audit.
3. **Given** the extraction and initial scan are complete, **When** the upload finishes, **Then** the user is directed first to the **ATS Scoring Stage (`/editor/ats`)** to review their current document score (0–100), detected formatting bottlenecks, and keyword health.
4. **Given** the initial ATS audit review, **When** the user clicks **"Improve in Editor →"** (or clicks a specific "Fix in Editor" recommendation), **Then** they transition into the dual-pane CV Editor with all extracted data pre-populated into their chosen ATS-compliant template.
5. **Given** the user selects "Create from Scratch", **When** they proceed, **Then** they are taken directly to template selection and role setup in the CV Editor, with the ATS review occurring when they click "Continue".

---

### User Story 2 - Template Selection & Structured CV Content Authoring (Priority: P1)

As a graduating university student, I want to select a clean, ATS-compliant CV template and edit my academic achievements, capstone projects, work history, and technical skills through structured form sections with live document preview, so that my resume maintains industry-standard formatting without layout breakage.

**Why this priority**: Core baseline authoring functionality. Structured form inputs guarantee that the resulting document strictly adheres to ATS-friendly single-column layout constraints.

**Independent Test**: Can be tested by opening the editor, switching between ATS templates, editing personal info, education, project, experience, and skill fields, and verifying the structured resume renders live in the document preview pane.

**Acceptance Scenarios**:

1. **Given** an open CV, **When** the user views the template picker, **Then** they see a gallery of structured, single-column, ATS-friendly templates and can switch active templates with instant layout updates without losing entered data.
2. **Given** an active form, **When** the user edits personal info, education, work experience, projects, or skills, **Then** the form validates inputs, updates the preview in real-time (< 100ms), and preserves active draft state in local storage.
3. **Given** an existing section, **When** the user reorders entries (e.g. moves projects above work experience) or adds custom bullet points, **Then** the preview reflects the adjusted hierarchy immediately.
4. **Given** a mobile viewport (< 1024px), **When** viewing the editor, **Then** the system switches to single-pane focus mode with a mobile toggle (`[ Edit Form ]` vs `[ Live Preview ]`) enabling comfortable typing and 1-tap full-resume inspection.

---

### User Story 3 - Job Role Autocomplete & Role-Specific Template Bullet Library (Priority: P2)

As a student with writer's block or limited industry experience, I want to type my target job role and receive autocomplete suggestions from a curated database catalog, so that I can browse and import pre-authored, high-impact bullet point templates directly into my CV sections.

**Why this priority**: Eliminates the "blank page syndrome" by providing students with industry-validated starter bullets tailored to the exact role they are targeting.

**Independent Test**: Can be tested by typing "Frontend" into the target role field, seeing "Frontend Developer" suggested from the database, selecting it, opening the template bullet library, and inserting 2 starter bullets directly into a project or experience entry.

**Acceptance Scenarios**:

1. **Given** the user is setting up their CV, **When** they start typing in the target role field (e.g., "Data"), **Then** the system presents real-time autocomplete suggestions from the database (e.g., "Data Analyst", "Data Engineer", "Data Scientist").
2. **Given** the user selects a role from the database catalog, **When** they edit an experience or project section, **Then** the system displays a curated drawer of role-specific template bullet points organized by skill/focus area.
3. **Given** curated template bullet points, **When** the user clicks "Add to CV" on any bullet, **Then** the bullet point is inserted into their active section entry, ready for immediate preview and personalization.
4. **Given** a user types a custom job role not in the catalog, **When** they proceed, **Then** the system allows free-form job title entry without restricting them, offering general transferable bullet templates.

---

### User Story 4 - AI-Assisted Bullet Point Personalization & Wording Enhancement (Priority: P2)

As a student with imported template bullets or raw draft notes, I want an in-line AI writing assistant that transforms these bullet points into personalized, quantifiable achievements using the STAR (Situation, Task, Action, Result) and XYZ (Accomplished [X], measured by [Y], by doing [Z]) frameworks, so that employers immediately recognize my value.

**Why this priority**: Solves the central "Translation Gap" where students need to blend role-specific starter templates with their real-world project outcomes and metrics.

**Independent Test**: Can be tested by selecting any bullet point (authored or imported), clicking "Enhance with AI", reviewing 2–3 suggested variations with power verbs and metric slots, and choosing one to update the CV.

**Acceptance Scenarios**:

1. **Given** a bullet point in an experience or project entry, **When** the user clicks "Enhance with AI", **Then** the assistant generates 2–3 alternative phrasings framed in action verbs and quantifiable outcomes (XYZ format).
2. **Given** AI-suggested wording options, **When** the user reviews them, **Then** the user can accept a suggestion, edit it in-line, or reject it to keep their original text.
3. **Given** an empty or single-word bullet point, **When** the user requests AI enhancement, **Then** the system prompts the user with clarifying guidance rather than generating hallucinated experiences.

---

### User Story 5 - Universal ATS Compatibility Scoring & Explainable Feedback (Priority: P3)

As an applicant preparing job submissions, I want the system to guide me through an ATS scoring review stage after I finish my CV, so that when I click "Continue" I can see an explainable audit across parsability, impact verbs, metrics, and keyword matching before exporting.

**Why this priority**: Gives students confidence and actionable guidance on how applicant tracking bots and human screeners will interpret their document before final submission.

**Independent Test**: Can be tested by completing a CV draft, clicking "Continue to ATS Review", and verifying the user is transitioned to the ATS Scoring Stage with a 0–100 overall score and categorized actionable findings (Critical Issues, Suggestions, and Passed Checks).

**Acceptance Scenarios**:

1. **Given** an active CV draft in the editor, **When** the user clicks "Continue", **Then** the draft is automatically saved and the application transitions to the dedicated ATS Scoring Stage.
2. **Given** the ATS Scoring Stage, **When** the audit loads, **Then** the system presents an overall score (0–100) and scores across 4 pillars: Parsability & Section Structure (25 pts), Impact & Action-Oriented Phrasing (30 pts), Skills Depth & Categorization (25 pts), and Readability & Length (20 pts).
3. **Given** identified issues (e.g., weak passive verbs, missing metrics, unformatted skills), **When** reviewing the findings, **Then** each issue is categorized (Critical, Suggestion, Passed) with specific remediation advice and a "Back to Edit" link to jump directly to the relevant section.
4. **Given** optional job description text provided by the user in the ATS stage, **When** the scan runs in Targeted Mode, **Then** the system calculates a keyword match percentage and highlights missing critical skills.

---

### User Story 6 - 1-Click Social Sign-In (Google & GitHub OAuth) (Priority: P3)

As a student, I want to sign in with my existing Google (or GitHub) account with one click, so that I never have to remember or manage passwords, while keeping my personal resumes, contact details, and ATS scores private and accessible across my devices.

**Why this priority**: Implements Principle 4 (Student Privacy & Data Minimization) while eliminating password friction and account creation drop-off.

**Independent Test**: Can be tested by clicking "Sign in with Google", completing OAuth consent, and confirming an authenticated session is established in the editor with their profile name and avatar.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they click "Sign in with Google" or "Sign in with GitHub", **Then** they complete provider consent, are redirected back to the editor, and their session is established securely.
2. **Given** an authenticated user, **When** they return to the app, **Then** their session is automatically recognized without re-prompting.
3. **Given** an authenticated user, **When** they log out, **Then** the session cookie is cleared and local draft storage is removed.

---

### User Story 7 - High-Fidelity ATS-Compliant PDF Export & Cloud Save (Priority: P4)

As a finished user, I want to save my completed CV to my account in MySQL and download it as an ATS-optimized, selectable-text PDF, so that I can securely store my document and upload it to job portals.

**Why this priority**: Completes the authoring lifecycle with persistence and the final job application deliverable.

**Independent Test**: Can be tested by clicking "Save CV" to commit the document to MySQL, and clicking "Export PDF" to verify text selectability and layout fidelity.

**Acceptance Scenarios**:

1. **Given** an active editing session, **When** the user clicks "Save CV", **Then** the system validates the payload and commits the complete resume structure to MySQL with visual confirmation.
2. **Given** a saved CV, **When** the user clicks "Download PDF", **Then** the system produces a clean, single-page (or controlled multi-page) vector PDF with embedded fonts and selectable text matching the chosen template layout.

---

### Edge Cases

- **Image-Only / Scanned PDFs**: If an uploaded PDF contains only flattened images (no extractable text layer), the system alerts the user: *"We could not detect selectable text in this document. You can still use our templates to type your CV, or upload a text-based PDF."*
- **Malformed or Password-Protected Files**: Uploading password-protected PDFs or corrupted files displays a clear, friendly error prompt without crashing the application.
- **Custom / Uncataloged Job Roles**: When a user inputs a role not currently stored in the database catalog, the system smoothly accepts the custom role title and provides universal, transferable achievement bullet templates.
- **Overwriting Imported Bullets**: When importing a template bullet, it is treated as editable text; users can modify, prepend, or append to it freely before or after AI enhancement.
- **Excessively Long Content**: If user content exceeds 1 page, the editor warns the student about optimal student CV length (450–750 words) and displays dynamic page break indicators in the preview.
- **Empty or Incomplete Sections**: If required sections (such as Education or Contact Email) are left blank, the system flags them as Critical in the ATS check without blocking draft saving.
- **Network or AI Service Disruption**: If the AI wording assistant or parsing pipeline is temporarily unavailable, the editor allows uninterrupted manual editing and template bullet imports with a graceful retry notification.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present an onboarding choice upon starting a new CV: "Create from Scratch" or "Upload Existing Resume".
- **FR-002**: System MUST accept PDF and DOCX uploads (up to 5MB) for automated CV content extraction.
- **FR-003**: System MUST extract structured data from uploaded resumes into Personal Information, Education, Work Experience, Projects, and Skills.
- **FR-004**: System MUST allow users to select from a gallery of at least 3 distinct, ATS-optimized, single-column templates to render their imported or newly authored content.
- **FR-005**: Users MUST be able to switch active templates at any time without losing entered or extracted section data.
- **FR-006**: System MUST maintain a curated database collection of standard job roles (e.g., Software Engineer, Frontend Developer, Data Analyst, Product Manager).
- **FR-007**: System MUST provide real-time autocomplete suggestions for target job roles as the user types.
- **FR-008**: System MUST store a library of pre-authored, ATS-optimized template bullet points linked to cataloged job roles.
- **FR-009**: Users MUST be able to browse and insert role-specific template bullet points into their experience or project sections with one click.
- **FR-010**: System MUST render a real-time, interactive preview of the document alongside the input forms (< 100ms update latency).
- **FR-011**: Users MUST be able to trigger AI wording suggestions for any individual bullet point (whether authored from scratch, imported from an existing CV, or inserted from the template library).
- **FR-012**: AI wording suggestions MUST provide 2 to 3 alternative phrasings utilizing power action verbs and the XYZ / STAR achievement framework.
- **FR-013**: System MUST preserve user agency by requiring explicit user acceptance or modification before applying any AI-generated phrasing to the CV.
- **FR-014**: System MUST perform deterministic validation on all input fields prior to dispatching prompts to AI pipelines.
- **FR-015**: System MUST generate an explainable ATS score from 0 to 100 based on a 4-pillar composite rubric (Parsability, Impact Verbs, Skills Taxonomy, Readability).
- **FR-016**: System MUST categorize ATS findings into Critical Issues, Actionable Suggestions, and Passed Checks.
- **FR-017**: System MUST allow optional user input of a target Job Description to compute role-specific keyword match percentages and identify missing skills.
- **FR-018**: System MUST allow exporting the finalized CV as a clean, selectable-text PDF matching the selected template layout.
- **FR-019**: System MUST preserve active drafts locally in browser storage and persist completed versions to MySQL when the user explicitly clicks "Save".
- **FR-020**: System MUST sanitize and protect all Personally Identifiable Information (PII) during storage and external AI API transmissions.

### Key Entities *(include if feature involves data)*

- **Job Role Catalog (`JobRole`)**: Pre-seeded database record representing standard career titles with associated industry tracks.
- **Role Bullet Template (`RoleBulletTemplate`)**: Pre-curated, ATS-optimized achievement bullet points associated with a specific `JobRole`.
- **CV Profile (`CV`)**: The primary resume document entity (title, selected template ID, target role, contact details).
- **CV Section & Item (`CVSection`, `CVItem`)**: Categorized segments and entries (Education, Experience, Projects, Skills).
- **Bullet Item (`BulletPoint`)**: Individual achievement bullet point with metadata (user-written, imported, or AI-enhanced).
- **ATS Report (`ATSReport`)**: Historical audit of an ATS evaluation (0-100 overall score, 4 pillar sub-scores, categorized issues).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uploaded PDF/DOCX resumes are parsed and populated into the structured editor within 3 seconds for 95% of standard files.
- **SC-002**: Role autocomplete suggestions appear in under 150 milliseconds as the user types.
- **SC-003**: Users selecting a cataloged role can browse and import pre-authored bullet points into their CV within 2 clicks.
- **SC-004**: 90% of user-submitted bullet points sent to the AI wording assistant receive viable STAR/XYZ suggestions within 3 seconds.
- **SC-005**: 100% of exported PDFs have selectable text and follow standard single-column ATS reading order without text overlap.
- **SC-006**: The ATS scoring scan generates a comprehensive, explainable breakdown within 2 seconds of document submission.
- **SC-007**: User task completion rate (from starting a CV via import or scratch to saving to MySQL and downloading an ATS-checked PDF) exceeds 80% on first session.

---

## Assumptions

- **Target Audience**: Graduating university students and early-career job seekers with academic projects, coursework, or internship experience.
- **File Parsing**: Primary focus is digital text-based PDFs and DOCX files. Scanned images without OCR are flagged with a helpful notification.
- **Seed Catalog**: Initial database release includes at least 15–20 high-demand graduate job roles with 5–8 high-impact bullet templates per role.
- **Storage Strategy**: Active drafting is cached in browser storage for instant feedback and offline protection; permanent cloud persistence occurs in MySQL upon clicking "Save CV".
- **Downstream Decoupling**: Module 1 is fully self-contained. The CV data produced here will serve as input for downstream Module 2 (Mock Interviews) and Module 3 (Job Matching), but Module 1 does not depend on them.
