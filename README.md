# CareerPrepster 🚀

CareerPrepster is a modern, full-stack platform designed to help university students and early-career software engineers build ATS-optimized resumes and prepare for technical interviews with AI-assisted coaching.

Built with a high-performance architecture featuring **Next.js 14 App Router**, **Express with TypeScript (NodeNext ESM)**, **Prisma ORM with MySQL**, and high-speed AI inference powered by **Groq** and **Google Gemini**.

---

## 🌟 Key Features

### 1. Interactive CV & Resume Builder
- **Rich Bullet Editor**: WYSIWYG bullet point formatting with live support for Bold, Italic, Underline, Strikethrough, and multi-step Undo/Redo (`Ctrl+Z`, `Ctrl+Y`).
- **Dynamic Modular Sections**: Add, edit, collapse, or remove standard sections (*Work Experience*, *Education*, *Technical Projects*, *Categorized Skills*) as well as unlimited *Custom Sections* (*Certifications*, *Publications*, *Volunteering*, etc.).
- **Live Preview & Multi-Layouts**: Dual-pane editing mode with synchronized live document preview and responsive mobile drawer view.
- **High-Fidelity PDF Export**: Client-side, vector-crisp PDF generation using `@react-pdf/renderer` across multiple ATS-friendly templates (*Classic ATS*, *Modern Compact*, *Executive Accent*, and *Modern Photo*).

### 2. AI Bullet Refinement & Enhancement
- **STAR & XYZ Achievement Frameworks**: Automatically transform draft bullets into strong, quantifiable impact statements with active power verbs.
- **Strict Fact Preservation**: Prompt architecture guarantees that numbers, metrics, tools, and technical facts are preserved without hallucinations or unwarranted embellishments.
- **Ultra-Low Latency**: Powered by Groq AI inference (`openai/gpt-oss-120b` and `llama-3.3-70b-versatile`) with instant fallback support for Google Gemini.

### 3. AI Mock Interview Practice
- **Real-Time Interactive Interviews**: Simulate technical, system design, and behavioral interviews with tailored questions based on your CV and experience level.
- **Structured Scoring & Feedback**: Detailed breakdown of responses evaluating communication clarity, technical depth, problem-solving approach, and actionable improvement steps.

### 4. Robust Persistence & Data Sync
- **Hybrid Storage Engine**: Instant draft autosave to browser `localStorage` combined with cloud database synchronization via Prisma and MySQL.
- **Seamless Authentication**: Google OAuth integration with secure HttpOnly cookie session management.

---

## 🏗️ Architecture & Tech Stack

```
CareerPrepster (Monorepo)
├── shared/     # Shared TypeScript schemas, Zod validation, and CV interfaces (@careerprepster/shared)
├── backend/    # Express REST API (ESM, TypeScript, Prisma, MySQL, Groq/Gemini)
└── frontend/   # Next.js 14 (App Router, Tailwind CSS, Lucide React, React-PDF)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React, `@react-pdf/renderer` |
| **Backend** | Node.js, Express.js (ESM), TypeScript, Prisma ORM, MySQL 8, Zod, JWT |
| **AI Inference** | Groq SDK (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`), Google Generative AI (`gemini-1.5-flash`) |
| **DevOps & Tooling** | Docker, Docker Compose, npm Workspaces |

---

## 🚀 Quick Start with Docker

The fastest way to spin up the entire application (MySQL database, Express backend, and Next.js frontend) is using Docker Compose:

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A free [Groq API Key](https://console.groq.com/keys) (or [Gemini API Key](https://aistudio.google.com/)).

### 2. Environment Setup
Create a `.env` file in the project root:
```env
# AI API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Optional: Google OAuth Client ID for sign-in
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Launch Application
Run the following command in the root directory:
```bash
docker compose up -d
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **MySQL Database**: `localhost:3307` (mapped from container port 3306)

---

## 💻 Local Development Setup (Without Docker)

### 1. Install Dependencies
From the repository root, install dependencies for all workspaces:
```bash
npm install
```

### 2. Backend Setup
1. Navigate to the backend directory and configure the environment:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Initialize and migrate the MySQL database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend runs on port 5000.*

### 3. Frontend Setup
1. In a new terminal, configure the frontend:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on [http://localhost:3000](http://localhost:3000).*

---

## 📁 Repository Structure

```
├── .agents/                    # Speckit specs and developer workflow skills
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma relational data model (CV, Section, Item, Bullet, User)
│   │   └── seed.ts             # Default starter templates and industry role seeds
│   └── src/
│       ├── controllers/        # Express route handlers
│       ├── routes/             # REST API endpoints (/api/cvs, /api/ai, /api/auth, etc.)
│       ├── schemas/            # Request validation schemas
│       ├── services/           # Business logic & AI integration services
│       └── utils/              # Groq client, logger, and security helpers
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages (Editor, Dashboard, Interview, Preview)
│   │   ├── components/         # Reusable UI widgets, rich bullet editor, section accordions
│   │   ├── lib/                # API client, store context, validation, PDF documents
│   │   └── types/              # Frontend types & CV normalization helpers
├── shared/                     # Shared cross-boundary schemas and Zod models
└── docker-compose.yml          # Multi-container orchestration
```

---

## 🔒 Security Best Practices
- Sensitive secrets and API keys are read from environment variables and must never be committed to source control.
- Authentication tokens are handled via secure `HttpOnly`, `SameSite` cookies.
- All incoming requests and AI payloads undergo strict Zod schema validation.
