"use client";

import React, { useState, useEffect } from "react";
import { useCV } from "@/lib/store";
import { ATSReport } from "@/types/cv";
import { atsApi } from "@/lib/api";
import { ScoreGauge } from "./ScoreGauge";
import { PillarBreakdown } from "./PillarBreakdown";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { ActionableFindingsList } from "./ActionableFindingsList";
import { StageActions } from "./StageActions";
import { FileCheck, Sparkles, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface ATSScoringStageProps {
  isFromUpload?: boolean;
}

const INITIAL_REPORT: ATSReport = {
  overallScore: 0,
  wordCount: 0,
  estimatedPages: 1,
  breakdown: {
    parsabilityScore: 0,
    impactScore: 0,
    skillsScore: 0,
    brevityScore: 0,
  },
  findings: [],
};

export function ATSScoringStage({ isFromUpload = false }: ATSScoringStageProps) {
  const { cvData, targetJobDescription, setTargetJobDescription } = useCV();
  const [report, setReport] = useState<ATSReport>(INITIAL_REPORT);
  const [isAuditing, setIsAuditing] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);

  const runAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);

    try {
      const liveResult = await atsApi.score({
        cvId: cvData.id && !cvData.id.startsWith("draft-") && !cvData.id.startsWith("cv-") && !cvData.id.startsWith("imported-") ? cvData.id : undefined,
        cvData,
        targetJobDescription,
      });

      if (liveResult && typeof liveResult.overallScore === "number") {
        setReport({
          overallScore: liveResult.overallScore,
          wordCount: (liveResult as any).wordCount || 0,
          estimatedPages: (liveResult as any).estimatedPages || 1,
          breakdown: (liveResult as any).breakdown || {
            parsabilityScore: liveResult.parsabilityScore ?? 0,
            impactScore: liveResult.impactScore ?? 0,
            skillsScore: liveResult.skillsScore ?? 0,
            brevityScore: liveResult.brevityScore ?? 0,
          },
          keywordAnalysis: (liveResult as any).keywordAnalysis,
          findings: ((liveResult.findings || []) as any[]).map((f) => ({
            id: f.id,
            type: (f.severity || f.type || "passed").toLowerCase() as any,
            pillar: (f.pillar || "parsability").toLowerCase() as any,
            message: f.message || f.title,
            recommendation: f.recommendation || f.remediation || f.message,
            suggestedFix: f.suggestedFix,
            sectionTarget: f.sectionRef || f.sectionTarget,
          })),
        });
      }
    } catch (err: any) {
      setAuditError(
        err?.message || "Failed to calculate ATS score from server. Ensure backend API is active."
      );
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runAudit();
    }, 400);

    return () => clearTimeout(timer);
  }, [cvData, targetJobDescription]);

  return (
    <div className="w-full flex flex-col flex-1 pb-16">
      {/* Upload Diagnostic Banner if Flow B */}
      {isFromUpload && (
        <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start space-x-3">
          <FileCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sky-950">
              Initial Resume Diagnostic Audit Complete
            </h4>
            <p className="mt-0.5 text-sky-800 leading-relaxed">
              We parsed your uploaded resume and calculated your baseline ATS score. Review your findings below, then click &ldquo;Improve in Editor&rdquo; to enhance weak bullets and format with our Harvard &amp; Jake&apos;s templates.
            </p>
          </div>
        </div>
      )}

      {/* Backend Audit Error Notification */}
      {auditError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-950">ATS Scoring Server Notice</h4>
              <p className="mt-0.5 text-rose-800 leading-relaxed">{auditError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={runAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shrink-0 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Audit</span>
          </button>
        </div>
      )}

      {/* Top Section: Score Gauge & Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Col: 0-100 Gauge */}
        <div className="lg:col-span-1">
          <ScoreGauge score={report.overallScore} />
        </div>

        {/* Right 2 Cols: 4 Pillars Breakdown */}
        <div className="lg:col-span-2">
          <PillarBreakdown breakdown={report.breakdown} />
        </div>
      </div>


      {/* Target Job Description Matcher */}
      <JobDescriptionInput
        value={targetJobDescription}
        onChange={setTargetJobDescription}
        keywordAnalysis={report.keywordAnalysis}
      />

      {/* Actionable Findings List */}
      <ActionableFindingsList findings={report.findings} />

      {/* Bottom Action Bar */}
      <StageActions isFromUpload={isFromUpload} />
    </div>
  );
}
