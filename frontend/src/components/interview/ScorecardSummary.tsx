"use client";

import React from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { InterviewScorecardData } from "@/types/interview";
import { ThreeSectionScoreGauge } from "@/components/common/ThreeSectionScoreGauge";

interface ScorecardSummaryProps {
  scorecard: InterviewScorecardData;
  targetRoleTitle: string;
  track: string;
}

export function ScorecardSummary({
  scorecard,
  targetRoleTitle,
  track,
}: ScorecardSummaryProps) {
  const competencyBars = [
    { label: "STAR Structure & Framework", score: scorecard.starScore },
    { label: "Technical & Architectural Depth", score: scorecard.technicalScore },
    { label: "Communication & Conciseness", score: scorecard.communicationScore },
    { label: "Quantifiable Results & Metrics", score: scorecard.impactScore },
  ];

  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const getBarColor = (val: number) => {
    if (val >= 75) return "bg-emerald-500";
    if (val >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-9">
      {/* Top Banner: Composite Score & Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Overall Interview Performance
          </h1>
          <p className="text-sm text-slate-500">
            Target Role: <strong className="text-slate-800 font-semibold">{targetRoleTitle}</strong> ({track} Track)
          </p>
        </div>

        {/* 3-Section Circular Score Gauge */}
        <div className="flex items-center space-x-5">
          <ThreeSectionScoreGauge score={scorecard.overallScore} size="md" />

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Readiness Tier
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 block leading-snug">
              {scorecard.readinessTier}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Dimensional Competency Breakdown */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Dimensional Competency Scores
        </h3>
        <div className="p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {competencyBars.map((bar, idx) => (
              <div
                key={bar.label}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{bar.label}</span>
                  <span className="font-bold text-slate-900">{bar.score} / 100</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getBarColor(bar.score)}`}
                    style={{
                      width: animated ? `${bar.score}%` : "0%",
                      transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: `${idx * 120 + 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
        {/* Strengths */}
        <div className="p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5">
          <div className="flex items-center space-x-2.5 font-bold text-base text-slate-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
            {scorecard.keyStrengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-2.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5">
          <div className="flex items-center space-x-2.5 font-bold text-base text-slate-900">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
            <span>High-Priority Practice Areas</span>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
            {scorecard.keyGrowthAreas.map((area, i) => (
              <li key={i} className="flex items-start space-x-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
