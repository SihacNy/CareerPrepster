"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Check } from "lucide-react";
import { ATSFinding } from "@/types/cv";

interface ActionableFindingsListProps {
  findings: ATSFinding[];
}

export function ActionableFindingsList({ findings }: ActionableFindingsListProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "suggestion" | "passed">("all");

  const filtered = findings.filter((f) => {
    if (filter === "all") return true;
    return f.type === filter;
  });

  const criticalCount = findings.filter((f) => f.type === "critical").length;
  const suggestionCount = findings.filter((f) => f.type === "suggestion").length;
  const passedCount = findings.filter((f) => f.type === "passed").length;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Actionable ATS Audit Findings
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Review recommendations to maximize screening match rates before export.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-[13px]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({findings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("critical")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === "critical"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("suggestion")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === "suggestion"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Suggestions ({suggestionCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("passed")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === "passed"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Passed ({passedCount})
          </button>
        </div>
      </div>

      {/* Findings List / Empty State */}
      {filtered.length === 0 ? (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center rounded-xl bg-slate-50/70">
          <div className="w-12 h-12 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-3">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            {filter === "critical"
              ? "No Critical Issues Detected!"
              : filter === "suggestion"
              ? "No Suggestions in this View"
              : "No Findings in this View"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
            {filter === "critical"
              ? "Great job! Your resume meets all mandatory ATS parsability and formatting criteria with zero critical errors."
              : filter === "suggestion"
              ? "Your resume content is adhering to best practices for this category."
              : "Click 'All' to review your full audit findings."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((finding) => {
            let badge = "bg-emerald-50 text-emerald-700";
            let Icon = CheckCircle2;
            let iconColor = "text-emerald-600";
            let cardBg = "border-slate-200 bg-white";

            if (finding.type === "critical") {
              badge = "bg-rose-50 text-rose-700";
              Icon = XCircle;
              iconColor = "text-rose-600";
              cardBg = "border-rose-200 bg-rose-50/20";
            } else if (finding.type === "suggestion") {
              badge = "bg-amber-50 text-amber-700";
              Icon = AlertTriangle;
              iconColor = "text-amber-600";
              cardBg = "border-amber-200 bg-amber-50/20";
            }

            return (
              <div
                key={finding.id}
                className={`p-4 sm:p-5 rounded-xl border ${cardBg} flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 transition-all`}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {finding.message}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${badge}`}>
                        {finding.pillar.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mt-1">
                      {finding.recommendation}
                    </p>
                  </div>
                </div>

                {finding.type !== "passed" && (
                  <div className="sm:self-center flex-shrink-0">
                    <Link
                      href="/editor"
                      className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 hover:border-sky-300 transition-colors shadow-2xs"
                    >
                      <span>Fix in Editor</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
