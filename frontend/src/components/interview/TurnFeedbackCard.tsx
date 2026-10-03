"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
} from "lucide-react";
import { TurnFeedbackData } from "@/types/interview";

interface TurnFeedbackCardProps {
  feedback: TurnFeedbackData;
  isComplete: boolean;
  onNextQuestion: () => void;
  nextQuestionNumber?: number;
}

export function TurnFeedbackCard({
  feedback,
  isComplete,
  onNextQuestion,
  nextQuestionNumber,
}: TurnFeedbackCardProps) {
  const [showModelAnswer, setShowModelAnswer] = useState(true);

  const starMetrics = [
    { label: "Situation", score: feedback.starSituationScore, notes: feedback.starSituationNotes },
    { label: "Task", score: feedback.starTaskScore, notes: feedback.starTaskNotes },
    { label: "Action", score: feedback.starActionScore, notes: feedback.starActionNotes },
    { label: "Result", score: feedback.starResultScore, notes: feedback.starResultNotes },
  ];

  const strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
  const improvements = Array.isArray(feedback.improvements) ? feedback.improvements : [];
  const powerVerbsUsed = Array.isArray(feedback.powerVerbsUsed) ? feedback.powerVerbsUsed : [];

  const renderRatingBar = (score: number) => {
    return (
      <div className="flex items-center space-x-1.5 w-full pt-1.5">
        {[1, 2, 3, 4, 5].map((val) => (
          <div
            key={val}
            className={`h-2 flex-1 rounded-full transition-all ${
              val <= score
                ? score >= 4
                  ? "bg-emerald-500"
                  : score === 3
                  ? "bg-sky-500"
                  : "bg-amber-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-7 p-6 sm:p-9 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <Award className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              STAR Rubric Evaluation
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Immediate constructive critique on your response structure
            </p>
          </div>
        </div>

        {/* Impact & Clarity */}
        <div className="flex items-center space-x-4 text-sm font-bold">
          <span className="text-sky-700">
            Impact: {feedback.impactScore}/5
          </span>
          <span className="text-emerald-700">
            Clarity: {feedback.clarityScore}/5
          </span>
        </div>
      </div>

      {/* STAR Pillar Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {starMetrics.map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 flex flex-col justify-start"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {item.score}/5
                </span>
              </div>
              {renderRatingBar(item.score)}
            </div>
            {item.notes && (
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">{item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Power Action Verbs */}
      {powerVerbsUsed.length > 0 && (
        <div className="flex items-center flex-wrap gap-2.5 text-sm">
          <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Power Verbs Used:</span>
          </span>
          {powerVerbsUsed.map((verb) => (
            <span
              key={verb}
              className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200"
            >
              {verb}
            </span>
          ))}
        </div>
      )}

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5">
          <div className="flex items-center space-x-2 font-bold text-sm sm:text-base text-slate-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5">
          <div className="flex items-center space-x-2 font-bold text-sm sm:text-base text-slate-900">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Actionable Refinements</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {improvements.map((imp, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model Answer (Collapsible or Prominent) */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowModelAnswer(!showModelAnswer)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-sky-50/80 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <span className="font-bold text-sm text-sky-900">
              High-Impact Exemplary Model Answer
            </span>
          </div>
          {showModelAnswer ? (
            <ChevronUp className="w-5 h-5 text-sky-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sky-600" />
          )}
        </button>

        {showModelAnswer && (
          <div className="px-5 pb-5 text-sm sm:text-base text-slate-800 leading-relaxed font-sans">
            <p className="italic bg-white p-4 sm:p-5 rounded-xl border border-sky-100 shadow-xs">
              &quot;{feedback.modelAnswer}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Next Question Transition CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextQuestion}
          className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all"
        >
          <span>
            {isComplete
              ? "View Final Scorecard"
              : `Continue to Question ${nextQuestionNumber || 2}`}
          </span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
