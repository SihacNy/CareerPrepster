"use client";

import React from "react";
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  Clock,
} from "lucide-react";
import type { JobMatchRecommendationDto, RecommendationStatus } from "@/types/jobs";

interface JobMatchCardProps {
  recommendation: JobMatchRecommendationDto;
  onUpdateStatus: (id: string, status: RecommendationStatus) => void;
  isUpdatingStatus?: boolean;
}

export function JobMatchCard({
  recommendation,
  onUpdateStatus,
  isUpdatingStatus,
}: JobMatchCardProps) {
  const { job, overallScore, matchedSkills, missingSkills, matchReasons, status } = recommendation;

  // Score color styling
  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-emerald-500",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        ring: "text-emerald-500",
        label: "Excellent Fit",
      };
    }
    if (score >= 65) {
      return {
        bg: "bg-sky-500",
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        ring: "text-sky-500",
        label: "Strong Match",
      };
    }
    return {
      bg: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      ring: "text-amber-500",
      label: "Moderate Fit",
    };
  };

  const scoreTheme = getScoreTheme(overallScore);

  const formatArrangement = (arr: string) => {
    switch (arr) {
      case "REMOTE":
        return "Remote";
      case "HYBRID":
        return "Hybrid";
      case "ON_SITE":
        return "On-Site";
      default:
        return arr;
    }
  };

  const formatEmploymentType = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-Time";
      case "PART_TIME":
        return "Part-Time";
      case "INTERNSHIP":
        return "Internship";
      case "CONTRACT":
        return "Contract";
      default:
        return type;
    }
  };

  const isSaved = status === "SAVED";
  const isApplied = status === "APPLIED";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between">
      {/* Top Header: Logo, Company, Title, Score */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {job.logoUrl ? (
              <img
                src={job.logoUrl}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-contain border border-slate-100 bg-white p-1 shrink-0"
                onError={(e) => {
                  // Fallback on broken image link
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg border border-slate-200 shrink-0">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
            )}

            <div className="min-w-0">
              {job.applicationUrl ? (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 text-base lg:text-lg hover:text-sky-600 transition-colors line-clamp-1 block"
                  title={job.title}
                >
                  {job.title}
                </a>
              ) : (
                <h3
                  className="font-bold text-slate-900 text-base lg:text-lg line-clamp-1"
                  title={job.title}
                >
                  {job.title}
                </h3>
              )}
              <p className="text-sm font-medium text-slate-600 line-clamp-1">{job.company}</p>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="shrink-0 flex flex-col items-end">
            <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${scoreTheme.badgeBg}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{overallScore}% Match</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">{scoreTheme.label}</span>
          </div>
        </div>

        {/* Location & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
            <Briefcase className="w-3 h-3 text-slate-400" />
            {formatArrangement(job.workArrangement)}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatEmploymentType(job.employmentType)}
          </span>
          {job.sourcePlatform && (
            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
              {job.sourcePlatform.includes("playwright") ? "LinkedIn Live" : job.sourcePlatform}
            </span>
          )}
        </div>

        {/* AI Insight Snippet */}
        {matchReasons?.summary && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
              <span className="font-semibold text-slate-900">AI Assessment: </span>
              {matchReasons.summary}
            </p>
          </div>
        )}

        {/* Matched vs Missing Skills Badges */}
        <div className="space-y-2 mb-5">
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Skills:</span>
              {matchedSkills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[11px] font-medium"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {skill}
                </span>
              ))}
              {matchedSkills.length > 4 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  +{matchedSkills.length - 4} more
                </span>
              )}
            </div>
          )}

          {missingSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Gaps:</span>
              {missingSkills.slice(0, 2).map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                >
                  +{skill}
                </span>
              ))}
              {missingSkills.length > 2 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  +{missingSkills.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Save Button */}
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => onUpdateStatus(recommendation.id, isSaved ? "ACTIVE" : "SAVED")}
            className={`p-2 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
              isSaved
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
            title={isSaved ? "Saved to Favorites" : "Save Job"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-sky-600 text-sky-600" : ""}`} />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Dismiss Button */}
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => onUpdateStatus(recommendation.id, "DISMISSED")}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            title="Dismiss Recommendation"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {job.applicationUrl ? (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (!isApplied) {
                  onUpdateStatus(recommendation.id, "APPLIED");
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
              title="Apply directly on employer site"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-slate-400 font-medium px-2 py-1">
              Direct Link Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
