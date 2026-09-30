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
  BarChart3,
  LayoutGrid
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { FAQSection } from "@/components/landing/FAQSection";

export default function LandingPage() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 bg-white">
          {/* Left Side Hire Illustration (Zero Layout Impact) */}
          <div className="hidden lg:block absolute left-[-30px] xl:left-6 2xl:left-16 top-1/2 -translate-y-1/2 w-56 xl:w-72 2xl:w-80 pointer-events-none select-none z-0 opacity-40 xl:opacity-90 transition-opacity">
            <img
              src="/illustrations/hire.svg"
              alt=""
              aria-hidden="true"
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>

          {/* Right Side Resume Illustration (Zero Layout Impact) */}
          <div className="hidden lg:block absolute right-[-30px] xl:right-6 2xl:right-16 top-1/2 -translate-y-1/2 w-56 xl:w-72 2xl:w-80 pointer-events-none select-none z-0 opacity-40 xl:opacity-90 transition-opacity">
            <img
              src="/illustrations/resume.svg"
              alt=""
              aria-hidden="true"
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Craft High-Impact CVs That Pass Every{" "}
              <span className="text-sky-600 underline decoration-yellow-300 underline-offset-4">
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
        <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                How Do You Turn a Blank Page into a Top Job Offer?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
                Built around the rigorous screening requirements of enterprise ATS platforms and top university career guidelines.
              </p>
            </div>

            {/* Illustration */}
            <div className="flex justify-center my-8 sm:my-10">
              <div className="w-full max-w-sm sm:max-w-md px-4">
                <img
                  src="/illustrations/question.svg"
                  alt="Career and resume guidance illustration"
                  className="w-full h-auto max-h-60 sm:max-h-72 object-contain mx-auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="group relative p-6 rounded-xl bg-white border border-slate-200/90 shadow-card hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <Layers className="w-7 h-7 text-sky-600 mb-3.5 group-hover:scale-110 group-hover:text-sky-500 transition-transform duration-300" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-950 text-base transition-colors">
                    ATS Layout Templates
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Harvard Classic &amp; Jake&apos;s Tech Resume. Single-column layouts guaranteed to parse accurately through Workday, Greenhouse, and Lever.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative p-6 rounded-xl bg-white border border-slate-200/90 shadow-card hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <PenLine className="w-7 h-7 text-sky-600 mb-3.5 group-hover:scale-110 group-hover:text-sky-500 transition-transform duration-300" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-950 text-base transition-colors">
                    STAR/XYZ Refine with AI
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Turn plain task descriptions into quantifiable impact bullets with active verbs and measurable outcomes. You stay in full control.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative p-6 rounded-xl bg-white border border-slate-200/90 shadow-card hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <BarChart3 className="w-7 h-7 text-sky-600 mb-3.5 group-hover:scale-110 group-hover:text-sky-500 transition-transform duration-300" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-950 text-base transition-colors">
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

        {/* Our Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-white border-b border-slate-200 scroll-mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight inline-flex items-center justify-center gap-3">
                <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600" />
                <span>Our Features</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Everything you need to craft an ATS-optimized CV and master behavioral and technical interview questions.
              </p>
            </div>

            {/* Feature Cards Grid (matching the 2 header features) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1: CV Editor */}
              <Link
                href="/editor"
                className="group relative p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-7 h-7 text-sky-600 group-hover:scale-110 group-hover:text-sky-500 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-sky-950 transition-colors">
                      CV Editor
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    Build professional ATS-tested resumes using Harvard Classic and Jake&apos;s Tech standard templates. Includes STAR/XYZ bullet AI refinement and instant vector PDF export.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                      ATS Templates
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                      STAR/XYZ Refinement
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                      Vector PDF Export
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-sky-600 group-hover:text-sky-700">
                  <span>Open CV Editor</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Interview Coach */}
              <Link
                href="/interview"
                className="group relative p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-7 h-7 text-sky-600 group-hover:scale-110 group-hover:text-sky-500 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-sky-950 transition-colors">
                      Interview Coach
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    Practice real-world behavioral and technical mock interviews derived directly from your resume claims. Features adaptive follow-up probing and immediate rubric scoring.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                      STAR Feedback
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                      Adaptive Probing
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                      CV Feedback Loop
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-sky-600 group-hover:text-sky-700">
                  <span>Start Interview Coach</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <FAQSection />
      </main>

      {/* Rich Multi-Column Footer */}
      <Footer />

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
