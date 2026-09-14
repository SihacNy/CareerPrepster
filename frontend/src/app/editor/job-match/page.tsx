"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { Target, ArrowLeft, Sparkles, CheckCircle2, Search, FileText } from "lucide-react";
import { useCV } from "@/lib/store";

export default function JobMatchPage() {
  const router = useRouter();
  const { targetJobDescription, setTargetJobDescription, saveDraft } = useCV();


  const handleContinue = () => {
    saveDraft();
    router.push("/editor/ats");
  };

  const handleSkip = () => {
    saveDraft();
    router.push("/editor/ats");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header currentStage={2} />
      <EditorStepper currentStage={2} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col justify-center">
        {/* Header Title Section */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="flex items-start sm:items-center gap-3 mb-2.5">
            <Link
              href="/editor"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors shrink-0 mt-0.5 sm:mt-0"
              title="Back to CV Editor"
              aria-label="Back to CV Editor"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <Target className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Targeted Role Job Description Matcher
              </h1>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                Optional
              </span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl sm:pl-12">
            Paste the job requirements or posting text below to calculate your keyword alignment, audit ATS compliance, and discover missing skills.
          </p>
        </div>

        {/* Compact Job Description Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Job Description Text</span>
            </span>
          </div>

          <textarea
            rows={5}
            value={targetJobDescription}
            onChange={(e) => setTargetJobDescription(e.target.value)}
            placeholder="Paste full job requirements or posting text here (e.g. We are seeking a Software Engineer with experience in React, TypeScript, Node.js, PostgreSQL, Docker, and REST API development. Ideal candidate has strong problem-solving skills and experience with scalable cloud services)..."
            className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all leading-relaxed placeholder:text-slate-400 min-h-[130px] sm:min-h-[150px] max-h-[320px] resize-y shadow-2xs"
          />

          {/* Quick value highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5 text-xs text-slate-600">
              <Search className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block mb-0.5">Keyword Match Rate</span>
                <span>Scans required tech skills against your resume bullets.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block mb-0.5">Skill Gap Analysis</span>
                <span>Flags missing qualifications to add before applying.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block mb-0.5">Tailored Recommendations</span>
                <span>Prepares customized STAR bullet enhancements for this role.</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-colors"
            >
              Skip now
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm cursor-pointer"
            >
              <span>Continue to ATS Review</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
