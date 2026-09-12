"use client";

import React from "react";
import { BadgeCheck, AlertTriangle, XCircle } from "lucide-react";

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
  let tierBadge = "bg-emerald-50 text-emerald-700";
  let TierIcon = BadgeCheck;

  if (score < 50) {
    tierColor = "text-rose-600";
    strokeColor = "#F43F5E"; // Rose-500
    tierLabel = "Needs Immediate Attention";
    tierBadge = "bg-rose-50 text-rose-700";
    TierIcon = XCircle;
  } else if (score < 80) {
    tierColor = "text-amber-600";
    strokeColor = "#F59E0B"; // Amber-500
    tierLabel = "Good Foundation (Optimization Recommended)";
    tierBadge = "bg-amber-50 text-amber-700";
    TierIcon = AlertTriangle;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-7 bg-white rounded-xl border border-slate-200 shadow-card h-full">
      <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
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
          <span className={`text-4xl sm:text-[42px] font-extrabold ${tierColor} tracking-tight font-sans leading-none`}>
            {score}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
            out of 100
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs sm:text-[13px] font-semibold ${tierBadge}`}>
          <TierIcon className="w-4 h-4 mr-1.5 shrink-0" />
          {tierLabel}
        </span>
        <p className="text-xs text-slate-500 mt-1.5 leading-snug">
          Universal ATS Parsability &amp; Screening Score
        </p>
      </div>
    </div>
  );
}
