"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { useCV } from "@/lib/store";
import {
  TEMPLATE_CATALOG,
  TemplateDefinition,
  SAMPLE_CV_FOR_PREVIEW,
} from "@/types/templates";
import { ClassicAts } from "@/components/preview/templates/ClassicAts";
import { ModernCompact } from "@/components/preview/templates/ModernCompact";
import { ExecutiveAccent } from "@/components/preview/templates/ExecutiveAccent";
import { ModernPhoto } from "@/components/preview/templates/ModernPhoto";
import { COLOR_PALETTES, TemplateArchetype } from "@/types/templates";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Maximize2,
  Type,
  X,
  Layers,
  FileCheck,
  Loader2,
  Palette,
  Camera,
} from "lucide-react";

function TemplateGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromUpload = searchParams.get("from") === "upload";
  const { cvData, setTemplateId, setAccentColor } = useCV();

  const [activeArchetype, setActiveArchetype] = useState<"all" | TemplateArchetype>("all");
  const [modalTemplate, setModalTemplate] = useState<TemplateDefinition | null>(null);

  // Filter templates
  const filteredTemplates = TEMPLATE_CATALOG.filter((t) => {
    if (activeArchetype === "all") return true;
    if (activeArchetype === "visual-photo") return t.supportsPhoto;
    if (activeArchetype === "color-accent") return t.supportsColor;
    return t.archetype === activeArchetype;
  });

  const activeTemplate =
    TEMPLATE_CATALOG.find((t) => t.id === cvData.templateId) || TEMPLATE_CATALOG[0];

  const selectedAccentColor = cvData.accentColor || activeTemplate.defaultColor || "#0284c7";

  const previewCV = {
    ...SAMPLE_CV_FOR_PREVIEW,
    accentColor: selectedAccentColor,
  };

  const handleSelectTemplate = (templateId: TemplateDefinition["id"]) => {
    setTemplateId(templateId);
  };

  const renderTemplateComponent = (templateId: string, data: typeof previewCV) => {
    switch (templateId) {
      case "executive-accent":
        return <ExecutiveAccent data={data} />;
      case "modern-photo":
        return <ModernPhoto data={data} />;
      case "modern":
        return <ModernCompact data={data} />;
      case "classic":
      default:
        return <ClassicAts data={data} />;
    }
  };

  function TemplateCardPreview({
    templateId,
    data,
  }: {
    templateId: string;
    data: typeof previewCV;
  }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number>(0.45);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateScale = () => {
        const width = el.clientWidth;
        if (width > 0) {
          // Standard template target width is 800px.
          // Scale to fit card container with exact boundary fit
          setScale(width / 800);
        }
      };

      updateScale();
      const observer = new ResizeObserver(updateScale);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-white select-none pointer-events-none flex items-start justify-center"
      >
        <div
          className="w-[800px] min-w-[800px] max-w-[800px] origin-top bg-white transition-transform duration-200"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {renderTemplateComponent(templateId, data)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-sky-100">
      {/* Header and Stepper - Preserves Stage 1 Indicator */}
      <Header currentStage={1} />
      <EditorStepper currentStage={1} />

      {/* Hero Section */}
      <div className="relative isolate py-8 sm:py-12 bg-white border-b border-slate-200/80">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.5,
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isFromUpload ? "Choose an ATS Template for Your Resume" : "Resume Template Gallery"}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isFromUpload
              ? "We've parsed your uploaded CV and calculated your baseline ATS score. Select a layout below to format your experience into an ATS-certified single-column document."
              : "Choose from minimalist ATS formats, modern color-accented layouts, or visual photo-enabled templates. Switch templates anytime with zero content loss."}
          </p>

          {/* Controls Bar: Category Filters & Color Swatches */}
          <div className="pt-3 flex flex-col items-center gap-3">
            {/* Archetype Filter Pills */}
            <div className="flex flex-wrap items-center justify-center bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200/80 gap-1">
              <button
                type="button"
                onClick={() => setActiveArchetype("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeArchetype === "all"
                    ? "bg-white text-sky-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Styles ({TEMPLATE_CATALOG.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveArchetype("minimalist")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeArchetype === "minimalist"
                    ? "bg-white text-sky-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Minimalist ATS
              </button>
              <button
                type="button"
                onClick={() => setActiveArchetype("color-accent")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeArchetype === "color-accent"
                    ? "bg-white text-sky-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Color Accent
              </button>
              <button
                type="button"
                onClick={() => setActiveArchetype("visual-photo")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeArchetype === "visual-photo"
                    ? "bg-white text-sky-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Photo / Visual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 justify-items-center">
          {filteredTemplates.map((template) => {
            const isSelected = cvData.templateId === template.id;
            const cardAccentColor =
              (isSelected ? cvData.accentColor : undefined) ||
              template.defaultColor ||
              "#0284c7";
            const cardPreviewCV = {
              ...SAMPLE_CV_FOR_PREVIEW,
              accentColor: cardAccentColor,
            };

            return (
              <div
                key={template.id}
                onClick={() => setModalTemplate(template)}
                className={`w-full max-w-[420px] aspect-[8.5/11] bg-white rounded-2xl overflow-hidden relative cursor-pointer group transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "border border-slate-300 shadow-2xl"
                    : "border border-slate-200 shadow-lg hover:shadow-2xl hover:border-slate-300"
                }`}
              >
                {/* Selected Active Pill (Top-Right) */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-20 bg-sky-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Selected</span>
                  </div>
                )}

                {/* The Preview Itself as the Card Body */}
                <TemplateCardPreview
                  templateId={template.id}
                  data={cardPreviewCV}
                />

                {/* Floating Bottom Name Bar (Visible when not hovering) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-3.5 pt-8 pointer-events-none group-hover:opacity-0 transition-opacity duration-200 flex items-center justify-between text-white">
                  <div className="min-w-0">
                    <p className="font-bold text-sm drop-shadow-sm truncate">
                      {template.name}
                    </p>
                    <p className="text-[11px] text-slate-200 font-medium truncate">
                      {template.subtitle}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    {template.supportsColor && (
                      <span className="text-[10px] bg-white/25 backdrop-blur-xs px-2 py-0.5 rounded-full font-semibold">
                        Colors
                      </span>
                    )}
                    {template.supportsPhoto && (
                      <span className="text-[10px] bg-white/25 backdrop-blur-xs px-2 py-0.5 rounded-full font-semibold">
                        Photo
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Overlay with View Details & Color Changer */}
                <div className="absolute inset-0 z-10 bg-slate-950/75 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-200 p-5 flex flex-col justify-between text-white">
                  {/* Top: Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {template.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Center: View Details Button & Color Customizer */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalTemplate(template);
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>View Details</span>
                    </button>

                    {/* Change Color on Card Hover */}
                    {template.supportsColor ? (
                      <div
                        className="flex flex-col items-center gap-1.5 w-full pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-sky-400" />
                          <span>Change Color</span>
                        </span>
                        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl backdrop-blur-md border border-white/15">
                          {COLOR_PALETTES.map((palette) => {
                            const isCurrent =
                              (cvData.accentColor || template.defaultColor) === palette.hex &&
                              cvData.templateId === template.id;
                            return (
                              <button
                                key={palette.id}
                                type="button"
                                title={palette.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateId(template.id);
                                  setAccentColor(palette.hex);
                                }}
                                className={`w-5 h-5 rounded-full transition-transform hover:scale-125 flex items-center justify-center cursor-pointer shadow-xs ${
                                  isCurrent ? "ring-2 ring-white scale-110" : ""
                                }`}
                                style={{ backgroundColor: palette.hex }}
                              >
                                {isCurrent && (
                                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Monochrome ATS Format
                      </span>
                    )}
                  </div>

                  {/* Bottom: Select Template Button */}
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(template.id)}
                      className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <span>Select Template</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Action Bar (Footer) */}
      <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 py-3 sm:py-4.5 px-3 sm:px-8 shadow-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Active Template */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <span className="text-slate-500">Active:</span>
            <span className="font-semibold text-sky-600">
              {activeTemplate.name}
            </span>
          </div>

          {/* Right: Continue Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/editor")}
              className="inline-flex items-center px-3.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[15px] font-semibold rounded-lg sm:rounded-xl text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm group whitespace-nowrap"
            >
              <span>{isFromUpload ? "Apply & Continue to Editor" : `Continue with ${activeTemplate.name}`}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Document Preview & Customization Modal */}
      {modalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {modalTemplate.name}
              </h3>

              <button
                type="button"
                onClick={() => setModalTemplate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Document Preview (Left) + Details & Customizer (Right) */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left: Interactive Live Document Viewport */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center items-start">
                <div className="w-full max-w-3xl bg-white shadow-xl border border-slate-300 rounded-sm transition-all">
                  {renderTemplateComponent(modalTemplate.id, previewCV)}
                </div>
              </div>

              {/* Right: Customization & Details Sidebar */}
              <div className="w-full lg:w-84 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-5">
                <div className="space-y-5">
                  {/* Color Palette Customizer (if template supports color) */}
                  {modalTemplate.supportsColor ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                          <Palette className="w-4 h-4 text-sky-600" />
                          <span>Accent Color</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {COLOR_PALETTES.find((p) => p.hex === selectedAccentColor)?.name || "Custom"}
                        </span>
                      </div>

                      <div className="grid grid-cols-6 gap-2">
                        {COLOR_PALETTES.map((palette) => {
                          const isCurrent = (cvData.accentColor || modalTemplate.defaultColor) === palette.hex;
                          return (
                            <button
                              key={palette.id}
                              type="button"
                              title={palette.name}
                              onClick={() => setAccentColor(palette.hex)}
                              className={`w-9 h-9 rounded-xl transition-all hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs ${
                                isCurrent ? "ring-2 ring-offset-2 ring-slate-800 scale-105" : ""
                              }`}
                              style={{ backgroundColor: palette.hex }}
                            >
                              {isCurrent && <Check className="w-4 h-4 text-white stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Click any swatch to customize the accent color in real time.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>Monochrome Minimalist ATS (Zero color distractions)</span>
                    </div>
                  )}

                  {/* Template Specifications */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Overview
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {modalTemplate.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Typography
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate block">
                          {modalTemplate.fontFamily.split("/")[0].trim()}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          ATS Score
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {modalTemplate.atsScoreGuarantee}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                        Key Highlights
                      </h4>
                      <ul className="space-y-1 text-slate-600 text-[11.5px]">
                        {modalTemplate.previewFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Best Suited For */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                        Best For
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {modalTemplate.recommendedIndustries.map((ind) => (
                          <span
                            key={ind}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[10px] rounded-md border border-slate-200/60"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons in Modal */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTemplate(modalTemplate.id);
                      router.push("/editor");
                    }}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Use Template &amp; Open Editor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTemplate(modalTemplate.id);
                      setModalTemplate(null);
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Keep Browsing Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplateGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
          <p className="text-xs font-semibold">Loading template gallery...</p>
        </div>
      }
    >
      <TemplateGalleryContent />
    </Suspense>
  );
}

