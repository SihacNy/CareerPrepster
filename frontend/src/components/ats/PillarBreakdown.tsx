"use client";

import React from "react";
import { FileSearch, Zap, Cpu, BookOpen } from "lucide-react";
import { ATSReport } from "@/types/cv";

interface PillarBreakdownProps {
  breakdown: ATSReport["breakdown"];
}

export function PillarBreakdown({ breakdown }: PillarBreakdownProps) {
  const pillars = [
    {
      id: "parsability",
      name: "Parsability & Structure",
      score: breakdown.parsabilityScore,
      maxScore: 25,
      icon: FileSearch,
      description: "Standard headers, contact details, and clean reading hierarchy.",
    },
    {
      id: "impact",
      name: "Impact & Action Verbs",
      score: breakdown.impactScore,
      maxScore: 30,
      icon: Zap,
      description: "Active leadership verbs, Google XYZ metric density, and STAR outcomes.",
    },
    {
      id: "skills",
      name: "Skills Taxonomy & Depth",
      score: breakdown.skillsScore,
      maxScore: 25,
      icon: Cpu,
      description: "Categorization of programming languages, frameworks, and developer tools.",
    },
    {
      id: "brevity",
      name: "Brevity & Readability",
      score: breakdown.brevityScore,
      maxScore: 20,
      icon: BookOpen,
      description: "Word count balance (450–650 words) fitting standard 1-page constraints.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {pillars.map((p) => {
        const Icon = p.icon;
        const percentage = Math.round((p.score / p.maxScore) * 100);

        let progressColor = "bg-emerald-500";
        if (percentage < 60) progressColor = "bg-rose-500";
        else if (percentage < 80) progressColor = "bg-amber-500";

        return (
          <div
            key={p.id}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Weight: {p.maxScore} pts
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    {p.score}
                    <span className="text-xs text-slate-400 font-normal">
                      /{p.maxScore}
                    </span>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                {p.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
