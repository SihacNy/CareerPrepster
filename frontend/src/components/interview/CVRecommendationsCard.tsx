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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-3.5">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            CV Bullet Alignment
          </h3>
        </div>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
          Your spoken answers aligned well with your CV claims. As you practice more technical and project drills, any unquantified bullet points will be highlighted here for direct refinement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Actionable CV Bullet Recommendations
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Upgrade your resume with the metrics and tools you articulated during this interview drill
          </p>
        </div>

        {cvId && (
          <a
            href={`/editor?cvId=${cvId}`}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-colors shadow-2xs"
          >
            <span>Open CV in Editor</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5"
          >
            {/* Original Bullet (if present) */}
            {rec.originalText && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Current CV Bullet Point:
                </span>
                <p className="text-sm text-slate-600 italic bg-white p-3.5 rounded-xl border border-slate-200/60 leading-relaxed">
                  &quot;{rec.originalText}&quot;
                </p>
              </div>
            )}

            {/* Recommended Rewrite */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Recommended STAR / Impact Revision:</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(rec.recommendation, i)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors px-2.5 py-1 rounded-lg hover:bg-sky-50"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-900 bg-sky-50/70 p-4 rounded-xl border border-sky-200/80 leading-relaxed">
                &quot;{rec.recommendation}&quot;
              </p>
            </div>

            {/* Coaching Reason */}
            {rec.reason && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold">Why this helps:</strong> {rec.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
