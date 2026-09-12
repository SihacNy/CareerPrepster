"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Save } from "lucide-react";
import { useCV } from "@/lib/store";

export function ContinueActionBar() {
  const router = useRouter();
  const { saveDraft, lastSaved, isDirty } = useCV();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    saveDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleContinue = () => {
    saveDraft();
    router.push("/editor/ats");
  };

  return (
    <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 py-3.5 px-4 sm:px-6 shadow-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Draft saved status */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          {isDirty ? (
            <span className="inline-flex items-center text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
              Unsaved changes
            </span>
          ) : lastSaved ? (
            <span className="inline-flex items-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
              Draft saved at {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : (
            <span className="inline-flex items-center text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-slate-400 mr-1.5" />
              Draft ready
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-subtle group"
          >
            <span>Continue to ATS Review</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
