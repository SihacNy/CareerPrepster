"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import {
  Users,
  HeartHandshake,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  CheckCircle2,
  Github,
  Linkedin,
  Camera,
  Compass,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl?: string;
  tags: string[];
  githubUrl?: string;
  linkedinUrl?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-1",
    name: "Sihac Ny",
    role: "Full-Stack Architecture & Lead",
    initials: "SN",
    photoUrl: "/team/ny-sihac.png",
    bio: "Spearheading system architecture, Next.js 14 App Router integration, Prisma MySQL persistence, and client-side vector PDF generation.",
    tags: ["Next.js", "Express", "Prisma", "MySQL"],
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
  },
  {
    id: "member-2",
    name: "Kuy Visal",
    role: "AI & ATS Scoring Engine",
    initials: "KV",
    photoUrl: "/team/kuy-visal.png",
    bio: "Engineering the 4-pillar ATS diagnostic rubric (Parsability, Impact, Skills, Readability) and Groq LPU / Gemini STAR & XYZ wording assistants.",
    tags: ["LLM Engineering", "Groq API", "ATS Parsing", "Python"],
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
  },
  {
    id: "member-3",
    name: "Kouch Bunpor",
    role: "Frontend & Template Design",
    initials: "KB",
    photoUrl: "/team/kuoch-bunpor.png",
    bio: "Crafting single-column Harvard & Modern ATS archetypes, responsive editor workspaces, and accessible micro-interactions with Tailwind CSS.",
    tags: ["React", "Tailwind CSS", "UI/UX", "Design Systems"],
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
  },
  {
    id: "member-4",
    name: "Ros Rendo",
    role: "Backend Services & DevOps",
    initials: "RR",
    photoUrl: "/team/ros-rendo.png",
    bio: "Managing Docker multi-container environments, JWT session security, multipart resume import parsing (PDF/DOCX), and database migrations.",
    tags: ["Docker", "Node.js ESM", "DevOps", "REST APIs"],
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
  },
];

export default function AboutPage() {
  // Horizontal team photo source
  const teamHeroPhotoUrl = "/team/hero.jpg";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate py-16 sm:py-24 bg-white border-b border-slate-200/80 overflow-hidden">
          {/* Subtle Background Pattern */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.45,
            }}
            aria-hidden="true"
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            {/* Mission Label */}
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
              <HeartHandshake className="w-5 h-5 text-amber-500" />
              <span>Built by Students, for Students</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Ending the Design Nightmare in Graduate CVs
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We built CareerPrepster with one core belief: university students shouldn&apos;t have to be graphic designers to land their first job. We take care of 100% of formatting, hierarchy, and machine parsability so you can focus solely on your accomplishments.
            </p>
          </div>

          {/* Big Horizontal Team Image Banner */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
            <div className="aspect-[3/2] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-xl relative">
              {teamHeroPhotoUrl ? (
                <img
                  src={teamHeroPhotoUrl}
                  alt="CareerPrepster Project Team"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-100 via-sky-50/60 to-slate-200 flex flex-col items-center justify-center text-center p-6 sm:p-10">
                  <div className="space-y-3 max-w-md">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200 shadow-md text-sky-600 flex items-center justify-center mx-auto">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-sky-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">
                      Team Collaboration Photograph
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Big horizontal photo slot (16:9 widescreen format). Image will be rendered here once your team photo is uploaded.
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/80 text-slate-600 border border-slate-200/80 shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-sky-500" />
                      <span>Slot ready for team image</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Narrative / "Why We Are Doing This" Section */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                The Student Experience Gap
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why We Built CareerPrepster
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                As undergraduate students preparing for internships and full-time engineering roles, we experienced the exact same frustration every graduate faces.
              </p>
            </div>

            {/* 3 Pillar Problem & Solution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <Layers className="w-6 h-6 text-amber-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    The Design Trap
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Students waste dozens of hours agonizing over Canva palettes, dual-column margins, and graphic icons instead of polishing their project descriptions and measurable outcomes.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  Wasted time on decorative cosmetics
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <ShieldCheck className="w-6 h-6 text-rose-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    The ATS Black Hole
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Unbeknownst to students, corporate hiring systems (Workday, Greenhouse, Taleo) break on complex graphic columns, dropping entire work experiences and failing keyword scans before human review.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  Silent rejections from machine parsers
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    The Solution: Content First
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    CareerPrepster eliminates graphic guesswork completely. We lock your resume into single-column, ATS-certified typography, while AI coaches guide you through proven STAR &amp; XYZ bullet frameworks.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  100% parsable &amp; vector PDF export
                </div>
              </div>
            </div>

            {/* Quote Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-sky-900 text-white relative overflow-hidden shadow-xl">
              <div
                className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="max-w-3xl space-y-3 relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Our Mission Statement
                </p>
                <p className="text-base sm:text-xl font-semibold leading-relaxed">
                  &ldquo;A computer science or business graduate should be hired for what they engineered, solved, and delivered—not rejected because their resume template used a two-column table.&rdquo;
                </p>
                <p className="text-xs text-sky-200 pt-1">
                  — The CareerPrepster Development Team
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section id="team" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                The Builders
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Meet the Team Behind CareerPrepster
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Computer science and software engineering students dedicated to empowering peers into top technical and business roles.
              </p>
            </div>

            {/* Team Members Grid with Circular Image Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between text-center"
                >
                  <div>
                    {/* Circular Image Slot */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-full border-4 border-slate-100 group-hover:border-sky-200 shadow-md overflow-hidden bg-gradient-to-tr from-sky-100 via-slate-100 to-sky-50 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-sky-600 transition-colors">
                          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-700 group-hover:text-sky-600">
                            {member.initials}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            Photo slot
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Member Name */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {member.name}
                    </h3>

                    {/* Role */}
                    <p className="text-xs font-semibold text-sky-600 mt-1">
                      {member.role}
                    </p>

                    {/* Short Bio */}
                    <p className="text-xs text-slate-600 leading-relaxed mt-3">
                      {member.bio}
                    </p>
                  </div>

                  {/* Skills & Social Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    {/* Tech Badges */}
                    <div className="flex flex-wrap justify-center gap-1">
                      {member.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-2 pt-1 text-slate-400">
                      {member.githubUrl && (
                        <a
                          href={member.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          aria-label={`${member.name} on GitHub`}
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Bar */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to Craft an ATS-Certified CV?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Skip the graphic design struggle. Choose from tested Ivy League &amp; tech standard templates with zero content loss.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/editor/templates"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-subtle group"
              >
                <span>Choose a Template to Start</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/interview"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Practice Interview Coach
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
