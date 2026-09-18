"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PenLine, LayoutTemplate } from "lucide-react";

interface StageActionsProps {
  isFromUpload?: boolean;
}

export function StageActions({ isFromUpload = false }: StageActionsProps) {
  return (
    <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 py-3 sm:py-4.5 px-3 sm:px-8 shadow-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left Action */}
        <div>
          <Link
            href="/editor"
            className="inline-flex items-center px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-slate-500 shrink-0" />
            <span>Back to Editor</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {isFromUpload ? (
            <>
              <Link
                href="/editor"
                className="inline-flex items-center px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
              >
                <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-slate-500 shrink-0" />
                <span>Skip to Editor</span>
              </Link>
              <Link
                href="/editor/templates?from=upload"
                className="inline-flex items-center px-3.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[15px] font-semibold rounded-lg sm:rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm group whitespace-nowrap"
              >
                <LayoutTemplate className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
                <span>Choose Template &amp; Edit</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </>
          ) : (
            <Link
              href="/editor/export"
              className="inline-flex items-center px-3.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[15px] font-semibold rounded-lg sm:rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm group whitespace-nowrap"
            >
              <span>Continue to Export PDF</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
