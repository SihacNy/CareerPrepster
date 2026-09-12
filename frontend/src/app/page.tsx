"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  UploadCloud, 
  PenLine, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  BarChart3
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export default function LandingPage() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Craft High-Impact CVs That Pass Every{" "}
              <span className="text-sky-600 underline decoration-sky-300 underline-offset-4">
                ATS Screener
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Harvard &amp; tech-standard templates, pre-curated starter bullets for software engineers &amp; analysts, and in-line STAR/XYZ AI refinement.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-subtle group"
              >
                <span>Start Building CV</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <Link
                href="/editor"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Open CV Studio Editor
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 flex-shrink-0" />
                <span>Zero Formatting Breakage</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 flex-shrink-0" />
                <span>100% Free Open Templates</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 flex-shrink-0" />
                <span>Explainable 4-Pillar ATS Rubric</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Pillars Grid */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Everything You Need from Blank Page to Job Offer
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Engineered around the requirements of top university career services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    ATS Layout Templates
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Harvard Classic &amp; Jake&apos;s Tech Resume. Single-column layouts guaranteed to parse accurately through Workday, Greenhouse, and Lever.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-4">
                    <PenLine className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    STAR/XYZ Refine with AI
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Turn plain task descriptions into quantifiable impact bullets with active verbs and measurable outcomes. You stay in full control.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-4">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    Universal ATS Scoring
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Audit your CV across Parsability, Action Verbs, Skills Taxonomy, and Length before submitting to job portals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} CareerPrepster. Built for university students.</p>
      </footer>

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
