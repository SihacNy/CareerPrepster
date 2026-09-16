"use client";

import React from "react";
import { Award, CheckCircle2, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import { InterviewScorecardData } from "@/types/interview";

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

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-sky-600 bg-sky-50 border-sky-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-sky-500";
    return "bg-amber-500";
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
      {/* Top Banner: Composite Score & Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Interview Readiness Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Overall Interview Performance
          </h1>
          <p className="text-xs text-slate-500">
            Target Role: <strong className="text-slate-700">{targetRoleTitle}</strong> ({track} Track)
          </p>
        </div>

        {/* Big Overall Score Badge */}
        <div className="flex items-center space-x-4">
          <div
            className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xs ${getScoreColor(
              scorecard.overallScore
            )}`}
          >
            <span className="text-3xl font-black tracking-tight">{scorecard.overallScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">out of 100</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Readiness Tier
            </span>
            <span className="text-sm font-bold text-slate-900 block leading-snug">
              {scorecard.readinessTier}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Dimensional Competency Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Dimensional Competency Scores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {competencyBars.map((bar) => (
            <div
              key={bar.label}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{bar.label}</span>
                <span className="font-bold text-slate-900">{bar.score} / 100</span>
              </div>
              <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                    bar.score
                  )}`}
                  style={{ width: `${bar.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Strengths */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-3">
          <div className="flex items-center space-x-2 font-bold text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-800 leading-relaxed">
            {scorecard.keyStrengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3">
          <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
            <span>High-Priority Practice Areas</span>
          </div>
          <ul className="space-y-2 text-xs text-amber-800 leading-relaxed">
            {scorecard.keyGrowthAreas.map((area, i) => (
              <li key={i} className="flex items-start space-x-2">
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
