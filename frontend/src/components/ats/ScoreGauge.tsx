"use client";

import React from "react";
import { BadgeCheck, AlertTriangle, XCircle } from "lucide-react";
import { ThreeSectionScoreGauge } from "@/components/common/ThreeSectionScoreGauge";

interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const isBad = safeScore < 60;
  const isOk = safeScore >= 60 && safeScore < 75;
  const isGood = safeScore >= 75;

  const tierLabel = isGood
    ? "ATS Ready"
    : isOk
    ? "Good Foundation (Optimization Recommended)"
    : "Needs Immediate Attention";

  const tierBadge = isGood
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isOk
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

  const TierIcon = isGood
    ? BadgeCheck
    : isOk
    ? AlertTriangle
    : XCircle;

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-xs h-full">
      {/* Reusable 3-Section Circular Score Gauge */}
      <ThreeSectionScoreGauge score={safeScore} size="lg" />

      <div className="mt-5 text-center space-y-1.5">
        <span
          className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border ${tierBadge}`}
        >
          <TierIcon className="w-4 h-4 mr-1.5 shrink-0" />
          {tierLabel}
        </span>
        <p className="text-xs text-slate-500 leading-snug">
          Universal ATS Parsability &amp; Screening Score
        </p>
      </div>
    </div>
  );
}
