"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCV } from "@/lib/store";

export function ContinueActionBar() {
  const router = useRouter();
  const { cvData, setCVData, saveDraft, lastSaved, isDirty } = useCV();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    saveDraft();

    try {
      const { cvApi } = await import("@/lib/api");
      if (cvData.id && !cvData.id.startsWith("cv-draft-")) {
        await cvApi.update(cvData.id, cvData);
      } else {
        // Attempt cloud creation if logged in
        const res = await cvApi.create(cvData);
        if (res?.id) {
          setCVData({ ...cvData, id: res.id });
        }
      }
    } catch (err) {
      // Offline, guest user, or network error: local draft is already preserved
      console.info("Cloud sync note: saved locally (backend offline or unauthenticated).");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    saveDraft();
    try {
      const { cvApi } = await import("@/lib/api");
      if (cvData.id && !cvData.id.startsWith("cv-draft-")) {
        cvApi.update(cvData.id, cvData).catch(() => {});
      }
    } catch (e) {}
    router.push("/editor/job-match");
  };

  return (
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
            onClick={handleContinue}
            className="inline-flex items-center px-3.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[15px] font-semibold rounded-lg sm:rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm group whitespace-nowrap"
          >
            <span>Continue to ATS Review</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
