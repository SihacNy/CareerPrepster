"use client";

import React from "react";
import { ATSReport } from "@/types/cv";

interface PillarBreakdownProps {
  breakdown: ATSReport["breakdown"];
}

export function PillarBreakdown({ breakdown }: PillarBreakdownProps) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const pillars = [
    {
      id: "parsability",
      name: "Parsability & Structure",
      score: breakdown.parsabilityScore,
      maxScore: 25,
      description: "Standard headers, contact details, and clean reading hierarchy.",
    },
    {
      id: "impact",
      name: "Impact & Action Verbs",
      score: breakdown.impactScore,
      maxScore: 30,
      description: "Active leadership verbs, Google XYZ metric density, and STAR outcomes.",
    },
    {
      id: "skills",
      name: "Skills Taxonomy & Depth",
      score: breakdown.skillsScore,
      maxScore: 25,
      description: "Categorization of programming languages, frameworks, and developer tools.",
    },
    {
      id: "brevity",
      name: "Brevity & Readability",
      score: breakdown.brevityScore,
      maxScore: 20,
      description: "Word count balance (450–650 words) fitting standard 1-page constraints.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {pillars.map((p, idx) => {
        const percentage = Math.round((p.score / p.maxScore) * 100);

        let progressColor = "bg-emerald-500";
        if (percentage < 60) progressColor = "bg-rose-500";
        else if (percentage < 75) progressColor = "bg-amber-500";

        return (
          <div
            key={p.id}
            className="p-5 sm:p-5.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {p.name}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    Weight: {p.maxScore} pts
                  </span>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 leading-none">
                    {p.score}
                    <span className="text-xs sm:text-sm text-slate-400 font-normal">
                      /{p.maxScore}
                    </span>
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mt-2">
                {p.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} rounded-full`}
                  style={{
                    width: animated ? `${percentage}%` : "0%",
                    transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: `${idx * 100 + 150}ms`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
