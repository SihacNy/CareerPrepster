"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What makes CareerPrepster templates ATS-friendly?",
    category: "Templates & Parsability",
    answer:
      "Our templates (Harvard Classic and Jake's Tech) use single-column, table-free structures strictly adhering to standard section headings (Education, Experience, Projects, Skills) and clean typography. They are tested to parse without character dropping or hierarchy confusion in Workday, Greenhouse, Taleo, and Lever.",
  },
  {
    id: "faq-2",
    question: "How does the 4-Pillar ATS scoring system work?",
    category: "Scoring Engine",
    answer:
      "The scoring engine audits your resume across 4 objective pillars: Parsability & Structure (25%), Impact & Action Verbs using Google's XYZ formula (30%), Technical Skills Taxonomy (25%), and Document Brevity & Word Count (20%). It provides instant, itemized recommendations you can fix in 1-click.",
  },
  {
    id: "faq-3",
    question: "How does the AI Refinement (STAR / XYZ) work?",
    category: "AI Features",
    answer:
      "Select any bullet point in your experience or projects and click 'Refine with AI'. The assistant analyzes your text and transforms generic descriptions into high-impact accomplishments using the STAR (Situation, Task, Action, Result) and Google XYZ ('Accomplished [X] as measured by [Y], by doing [Z]') frameworks.",
  },
  {
    id: "faq-4",
    question: "Can I tailor my resume to a specific job posting?",
    category: "Job Matching",
    answer:
      "Yes! Simply paste any job description into the Target Job Description Matcher in the ATS Review stage. CareerPrepster automatically extracts required skills, compares them against your resume, and provides a 1-click button to auto-insert missing keywords into your CV.",
  },
  {
    id: "faq-5",
    question: "Is CareerPrepster free to use?",
    category: "Pricing & Access",
    answer:
      "Yes, CareerPrepster is 100% free for students and university graduates. You can create unlimited resumes, run unlimited ATS diagnostic audits, and export crisp, high-resolution vector PDFs with zero paywalls or watermarks.",
  },
  {
    id: "faq-6",
    question: "Is my personal resume data kept private and secure?",
    category: "Privacy & Security",
    answer:
      "Absolutely. Your CV drafts are saved locally in your browser session with real-time auto-saving. We do not sell your contact information or resume contents to recruiters, brokers, or third-party marketing networks.",
  },
];

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-sky-950 text-white border-t border-sky-800 relative overflow-hidden">
      {/* Background SVG Grid & Dot Matrix Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_75%)]">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Grid Pattern */}
            <pattern
              id="faq-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-sky-500/15"
              />
              <circle
                cx="0"
                cy="0"
                r="1.5"
                fill="currentColor"
                className="text-sky-300/35"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-grid)" />
        </svg>
      </div>

      {/* Ambient Gradient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-800/90 text-sky-200 border border-sky-700/80 mb-3.5 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Got Questions? We&apos;ve Got Answers
          </h2>
          <p className="mt-3 text-sm sm:text-base text-sky-200 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about ATS parsability, AI bullet optimization, and export standards.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-sky-800/90 border-sky-400 shadow-md ring-1 ring-sky-400/40"
                    : "bg-sky-950/40 border-sky-800/70 hover:border-sky-500 hover:bg-sky-800/40"
                }`}
              >
                {/* Question Trigger */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-bold text-white">
                      {item.question}
                    </span>
                  </div>

                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isOpen
                        ? "bg-sky-600 text-white rotate-180 shadow-xs"
                        : "bg-sky-800/70 text-sky-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Collapsible Answer */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-sky-100 leading-relaxed border-t border-sky-700/60 animate-in fade-in duration-200">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-sky-800/50 border border-sky-700/80 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Ready to test your resume?
            </h3>
            <p className="text-xs text-sky-200 mt-1">
              Start building with Harvard &amp; Jake&apos;s Tech templates or upload your existing CV.
            </p>
          </div>

          <a
            href="/editor"
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-sky-900 bg-white hover:bg-sky-50 transition-colors shadow-sm flex-shrink-0"
          >
            Launch Free CV Studio
          </a>
        </div>
      </div>
    </section>
  );
}
