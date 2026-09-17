"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Check, Cloud, HardDrive } from "lucide-react";
import { useCV } from "@/lib/store";

export function ContinueActionBar() {
  const router = useRouter();
  const { cvData, setCVData, saveDraft, lastSaved, isDirty, persistence } = useCV();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = async () => {
    if (saveStatus === "saving") return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setSaveStatus("saving");
    await saveDraft();

    const startTime = Date.now();
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, 450 - elapsed);

    setTimeout(() => {
      setSaveStatus("saved");
      timerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, delay);
  };

  const handleContinue = async () => {
    // Block progression to ATS Review until the required fields are complete.
    const saved = await saveDraft();
    if (!saved) return;
    router.push("/editor/job-match");
  };

  // Determine save source label
  const getSaveSourceLabel = () => {
    if (!lastSaved) return "Draft ready";
    if (persistence.saveSource === "cloud") return `Synced to cloud at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return `Saved locally at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 py-3 sm:py-4.5 px-3 sm:px-8 shadow-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Draft saved status with source indicator */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium shrink-0">
          {isDirty ? (
            <span className="inline-flex items-center text-amber-600 whitespace-nowrap">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 mr-1.5 sm:mr-2 shrink-0" />
              Unsaved changes
            </span>
          ) : lastSaved ? (
            <span className="inline-flex items-center text-emerald-700 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600 mr-1.5 sm:mr-2 shrink-0" />
              {getSaveSourceLabel()}
              {persistence.saveSource === "cloud" && (
                <span title="Saved to cloud"><Cloud className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 text-sky-600 shrink-0" /></span>
              )}
              {persistence.saveSource === "local" && (
                <span title="Saved locally"><HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 text-slate-500 shrink-0" /></span>
              )}
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
            disabled={saveStatus === "saving"}
            className="inline-flex items-center justify-center min-w-[104px] sm:min-w-[124px] px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all duration-200 shadow-2xs whitespace-nowrap select-none cursor-pointer disabled:cursor-wait"
          >
            {saveStatus === "saving" && (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin text-slate-500 shrink-0" />
            )}
            {saveStatus === "saved" && (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-slate-700 animate-checkmark-pop stroke-[2.5] shrink-0" />
            )}
            <span className="transition-opacity duration-150">
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                ? "Saved!"
                : "Save Draft"}
            </span>
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
