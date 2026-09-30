# Template Selection Stage Contracts & UI Specifications

**Route**: `/editor/templates` (Sub-studio of Stage 1: Author CV)  
**Stage**: Stage 1: Author CV  
**State Contract**: `templateId: string`, `accentColor?: string`, `personalInfo.photoUrl?: string`  

---

## 1. Multi-Archetype Template Catalog Schema

Each template exposed in the catalog conforms to the following metadata contract:

```typescript
export type TemplateArchetype = "minimalist" | "color-accent" | "visual-photo";

export interface ColorPaletteOption {
  id: string;
  name: string;
  hex: string;
  contrastText: string;
}

export interface TemplateDefinition {
  id: string; // "classic" | "modern" | "executive-accent" | "modern-photo"
  name: string;
  subtitle: string;
  archetype: TemplateArchetype;
  badge?: string; // e.g., "MOST POPULAR", "TECH FAVORITE", "EXECUTIVE ACCENT", "PHOTO / INT'L"
  fontFamily: string;
  fontCategory: "serif" | "sans-serif";
  description: string;
  previewFeatures: string[];
  recommendedIndustries: string[];
  supportsPhoto: boolean;
  supportsColor: boolean;
  defaultColor: string;
  availablePalettes?: ColorPaletteOption[];
}
```

---

## 2. Active Template Catalog Entries

### 1. Minimalist ATS — Harvard Classic (`classic`)
- **ID**: `classic`
- **Archetype**: `minimalist`
- **Name**: Harvard Classic
- **Badge**: `MOST POPULAR`
- **Typography**: Merriweather (Traditional Serif)
- **Target Industries**: Finance, Consulting, Legal, Graduate School, Traditional Corporate
- **Supports Photo**: `false`
- **Supports Color**: `false`
- **ATS Rating**: 100% (Single-column vector text, zero tables)

### 2. Minimalist ATS — Jake's Tech (`modern`)
- **ID**: `modern`
- **Archetype**: `minimalist`
- **Name**: Jake's Tech
- **Badge**: `TECH FAVORITE`
- **Typography**: Inter / Plus Jakarta Sans (Clean Modern Sans-Serif)
- **Target Industries**: Software Engineering, Cloud/DevOps, Data Science, Startups
- **Supports Photo**: `false`
- **Supports Color**: `false`
- **ATS Rating**: 100% (High-density compact layout)

### 3. Modern Color Accent — Executive Accent (`executive-accent`)
- **ID**: `executive-accent`
- **Archetype**: `color-accent`
- **Name**: Executive Accent
- **Badge**: `NEW • ACCENT COLOR`
- **Typography**: Plus Jakarta Sans / Inter
- **Target Industries**: Product Management, Strategy Consulting, Marketing, FinTech
- **Supports Photo**: `false`
- **Supports Color**: `true`
- **Default Color**: `#0284c7` (Tech Sky)
- **Available Palettes**: 6 Curated Swatches (Sky Blue, Executive Navy, Emerald Teal, Slate Steel, Burgundy, Royal Indigo)
- **ATS Rating**: 100% (Single-column linear text with colored rules and styled headers)

### 4. Visual / Photo-Enabled — Modern Photo (`modern-photo`)
- **ID**: `modern-photo`
- **Archetype**: `visual-photo`
- **Name**: Modern Photo
- **Badge**: `PHOTO / CREATIVE`
- **Typography**: Inter
- **Target Industries**: Creative Direction, UX/UI Design, International Markets (EU/Asia/MENA), Media
- **Supports Photo**: `true`
- **Supports Color**: `true`
- **Default Color**: `#0f766e` (Emerald Teal)
- **ATS Rating**: High (Single-column semantic text flow; photo placed in semantic header)

---

## 3. Curated Color Palette Contract

| Palette ID | Name | Hex | Description |
| :--- | :--- | :--- | :--- |
| `sky-blue` | Tech Sky | `#0284c7` | Dynamic primary blue for technology, startups, and software |
| `exec-navy` | Executive Navy | `#1e3a8a` | Authoritative deep navy for finance, law, and corporate leadership |
| `emerald-teal` | Forest Teal | `#0f766e` | Modern teal for healthtech, sustainability, and creative disciplines |
| `slate-steel` | Slate Steel | `#334155` | Sleek neutral graphite for engineering, hardware, and data science |
| `burgundy` | Crimson Burgundy | `#881337` | Academic and executive warmth for research, humanities, and arts |
| `royal-indigo` | Royal Indigo | `#4338ca` | Bold contemporary purple-indigo for marketing, product, and design |

---

## 4. UI Interactions & Controls

### 4.1. Category Filter Controls
The Template Gallery top filter bar provides 4 category tabs:
1. **All Styles** (shows all active templates)
2. **Minimalist ATS** (`classic`, `modern`)
3. **Color Accent** (`executive-accent`)
4. **Photo / Visual** (`modern-photo`)

### 4.2. Color Selector
When a template with `supportsColor === true` is active or selected:
- A compact **Accent Color** palette picker appears, rendering the 6 clickable color swatches with active ring indicator.
- Changing color updates `cvData.accentColor` in the store immediately, dynamically tinting header bars, section title underlines, and skill badges in real-time.

### 4.3. Profile Photo Uploader & Validation
When a template with `supportsPhoto === true` is active:
- The Personal Info section in the editor provides a profile photo upload/URL field (`photoUrl`).
- **Strict Size & Type Validation**:
  - Max file size: **10MB** (`file.size <= 10 * 1024 * 1024`). Files exceeding 10MB are immediately blocked with an inline validation message: *"Image file must be 10MB or smaller."*
  - Allowed file formats: PNG, JPEG, WebP (`image/jpeg`, `image/png`, `image/webp`).
- Users can upload an image file or provide a direct image link; image preview is displayed with remove/replace options.
- If no photo is provided, the template gracefully collapses the photo container without awkward whitespace.

### 4.4. Fullscreen Preview & Selection
- Each card provides a **Preview** button (opening full A4 modal preview) and a **Select** button (`✓ Selected` in primary blue when active).
- Sticky bottom footer displays `Active: [Template Name]` and `Continue with [Template Name] →` routing to `/editor`.

---

## 5. Backend API & Persistence Contract

### 5.1. Endpoints Impacted
- `POST /api/cvs`: Accepts `templateId`, `accentColor`, and `personalInfo.photoUrl` (or flat `photoUrl`)
- `PUT /api/cvs/:id`: Updates `templateId`, `accentColor`, and `photoUrl` alongside standard CV sections
- `GET /api/cvs/:id`: Returns `templateId`, `accentColor`, and `personalInfo.photoUrl`

### 5.2. Payload Specification

```json
{
  "title": "Software Engineer CV",
  "templateId": "modern-photo",
  "accentColor": "#0f766e",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "photoUrl": "data:image/jpeg;base64,...",
  "sections": [],
  "skillGroups": []
}
```

- `photoUrl`: String (base64 data URI or image URL). Backend validates <= 10MB payload size. MySQL stores in `MediumText` (up to 16MB).
- `accentColor`: String (`#hex` format, max 30 chars, default `#0284c7`).

