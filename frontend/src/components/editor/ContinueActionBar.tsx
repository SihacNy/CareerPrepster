"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Target, X } from "lucide-react";
import { useCV } from "@/lib/store";

export function ContinueActionBar() {
  const router = useRouter();
  const { saveDraft, lastSaved, isDirty, targetJobDescription, setTargetJobDescription } = useCV();
  const [isSaving, setIsSaving] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    saveDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleContinueClick = () => {
    setShowJdModal(true);
  };

  const handleProceedToAts = () => {
    saveDraft();
    setShowJdModal(false);
    router.push("/editor/ats");
  };

  const handleSkipNow = () => {
    saveDraft();
    setShowJdModal(false);
    router.push("/editor/ats");
  };

  return (
    <>
      <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 py-3 sm:py-4.5 px-3 sm:px-8 shadow-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Draft saved status */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium shrink-0">
            {isDirty ? (
              <span className="inline-flex items-center text-amber-600 whitespace-nowrap">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 mr-1.5 sm:mr-2 shrink-0" />
                Unsaved changes
              </span>
            ) : lastSaved ? (
              <span className="inline-flex items-center text-emerald-700 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600 mr-1.5 sm:mr-2 shrink-0" />
                Draft saved at {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : (
              <span className="inline-flex items-center text-slate-400 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-slate-400 mr-1.5 sm:mr-2 shrink-0" />
                Draft ready
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <span>{isSaving ? "Saving..." : "Save Draft"}</span>
            </button>

            <button
              type="button"
              onClick={handleContinueClick}
              className="inline-flex items-center px-3.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[15px] font-semibold rounded-lg sm:rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm group whitespace-nowrap"
            >
              <span>Continue to ATS Review</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Targeted Role Job Description Matcher Interstitial Modal */}
      {showJdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <Target className="w-6 h-6 text-sky-600 shrink-0" />
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Targeted Role Job Description Matcher
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Optional
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowJdModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Paste the job requirements or posting text below to calculate your keyword alignment and discover missing skills.
            </p>

            {/* Textarea */}
            <div>
              <textarea
                rows={5}
                value={targetJobDescription}
                onChange={(e) => setTargetJobDescription(e.target.value)}
                placeholder="Paste full job description text here (e.g. Looking for Software Engineer with React, Node.js, Docker, MySQL, and REST API experience)..."
                className="w-full text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors leading-relaxed placeholder:text-slate-400 min-h-[130px] resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                You can also paste or refine this anytime directly on the ATS Review screen.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSkipNow}
                className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-colors"
              >
                Skip now
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJdModal(false)}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProceedToAts}
                  className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
                >
                  <span>Continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
