"use client";

import React from "react";
import { Target, CheckCircle2, AlertCircle } from "lucide-react";
import { ATSReport } from "@/types/cv";

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  keywordAnalysis?: ATSReport["keywordAnalysis"];
}

export function JobDescriptionInput({
  value,
  onChange,
  keywordAnalysis,
}: JobDescriptionInputProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card mb-6">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 mb-3">
        <Target className="w-4 h-4 text-sky-600" />
        <h3 className="text-xs font-bold text-slate-900">
          Targeted Role Job Description Matcher (Optional)
        </h3>
      </div>

      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        Paste the job requirements or posting text below to calculate your keyword alignment and discover missing skills.
      </p>

      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste full job description text here (e.g. Looking for Software Engineer with React, Node.js, Docker, MySQL, and REST API experience)..."
        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors leading-relaxed"
      />

      {keywordAnalysis && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Match Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Role Keyword Match:
            </span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              {keywordAnalysis.matchPercentage}% Alignment
            </span>
          </div>

          {/* Matched Keywords */}
          {keywordAnalysis.matchedKeywords.length > 0 && (
            <div>
              <span className="text-[11px] font-medium text-emerald-700 flex items-center mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Detected in Your CV ({keywordAnalysis.matchedKeywords.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywordAnalysis.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {keywordAnalysis.missingKeywords.length > 0 && (
            <div>
              <span className="text-[11px] font-medium text-rose-700 flex items-center mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                Missing Required Keywords ({keywordAnalysis.missingKeywords.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywordAnalysis.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200"
                  >
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
