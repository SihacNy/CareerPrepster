"use client";

import React from "react";
import Link from "next/link";
import { PenLine, Eye, ArrowLeft } from "lucide-react";
import { useCV } from "@/lib/store";

export function MobileViewToggle() {
  const { mobileView, setMobileView } = useCV();

  return (
    <>
      {/* Top Segmented Control (Visible only on mobile/tablet < 1024px) */}
      <div className="lg:hidden w-full bg-white border-b border-slate-200 px-3 py-1.5 sticky top-14 sm:top-16 z-30 flex items-center justify-between gap-2">
        <Link
          href="/editor/templates"
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="Back to Template Selection"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-1 max-w-sm bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMobileView("form")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1 rounded-md font-semibold transition-all ${
              mobileView === "form"
                ? "bg-white text-sky-700 shadow-subtle border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Edit Form</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1 rounded-md font-semibold transition-all ${
              mobileView === "preview"
                ? "bg-white text-sky-700 shadow-subtle border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Floating 1-Tap Toggle Pill for Mobile */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setMobileView(mobileView === "form" ? "preview" : "form")}
          className="inline-flex items-center px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-card transition-transform active:scale-95"
        >
          {mobileView === "form" ? (
            <>
              <Eye className="w-4 h-4 mr-1.5" />
              <span>Preview CV</span>
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4 mr-1.5" />
              <span>Back to Form</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
