"use client";

import React, { useMemo } from "react";
import { useCV } from "@/lib/store";
import { calculateMockAtsReport } from "@/lib/mockData";
import { ScoreGauge } from "./ScoreGauge";
import { PillarBreakdown } from "./PillarBreakdown";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { ActionableFindingsList } from "./ActionableFindingsList";
import { StageActions } from "./StageActions";
import { FileCheck, Sparkles, AlertCircle } from "lucide-react";

interface ATSScoringStageProps {
  isFromUpload?: boolean;
}

export function ATSScoringStage({ isFromUpload = false }: ATSScoringStageProps) {
  const { cvData, targetJobDescription, setTargetJobDescription } = useCV();

  // Compute 4-pillar ATS report
  const report = useMemo(() => {
    return calculateMockAtsReport(cvData, targetJobDescription);
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
