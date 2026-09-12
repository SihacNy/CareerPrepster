"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from "lucide-react";
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
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Actionable ATS Audit Findings
          </h3>
          <p className="text-[11px] text-slate-500">
            Review recommendations to maximize screening match rates before export.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({findings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("critical")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === "passed"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Passed ({passedCount})
          </button>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filtered.map((finding) => {
          let badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
          let Icon = CheckCircle2;
          let iconColor = "text-emerald-600";
          let cardBg = "border-slate-200 bg-white";

          if (finding.type === "critical") {
            badge = "bg-rose-50 text-rose-700 border-rose-200";
            Icon = XCircle;
            iconColor = "text-rose-600";
            cardBg = "border-rose-200 bg-rose-50/20";
          } else if (finding.type === "suggestion") {
            badge = "bg-amber-50 text-amber-700 border-amber-200";
            Icon = AlertTriangle;
            iconColor = "text-amber-600";
            cardBg = "border-amber-200 bg-amber-50/20";
          }

          return (
            <div
              key={finding.id}
              className={`p-3.5 rounded-xl border ${cardBg} flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs`}
            >
              <div className="flex items-start space-x-2.5 flex-1">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{finding.message}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${badge}`}>
                      {finding.pillar.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {finding.recommendation}
                  </p>
                </div>
              </div>

              {finding.type !== "passed" && (
                <div className="sm:self-center flex-shrink-0">
                  <Link
                    href="/editor"
                    className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-md text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                  >
                    <span>Fix in Editor</span>
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
