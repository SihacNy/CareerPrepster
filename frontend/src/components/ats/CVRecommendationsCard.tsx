"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface BulletRecommendationItem {
  bulletPointId?: string | null;
  cvItemId?: string | null;
  originalText?: string | null;
  recommendation: string;
  reason?: string;
}

interface CVRecommendationsCardProps {
  recommendations: BulletRecommendationItem[];
  cvId?: string | null;
}

export function CVRecommendationsCard({
  recommendations,
  cvId,
}: CVRecommendationsCardProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-3.5 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            CV Bullet Recommendations
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your CV bullets are well-structured and meet ATS action phrasing standards. For further enhancement, you can use the AI Refine tool directly within the editor.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6 mb-6">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Actionable CV Bullet Recommendations
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
          Upgrade your resume with high-impact STAR formulas, metrics, and power verbs to maximize ATS matching.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5 transition-all"
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
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-900 bg-sky-50/70 p-4 rounded-xl border border-sky-200/80 leading-relaxed">
                &quot;{rec.recommendation}&quot;
              </p>
            </div>

            {/* Reason / Coaching explanation */}
            {rec.reason && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold">Why this helps:</strong>{" "}
                {rec.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
