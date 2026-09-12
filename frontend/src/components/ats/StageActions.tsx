"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";

interface StageActionsProps {
  isFromUpload?: boolean;
}

export function StageActions({ isFromUpload = false }: StageActionsProps) {
  return (
    <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 py-3.5 px-4 sm:px-6 shadow-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Action */}
        <div>
          <Link
            href="/editor"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Back to Editor</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isFromUpload && (
            <Link
              href="/editor"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Improve in Editor</span>
            </Link>
          )}

          <Link
            href="/editor/export"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-subtle group"
          >
            <span>Continue to Export PDF</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
