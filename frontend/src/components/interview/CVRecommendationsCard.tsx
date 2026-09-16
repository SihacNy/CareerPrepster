"use client";

import React, { useState } from "react";
import { FileEdit, Copy, Check, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { CVRecommendation } from "@/types/interview";

interface CVRecommendationsCardProps {
  recommendations: CVRecommendation[];
  cvId?: string | null;
}

export function CVRecommendationsCard({
  recommendations,
  cvId,
}: CVRecommendationsCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            CV Bullet Alignment
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Your spoken answers aligned well with your CV claims. As you practice more technical and project drills, any unquantified bullet points will be highlighted here for direct refinement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Actionable CV Bullet Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Upgrade your resume with the metrics and tools you articulated during this interview drill
            </p>
          </div>
        </div>

        {cvId && (
          <a
            href={`/editor?cvId=${cvId}`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold transition-colors"
          >
            <span>Open CV in Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
          >
            {/* Original Bullet (if present) */}
            {rec.originalText && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Current CV Bullet Point:
                </span>
                <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200/60">
                  &quot;{rec.originalText}&quot;
                </p>
              </div>
            )}

            {/* Recommended Rewrite */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Recommended STAR / Impact Revision:</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(rec.recommendation, i)}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-medium text-slate-900 bg-sky-50/50 p-3 rounded-lg border border-sky-100 leading-relaxed">
                &quot;{rec.recommendation}&quot;
              </p>
            </div>

            {/* Coaching Reason */}
            {rec.reason && (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong className="text-slate-700 font-semibold">Why this helps:</strong> {rec.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
