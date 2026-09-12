"use client";

import React from "react";
import { useCV } from "@/lib/store";
import { ClassicAts } from "./templates/ClassicAts";
import { ModernCompact } from "./templates/ModernCompact";
import { Layers, Eye, Sparkles } from "lucide-react";

export function LivePreview() {
  const { cvData, setTemplateId } = useCV();

  return (
    <div className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
          <Eye className="w-4 h-4 text-sky-600" />
          <span>Live Document Preview</span>
        </div>

        {/* Template Switcher Tabs */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold shadow-2xs">
          <button
            type="button"
            onClick={() => setTemplateId("classic")}
            className={`px-3 py-1.5 rounded-lg transition-all ${cvData.templateId === "classic"
                ? "bg-white text-sky-700 shadow-subtle border border-slate-200/80 font-semibold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Harvard Classic
          </button>
          <button
            type="button"
            onClick={() => setTemplateId("modern")}
            className={`px-3 py-1.5 rounded-lg transition-all ${cvData.templateId === "modern"
                ? "bg-white text-sky-700 shadow-subtle border border-slate-200/80 font-semibold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Jake&apos;s Tech
          </button>
        </div>
      </div>

      {/* Rendered Resume Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
        <div className="w-full shadow-card border border-slate-300 rounded-sm bg-white">
          {cvData.templateId === "classic" ? (
            <ClassicAts data={cvData} />
          ) : (
            <ModernCompact data={cvData} />
          )}
        </div>
      </div>
    </div>
  );
}
