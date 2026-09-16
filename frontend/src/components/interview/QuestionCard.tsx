"use client";

import React from "react";
import { HelpCircle, Sparkles, Tag, GitPullRequest, ArrowRight } from "lucide-react";
import { InterviewQuestionData } from "@/types/interview";

interface QuestionCardProps {
  question: InterviewQuestionData;
  currentIndex: number;
  totalQuestions: number;
  parentQuestionText?: string | null;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  parentQuestionText,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
      {/* Badges & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
            Question {currentIndex} of {totalQuestions}
          </span>
          {question.isProbe && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Adaptive Follow-Up Probe</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
            <Tag className="w-3 h-3" />
            <span>{question.competency}</span>
          </span>

          {question.contextReference && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>{question.contextReference}</span>
            </span>
          )}
        </div>
      </div>

      {/* If this is a follow-up probe, show the parent question context for clarity */}
      {question.isProbe && parentQuestionText && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 block mb-0.5">Initial Question Context:</span>
          <p className="italic">{parentQuestionText}</p>
        </div>
      )}

      {/* Main Question Text */}
      <div className="py-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed tracking-tight">
          {question.questionText}
        </h2>
      </div>

      {/* STAR Guidance Tip */}
      <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400">
        <HelpCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span>
          Tip: Structure your answer around the <strong>STAR</strong> framework (Situation, Task, Action, Result) with measurable metrics.
        </span>
      </div>
    </div>
  );
}
