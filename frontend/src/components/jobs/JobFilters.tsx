"use client";

import React from "react";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { JobListFilterParams } from "@/types/jobs";

interface JobFiltersProps {
  filters: JobListFilterParams;
  onChange: (updated: Partial<JobListFilterParams>) => void;
  totalItems: number;
}

export function JobFilters({ filters, onChange, totalItems }: JobFiltersProps) {
  const statusTabs = [
    { id: "ALL", label: "All Recommendations" },
    { id: "ACTIVE", label: "Active" },
    { id: "SAVED", label: "Saved" },
    { id: "APPLIED", label: "Applied" },
    { id: "DISMISSED", label: "Dismissed" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm space-y-4">
      {/* Top Row: Search & Dropdowns */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search by job title, company name, or location..."
            className="w-full text-xs p-2.5 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Work Arrangement */}
          <select
            value={filters.arrangement || "ALL"}
            onChange={(e) => onChange({ arrangement: e.target.value, page: 1 })}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All Arrangements</option>
            <option value="REMOTE">Remote Only</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          {/* Min Score Filter */}
          <select
            value={filters.minScore || 0}
            onChange={(e) => onChange({ minScore: Number(e.target.value), page: 1 })}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="0">All Match Scores</option>
            <option value="80">Excellent Fit (80%+)</option>
            <option value="65">Strong Match (65%+)</option>
            <option value="50">Moderate Fit (50%+)</option>
          </select>

          {/* Sort By */}
          <select
            value={`${filters.sortBy || "matchScore"}_${filters.sortOrder || "desc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("_");
              onChange({ sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 });
            }}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="matchScore_desc">Match Score (Highest)</option>
            <option value="postedAt_desc">Date Posted (Newest)</option>
            <option value="discoveredAt_desc">Discovered (Newest)</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Status Tabs & Result Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = (filters.status || "ACTIVE") === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange({ status: tab.id, page: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {totalItems} {totalItems === 1 ? "vacancy" : "vacancies"}
        </span>
      </div>
    </div>
  );
}
