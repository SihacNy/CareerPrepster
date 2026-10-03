"use client";

import React from "react";

export interface ThreeSectionScoreGaugeProps {
  score: number;
  size?: "md" | "lg";
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export function ThreeSectionScoreGauge({
  score,
  size = "md",
  className = "",
  showSubtitle = true,
  subtitle = "out of 100",
}: ThreeSectionScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const isBad = safeScore < 60;
  const isOk = safeScore >= 60 && safeScore < 75;
  const isGood = safeScore >= 75;

  const scoreColor = isGood
    ? "#10b981"
    : isOk
    ? "#f59e0b"
    : "#ef4444";

  const scoreTextColor = isGood
    ? "text-emerald-600"
    : isOk
    ? "text-amber-600"
    : "text-rose-600";

  const scoreBgColor = "bg-slate-100";

  // 3-section circular progress geometry (r=50, circumference ~ 314.159)
  // Starts from bottom (6 o'clock) and sweeps clockwise through the left up to top and right
  const circumference = 314.159;
  const trackDash = 80.22;
  const sectionAngles = [104.0, 224.0, 344.0];

  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const animatedScore = animated ? safeScore : 0;

  const getSectionFraction = (idx: number) => {
    const min = (idx * 100) / 3;
    const max = ((idx + 1) * 100) / 3;
    if (animatedScore <= min) return 0;
    if (animatedScore >= max) return 1;
    return (animatedScore - min) / (max - min);
  };

  const containerSizeClass =
    size === "lg"
      ? "w-36 h-36 sm:w-40 sm:h-40"
      : "w-28 h-28 sm:w-32 sm:h-32";

  const scoreTextSizeClass =
    size === "lg"
      ? "text-4xl sm:text-[44px] leading-none"
      : "text-3xl sm:text-4xl";

  const subtitleSizeClass =
    size === "lg"
      ? "text-[10px] sm:text-[11px] mt-1"
      : "text-[10px] mt-0.5";

  return (
    <div
      className={`relative ${containerSizeClass} rounded-full flex items-center justify-center shrink-0 shadow-xs ${scoreBgColor} ${className}`}
    >
      {/* SVG 3-Segment Progress Circle */}
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {sectionAngles.map((angle, idx) => {
          const fraction = getSectionFraction(idx);
          const activeDash = Math.max(0, fraction * trackDash);

          return (
            <g key={idx}>
              {/* Background Grey Track */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={6.5}
                strokeLinecap="round"
                strokeDasharray={`${trackDash} ${circumference - trackDash}`}
                transform={`rotate(${angle} 60 60)`}
              />

              {/* Active Progress Fill (in scoreColor) */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={scoreColor}
                strokeWidth={6.5}
                strokeLinecap="round"
                strokeDasharray={`${activeDash} ${circumference - activeDash}`}
                transform={`rotate(${angle} 60 60)`}
                style={{
                  opacity: activeDash > 0.5 ? 1 : 0,
                  transition:
                    "stroke-dasharray 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Centered Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span
          className={`font-black tracking-tight ${scoreTextColor} ${scoreTextSizeClass}`}
        >
          {safeScore}
        </span>
        {showSubtitle && (
          <span
            className={`font-bold uppercase tracking-wider text-slate-500 ${subtitleSizeClass}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
