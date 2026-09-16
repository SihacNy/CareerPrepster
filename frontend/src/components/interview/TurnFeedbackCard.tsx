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

  const renderRatingBar = (score: number) => {
    return (
      <div className="flex space-x-1 items-center">
        {[1, 2, 3, 4, 5].map((val) => (
          <div
            key={val}
            className={`h-2 w-4 rounded-xs transition-all ${
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
        <span className="text-[11px] font-bold text-slate-700 ml-1.5">{score}/5</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              STAR Rubric Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Immediate constructive critique on your response structure
            </p>
          </div>
        </div>

        {/* Impact & Clarity Pills */}
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Impact: {feedback.impactScore}/5
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Clarity: {feedback.clarityScore}/5
          </span>
        </div>
      </div>

      {/* STAR Pillar Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {starMetrics.map((item) => (
          <div
            key={item.label}
            className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                {item.label}
              </span>
              {renderRatingBar(item.score)}
            </div>
            {item.notes && (
              <p className="text-[11px] text-slate-500 leading-snug">{item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Power Action Verbs */}
      {feedback.powerVerbsUsed?.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Power Verbs Used:</span>
          </span>
          {feedback.powerVerbsUsed.map((verb) => (
            <span
              key={verb}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
            >
              {verb}
            </span>
          ))}
        </div>
      )}

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-800">
            {feedback.strengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-xs text-amber-900">
            <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Actionable Refinements</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-800">
            {feedback.improvements.map((imp, i) => (
              <li key={i} className="flex items-start space-x-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model Answer (Collapsible or Prominent) */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowModelAnswer(!showModelAnswer)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-sky-50/80 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-xs text-sky-900">
              High-Impact Exemplary Model Answer
            </span>
          </div>
          {showModelAnswer ? (
            <ChevronUp className="w-4 h-4 text-sky-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-sky-600" />
          )}
        </button>

        {showModelAnswer && (
          <div className="px-4 pb-4 pt-1 border-t border-sky-100 text-xs text-slate-700 leading-relaxed font-sans">
            <p className="italic bg-white p-3.5 rounded-lg border border-sky-100 shadow-2xs">
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
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <span>
            {isComplete
              ? "View Final Scorecard"
              : `Continue to Question ${nextQuestionNumber || 2}`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
