"use client";

import React, { useState, useMemo } from "react";
import { Target, CheckCircle2, AlertCircle, Sparkles, Copy, Check, Plus } from "lucide-react";
import { ATSReport } from "@/types/cv";
import { useCV } from "@/lib/store";

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
  const { setCVData } = useCV();
  const [copiedBullet, setCopiedBullet] = useState(false);
  const [addedStatus, setAddedStatus] = useState<string | null>(null);

  // Dynamic AI STAR/XYZ bullet generated using the missing keywords
  const aiSuggestedBullet = useMemo(() => {
    if (!keywordAnalysis?.missingKeywords || keywordAnalysis.missingKeywords.length === 0) {
      return null;
    }
    const missing = keywordAnalysis.missingKeywords;
    const topSkills = missing.slice(0, 3).join(", ");
    return `Engineered robust backend microservices leveraging ${topSkills}, reducing server response latency by 32% and supporting 12,000+ daily student user transactions.`;
  }, [keywordAnalysis?.missingKeywords]);

  const handleCopyBullet = () => {
    if (!aiSuggestedBullet) return;
    navigator.clipboard.writeText(aiSuggestedBullet);
    setCopiedBullet(true);
    setTimeout(() => setCopiedBullet(false), 2500);
  };

  const handleAutoAddSkills = () => {
    if (!keywordAnalysis?.missingKeywords?.length) return;
    const skillsToAdd = keywordAnalysis.missingKeywords;

    setCVData((prev) => {
      const existingCategories = [...prev.skills];
      let targetCat = existingCategories.find(
        (c) =>
          c.categoryName.toLowerCase().includes("tools") ||
          c.categoryName.toLowerCase().includes("technolog") ||
          c.categoryName.toLowerCase().includes("skill")
      );

      if (!targetCat && existingCategories.length > 0) {
        targetCat = existingCategories[0];
      }

      if (targetCat) {
        const currentSet = new Set(targetCat.skills);
        skillsToAdd.forEach((s) => currentSet.add(s));
        targetCat.skills = Array.from(currentSet);
      } else {
        existingCategories.push({
          id: `cat-${Date.now()}`,
          categoryName: "Developer Tools & Technologies",
          skills: skillsToAdd,
        });
      }

      return {
        ...prev,
        skills: existingCategories,
        updatedAt: new Date().toISOString(),
      };
    });

    setAddedStatus(`Added ${skillsToAdd.length} missing skill${skillsToAdd.length > 1 ? "s" : ""} to your CV!`);
    setTimeout(() => setAddedStatus(null), 3500);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card mb-6">
      <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-100 mb-3.5">
        <Target className="w-5 h-5 text-sky-600" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Targeted Role Job Description Matcher (Optional)
        </h3>
      </div>

      <p className="text-sm text-slate-600 mb-3.5 leading-relaxed">
        Paste the job requirements or posting text below to calculate your keyword alignment and discover missing skills.
      </p>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste full job description text here (e.g. Looking for Software Engineer with React, Node.js, Docker, MySQL, and REST API experience)..."
        className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3.5 outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors leading-relaxed placeholder:text-slate-400 min-h-[110px]"
      />

      {keywordAnalysis && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
          {/* Match Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Role Keyword Match:
            </span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              {keywordAnalysis.matchPercentage}% Alignment
            </span>
          </div>

          {/* Matched Keywords */}
          {keywordAnalysis.matchedKeywords.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center mb-2">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Detected in Your CV ({keywordAnalysis.matchedKeywords.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywordAnalysis.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
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
              <span className="text-xs font-semibold text-rose-700 flex items-center mb-2">
                <AlertCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                Missing Required Keywords ({keywordAnalysis.missingKeywords.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywordAnalysis.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                  >
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggested Fix Card */}
          {keywordAnalysis.missingKeywords.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-sky-50/70 via-indigo-50/40 to-slate-50 border border-sky-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    AI Suggested Fix for Role Alignment
                  </span>
                </div>

                {/* 1-Click Auto Add Button */}
                <button
                  type="button"
                  onClick={handleAutoAddSkills}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Auto-Add Missing Skills to CV</span>
                </button>
              </div>

              {addedStatus && (
                <div className="mb-3 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-1.5 animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{addedStatus}</span>
                </div>
              )}

              {/* Suggested STAR Bullet */}
              {aiSuggestedBullet && (
                <div className="mt-2.5 p-3 rounded-lg bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Recommended Experience Bullet (STAR / Google XYZ Format):
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyBullet}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                    >
                      {copiedBullet ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Bullet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed italic">
                    &ldquo;{aiSuggestedBullet}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
