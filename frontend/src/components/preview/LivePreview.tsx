"use client";

import React from "react";
import { useCV } from "@/lib/store";
import { CVTemplateRenderer } from "./CVTemplateRenderer";
import { Eye } from "lucide-react";

export function LivePreview() {
  const { cvData } = useCV();

  return (
    <div className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
          <Eye className="w-4 h-4 text-sky-600" />
          <span>Live Document Preview</span>
        </div>
      </div>

      {/* Rendered Resume Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
        <div className="w-full shadow-card border border-slate-300 rounded-sm bg-white">
          <CVTemplateRenderer data={cvData} />
        </div>
      </div>
    </div>
  );
}

