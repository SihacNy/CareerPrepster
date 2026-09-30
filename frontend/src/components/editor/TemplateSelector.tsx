"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  ChevronDown,
  Check,
  Sparkles,
  ShieldCheck,
  Type,
  Maximize2,
  X,
  ArrowRight,
} from "lucide-react";
import { useCV } from "@/lib/store";
import { TEMPLATE_CATALOG, TemplateDefinition } from "@/types/templates";

export function TemplateSelector({
  isOpen,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
} = {}) {
  const { cvData, setTemplateId } = useCV();
  const [internalOpen, setInternalOpen] = useState(true);
  const [comparingTemplate, setComparingTemplate] = useState<TemplateDefinition | null>(null);

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  const activeTemplate =
    TEMPLATE_CATALOG.find((t) => t.id === cvData.templateId) || TEMPLATE_CATALOG[0];

  return (
    <div
      id="section-template"
      className="w-full bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-2xs scroll-mt-24 transition-all"
    >
      {/* Header / Collapse Bar */}
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${
          isSectionOpen ? "mb-3" : "mb-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isSectionOpen ? "" : "-rotate-90"
            }`}
          />
          <label className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2 cursor-pointer">
            <LayoutTemplate className="w-4 h-4 text-sky-600" />
            Resume Template & Typography
          </label>
        </div>

        {!isSectionOpen && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md">
              {activeTemplate.name}
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {activeTemplate.fontCategory === "serif" ? "Serif" : "Sans-Serif"}
            </span>
          </div>
        )}
      </div>

      {isSectionOpen && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
            <p className="leading-relaxed">
              Select an ATS-certified single-column document layout. Both styles guarantee 100% machine parsability.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/editor/templates"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/90 px-2.5 py-1 rounded-lg transition-colors group"
              >
                <span>Browse Template Gallery</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ATS Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATE_CATALOG.map((template) => {
              const isSelected = cvData.templateId === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setTemplateId(template.id)}
                  className={`group relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/20 shadow-sm ring-2 ring-sky-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                  }`}
                >
                  {/* Card Top Row: Title, Badge & Active Check */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                            {template.name}
                          </h4>
                          {template.badge && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                template.id === "classic"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}
                            >
                              {template.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{template.subtitle}</p>
                      </div>

                      {/* Selection Indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-sky-600 text-white shadow-2xs scale-105"
                            : "border border-slate-300 text-transparent group-hover:border-slate-400"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Miniature Visual Mockup */}
                    <div
                      className={`w-full h-24 rounded-lg border p-2.5 mb-3 select-none flex flex-col justify-between transition-colors ${
                        isSelected
                          ? "bg-white border-sky-200"
                          : "bg-slate-50 border-slate-200/80 group-hover:bg-white"
                      }`}
                    >
                      {template.id === "classic" ? (
                        // Harvard Classic: Centered Header, Serif feel, Divider Line
                        <div className="w-full flex flex-col items-center space-y-1">
                          <div className="w-24 h-2 bg-slate-800 rounded-xs" />
                          <div className="w-36 h-1 bg-slate-400 rounded-xs" />
                          <div className="w-full border-b border-slate-400 my-1" />
                          <div className="w-full flex items-center justify-between px-1">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-xs" />
                            <div className="w-8 h-1 bg-slate-400 rounded-xs" />
                          </div>
                          <div className="w-full space-y-1 px-1 pt-0.5">
                            <div className="w-11/12 h-1 bg-slate-300 rounded-xs" />
                            <div className="w-4/5 h-1 bg-slate-300 rounded-xs" />
                          </div>
                        </div>
                      ) : (
                        // Jake's Tech: Left Header with pipe, Modern Line, Technical Layout
                        <div className="w-full flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="w-20 h-2 bg-sky-900 rounded-xs" />
                            <div className="w-24 h-1 bg-slate-400 rounded-xs" />
                          </div>
                          <div className="w-full border-b border-slate-300 my-1" />
                          <div className="flex items-center justify-between">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-xs" />
                            <div className="w-10 h-1 bg-slate-400 rounded-xs" />
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <div className="w-full h-1 bg-slate-300 rounded-xs" />
                            <div className="w-5/6 h-1 bg-slate-300 rounded-xs" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                        <span className="font-mono">{template.fontFamily.split("/")[0].trim()}</span>
                        <span className="text-[9px] font-semibold text-emerald-600">ATS 100</span>
                      </div>
                    </div>

                    {/* Typography & ATS Pill Row */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Type className="w-3 h-3 text-slate-500" />
                        {template.fontCategory === "serif" ? "Traditional Serif" : "Modern Sans-Serif"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {template.fontFamily}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Recommended Roles Pills */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Best For:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {template.recommendedIndustries.map((ind) => (
                          <span
                            key={ind}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setComparingTemplate(template);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-sky-700 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Compare details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateId(template.id)}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-2xs pointer-events-none"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isSelected ? "Active Layout" : "Use Template"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template Comparison Modal */}
      {comparingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {comparingTemplate.name}
                  </h3>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    {comparingTemplate.subtitle}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Typography: {comparingTemplate.fontFamily} ({comparingTemplate.fontCategory})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComparingTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="font-medium text-slate-800">{comparingTemplate.description}</p>
              
              <div>
                <span className="font-bold text-slate-900 block mb-1">Key Layout Highlights:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {comparingTemplate.previewFeatures.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Recommended Target Industries:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {comparingTemplate.recommendedIndustries.map((ind) => (
                    <span
                      key={ind}
                      className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-md font-medium text-[11px]"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setComparingTemplate(null)}
                className="py-2 px-3 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateId(comparingTemplate.id);
                  setComparingTemplate(null);
                }}
                className="py-2 px-4 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-2xs"
              >
                Apply This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
