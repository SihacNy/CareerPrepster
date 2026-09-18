import { TemplateId } from "./cv";

export type TemplateArchetype = "minimalist" | "color-accent" | "visual-photo";

export interface ColorPaletteOption {
  id: string;
  name: string;
  hex: string;
  contrastText: string;
}

export const COLOR_PALETTES: ColorPaletteOption[] = [
  { id: "dark-slate", name: "Executive Slate", hex: "#263244", contrastText: "#ffffff" },
  { id: "royal-blue", name: "Royal Cobalt", hex: "#1d58ba", contrastText: "#ffffff" },
  { id: "sky-blue", name: "Tech Sky", hex: "#0284c7", contrastText: "#ffffff" },
  { id: "emerald-teal", name: "Forest Teal", hex: "#0f766e", contrastText: "#ffffff" },
  { id: "burgundy", name: "Crimson Burgundy", hex: "#881337", contrastText: "#ffffff" },
  { id: "royal-indigo", name: "Royal Indigo", hex: "#4338ca", contrastText: "#ffffff" },
];

export interface TemplateDefinition {
  id: TemplateId | string;
  name: string;
  subtitle: string;
  archetype: TemplateArchetype;
  description: string;
  fontFamily: string;
  fontCategory: "serif" | "sans-serif";
  atsScoreGuarantee: string;
  recommendedIndustries: string[];
  badge?: string;
  previewFeatures: string[];
  supportsPhoto: boolean;
  supportsColor: boolean;
  defaultColor?: string;
  availablePalettes?: ColorPaletteOption[];
}

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  {
    id: "classic",
    name: "Harvard Classic",
    subtitle: "Ivy League ATS Standard",
    archetype: "minimalist",
    description:
      "Timeless single-column serif layout designed for maximum ATS parsability. Ideal for traditional corporate, finance, legal, and academic roles.",
    fontFamily: "Times New Roman / Garamond",
    fontCategory: "serif",
    atsScoreGuarantee: "100% ATS-Compliant",
    badge: "Most Popular",
    supportsPhoto: false,
    supportsColor: false,
    recommendedIndustries: ["Finance & Banking", "Consulting", "Law & Government", "Healthcare", "Corporate"],
    previewFeatures: [
      "Centered contact header",
      "Solid divider lines between sections",
      "Serif typography with italic accents",
      "Rigid single-column linear flow",
    ],
  },
  {
    id: "modern",
    name: "Jake's Tech",
    subtitle: "Clean Minimalist Sans-Serif",
    archetype: "minimalist",
    description:
      "High-density, modern sans-serif layout favored by top software engineers and startups. Emphasizes technical skills and project metrics.",
    fontFamily: "Inter / Calibri / Sans-Serif",
    fontCategory: "sans-serif",
    atsScoreGuarantee: "100% ATS-Compliant",
    badge: "Tech Favorite",
    supportsPhoto: false,
    supportsColor: false,
    recommendedIndustries: ["Software Engineering", "Product Management", "Data Science", "Design", "Startups"],
    previewFeatures: [
      "Left-aligned header with pipe separators",
      "Subtle modern border rules",
      "Compact vertical spacing for 1-page fit",
      "Dedicated tech stack pill highlights",
    ],
  },
  {
    id: "executive-accent",
    name: "Executive Accent",
    subtitle: "Headshot & Accent Rules",
    archetype: "color-accent",
    description:
      "Polished modern layout featuring a circular candidate photo with accent border, prominent colored name header with horizontal divider, and extended section rules.",
    fontFamily: "Plus Jakarta Sans / Inter",
    fontCategory: "sans-serif",
    atsScoreGuarantee: "100% ATS-Compliant",
    badge: "Modern Accent",
    supportsPhoto: true,
    supportsColor: true,
    defaultColor: "#1d58ba",
    availablePalettes: COLOR_PALETTES,
    recommendedIndustries: ["Product Management", "Strategy Consulting", "Marketing", "FinTech", "Operations"],
    previewFeatures: [
      "Circular candidate photo with accent border",
      "Prominent colored name with divider line",
      "Section headings with extended accent rule line",
      "Italic color-accented timeline dates",
    ],
  },
  {
    id: "modern-photo",
    name: "Modern Photo",
    subtitle: "Two-Column Sidebar & Timeline",
    archetype: "visual-photo",
    description:
      "Modern two-column layout featuring an elegant dark sidebar with candidate photo, contact info, education, and skills alongside a timeline-driven work history.",
    fontFamily: "Inter / Sans-Serif",
    fontCategory: "sans-serif",
    atsScoreGuarantee: "High ATS Fidelity",
    badge: "Photo / Timeline",
    supportsPhoto: true,
    supportsColor: true,
    defaultColor: "#263244",
    availablePalettes: COLOR_PALETTES,
    recommendedIndustries: ["Marketing & Strategy", "Product Design", "Creative & Media", "International Roles"],
    previewFeatures: [
      "Dark accent sidebar with circular photo",
      "Two-column structured layout",
      "Experience timeline with circular nodes",
      "Education & skill bullet points",
    ],
  },
];

export function getTemplateById(id: string): TemplateDefinition {
  return TEMPLATE_CATALOG.find((t) => t.id === id) || TEMPLATE_CATALOG[0];
}

import type { CVData } from "./cv";

