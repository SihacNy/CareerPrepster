"use client";

import React from "react";

interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let tierColor = "text-emerald-600";
  let strokeColor = "#10B981"; // Emerald-500
  let tierLabel = "ATS Ready";
  let tierBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (score < 50) {
    tierColor = "text-rose-600";
    strokeColor = "#F43F5E"; // Rose-500
    tierLabel = "Needs Immediate Attention";
    tierBadge = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (score < 80) {
    tierColor = "text-amber-600";
    strokeColor = "#F59E0B"; // Amber-500
    tierLabel = "Good Foundation (Optimization Recommended)";
    tierBadge = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-card">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="text-slate-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress stroke */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold ${tierColor} tracking-tight font-sans`}>
            {score}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierBadge}`}>
          {tierLabel}
        </span>
        <p className="text-[11px] text-slate-500 mt-1">
          Universal ATS Parsability &amp; Screening Score
        </p>
      </div>
    </div>
  );
}
