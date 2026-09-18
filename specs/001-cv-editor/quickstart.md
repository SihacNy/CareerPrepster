# Quickstart Validation Guide: 001-cv-editor

This guide outlines how to start and validate the **Module 1 (CV Editor, Resume Import & Universal ATS Scoring)** feature end-to-end.

---

## 1. Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (optional, if running outside Docker)
- Git branch: `module/cv-editor`

---

## 2. Environment Setup

1. Copy the environment file template:
   ```bash
   cp .env.example .env
   ```
2. Set your environment variables in `.env`:
   - `DATABASE_URL="mysql://prepster:prepster_pass@mysql:3306/careerprepster"`
   - `GEMINI_API_KEY="your-gemini-api-key"`
   - `JWT_SECRET="your-jwt-secret"`

---

## 3. Launch Services via Docker Compose

```bash
docker compose up --build -d
```

- **Frontend Web App**: `http://localhost:3000`
- **Backend Express API**: `http://localhost:5000/api`
- **MySQL Database**: `localhost:3306`

To run database migrations and seed the initial job roles & starter bullets:
```bash
docker compose exec backend npx prisma migrate dev --name init_cv_editor
docker compose exec backend npx prisma db seed
```

---

## 4. End-to-End Validation Scenarios

### Scenario 1: Onboarding Choice & Resume Import (PDF Upload)
1. Open `http://localhost:3000/editor` in your browser.
2. Select **"Upload Existing Resume"** on the onboarding modal.
3. Upload a sample student PDF (e.g., `Alex_Smith_Resume.pdf`).
4. **Expected Outcome**: Within 3 seconds, the document is parsed into structured fields. A template selection modal opens displaying the extracted text pre-formatted in the **Classic ATS** template.

### Scenario 2: Create from Scratch & Target Role Autocomplete
1. Click **"New CV"** → Select **"Start from Scratch"**.
2. In the target role field, type `"front"`.
3. **Expected Outcome**: Autocomplete dropdown appears within 150ms showing `"Frontend Developer"` and `"Frontend Engineer - React Specialist"`.
4. Select `"Frontend Developer"`.

### Scenario 3: Browse & Import Template Starter Bullets
1. In a Project or Experience entry, click **"Browse Starter Bullets"**.
2. A drawer opens showing categorized bullets (e.g. *UI Performance, API Integration*).
3. Click **"Add to CV"** on a bullet: *"Optimized client-side rendering and asset pipelines..."*
4. **Expected Outcome**: The bullet appears in the input form and reflects in the live document preview.

### Scenario 4: Personalize with AI (STAR/XYZ)
1. Click **"Enhance with AI"** on the imported bullet point.
2. Provide your real context (e.g. *"React 18 and Next.js, reduced load time by 40%"*).
3. **Expected Outcome**: Within 3 seconds, 2–3 personalized XYZ variations appear.
4. Click **"Accept"** to replace the draft text.

### Scenario 5: Template Selection in Author CV (Stage 1)
1. In Stage 1 (`/editor`), view the dedicated **Template Selection** section/studio at the top of the workspace.
2. Review the template cards for **Harvard Classic ATS** and **Jake's Tech (Modern Compact)** with typography, density, and recommended industries.
3. Switch active template:
   - Click **"Harvard Classic ATS"** or **"Jake's Tech"**.
   - **Expected Outcome**: The live preview updates immediately to the chosen layout, preserving all entered data without page navigation.

### Scenario 6: Check ATS Score & Export PDF
1. Click **"Continue to ATS Review →"** to advance to Stage 2 (`/editor/ats`).
2. View the 4-pillar score breakdown (Parsability, Impact, Skills, Brevity) with actionable green/yellow/red findings.
3. Click **"Continue to Export"** to advance to Stage 3 (`/editor/export`).
4. Click **"Download Deliverable"** → A clean, selectable vector PDF downloads matching the chosen template.

### Scenario 7: Multi-Archetype Templates, Color Swatches & Photo Support
1. Navigate to the Template Gallery at `/editor/templates`.
2. Use category tabs to filter between **All Styles**, **Minimalist ATS**, **Color Accent**, and **Photo / Visual**.
3. Select **Executive Accent** (`color-accent`):
   - Choose a color from the 6 palette swatches (e.g. `Executive Navy` `#1e3a8a` or `Tech Sky` `#0284c7`).
   - Observe header accent and section dividers update with the chosen color.
4. Select **Modern Photo** (`visual-photo`):
   - Provide a photo URL or upload an avatar in Personal Information.
   - Observe the photo appear in the header next to contact info.
5. Navigate to `/editor/export` and click **"Download Deliverable"**:
   - Verify that the downloaded vector PDF honors the selected accent color, typography, and profile headshot with zero content loss.