export const SAMPLE_CV_FOR_PREVIEW: CVData = {
  id: "sample-preview-cv",
  title: "Alex Morgan - Sample Resume",
  templateId: "classic",
  targetRole: "Software Engineer",
  updatedAt: "2026-09-18T00:00:00.000Z",
  personalInfo: {
    fullName: "Alex Morgan",
    email: "alex.morgan@berkeley.edu",
    phone: "(555) 234-5678",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/alexmorgan",
    githubUrl: "https://github.com/alexmorgan",
    summary:
      "Results-oriented computer science graduate with proven experience building fault-tolerant microservices and high-performance web applications. Strong foundations in distributed systems, algorithms, and cloud infrastructure.",
    websiteUrl: "",
    portfolioUrl: "https://alexmorgan.dev",
    photoUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230f766e'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23ffffff'/%3E%3Cpath d='M22 84 C22 62 34 56 50 56 C66 56 78 62 78 84 Z' fill='%23ffffff'/%3E%3C/svg%3E",
  },
  sections: [
    {
      id: "sec-sample-edu",
      sectionType: "EDUCATION",
      title: "Education",
      orderIndex: 0,
      isVisible: true,
      items: [
        {
          id: "edu-1",
          title: "B.S. in Computer Science",
          subtitle: "University of California, Berkeley",
          location: "Berkeley, CA",
          startDate: "Aug 2020",
          endDate: "May 2024",
          isCurrent: false,
          gpa: "3.85 / 4.0",
          bulletPoints: [
            {
              id: "bp-edu-1",
              text: "Relevant Coursework: Distributed Systems, Operating Systems, Algorithms & Data Structures, Database Systems.",
              framework: "STANDARD",
            },
          ],
        },
      ],
    },
    {
      id: "sec-sample-exp",
      sectionType: "EXPERIENCE",
      title: "Work Experience",
      orderIndex: 1,
      isVisible: true,
      items: [
        {
          id: "exp-1",
          title: "Software Engineering Intern",
          subtitle: "Acme Cloud Infrastructure",
          location: "San Francisco, CA",
          startDate: "Jun 2023",
          endDate: "Aug 2023",
          isCurrent: false,
          bulletPoints: [
            {
              id: "bp-exp-1",
              text: "Designed and deployed asynchronous telemetry pipeline using Go and Apache Kafka, reducing end-to-end event latency by 32%.",
              framework: "STAR",
              hasMetric: true,
            },
            {
              id: "bp-exp-2",
              text: "Implemented distributed caching layer with Redis that eliminated 45% of duplicate database queries during peak traffic spikes.",
              framework: "XYZ",
              hasMetric: true,
            },
          ],
        },
        {
          id: "exp-2",
          title: "Full Stack Developer Intern",
          subtitle: "Nexus Web Technologies",
          location: "San Jose, CA",
          startDate: "Jun 2022",
          endDate: "Aug 2022",
          isCurrent: false,
          bulletPoints: [
            {
              id: "bp-exp-2-1",
              text: "Built real-time collaborative workspace interface using Next.js, WebSockets, and TypeScript for 15,000+ daily active users.",
              framework: "STAR",
              hasMetric: true,
            },
            {
              id: "bp-exp-2-2",
              text: "Automated end-to-end integration testing pipeline with Playwright and GitHub Actions, boosting test coverage from 62% to 91%.",
              framework: "XYZ",
              hasMetric: true,
            },
          ],
        },
      ],
    },
    {
      id: "sec-sample-proj",
      sectionType: "PROJECTS",
      title: "Technical Projects",
      orderIndex: 2,
      isVisible: true,
      items: [
        {
          id: "proj-1",
          title: "Distributed Key-Value Store",
          subtitle: "Go, Raft Consensus, gRPC",
          techStack: ["Go", "Raft", "gRPC", "Docker"],
          url: "https://github.com/alexmorgan/raft-kv",
          startDate: "Jan 2024",
          endDate: "May 2024",
          isCurrent: false,
          bulletPoints: [
            {
              id: "bp-proj-1",
              text: "Engineered fault-tolerant replicated state machine implementing Raft consensus, sustaining network partitions with 99.9% uptime.",
              framework: "STAR",
            },
            {
              id: "bp-proj-2",
              text: "Benchmark tested cluster across 5 AWS nodes, achieving 12,000 read transactions per second under 5ms latency.",
              framework: "XYZ",
              hasMetric: true,
            },
          ],
        },
        {
          id: "proj-2",
          title: "AI Semantic Code Search Engine",
          subtitle: "Python, FastAPI, Vector DB, Docker",
          techStack: ["Python", "FastAPI", "Pinecone", "OpenAI API"],
          url: "https://github.com/alexmorgan/ai-search",
          startDate: "Sep 2023",
          endDate: "Dec 2023",
          isCurrent: false,
          bulletPoints: [
            {
              id: "bp-proj-2-1",
              text: "Architected semantic vector search engine indexing 250,000+ code repositories using hybrid BM25 and OpenAI embeddings.",
              framework: "STAR",
            },
            {
              id: "bp-proj-2-2",
              text: "Optimized retrieval latency to under 38ms using Redis caching and asynchronous batch embedding generation.",
              framework: "XYZ",
              hasMetric: true,
            },
          ],
        },
      ],
    },
  ],
  skillGroups: [
    {
      id: "sg-1",
      categoryName: "Languages",
      skills: ["TypeScript", "Go", "Python", "C++", "SQL", "HTML/CSS"],
      orderIndex: 0,
    },
    {
      id: "sg-2",
      categoryName: "Frameworks & Developer Tools",
      skills: ["React", "Next.js", "Node.js", "Docker", "PostgreSQL", "Redis", "Git", "AWS", "Kafka", "Linux"],
      orderIndex: 1,
    },
  ],
};
