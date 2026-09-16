"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Award, Sparkles } from "lucide-react";
import { InterviewQuestionData } from "@/types/interview";

interface QuestionReviewAccordionProps {
  questions: InterviewQuestionData[];
}

export function QuestionReviewAccordion({ questions }: QuestionReviewAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({ 0: true });

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Question-by-Question Review
          </h3>
          <p className="text-xs text-slate-500">
            Inspect all questions, your answers, and AI-generated model improvements
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isOpen = !!openIndexes[idx];
          const response = q.responses?.[0];
          const feedback = response?.feedback;

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200/90 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-4.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center space-x-3 pr-4">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {q.questionText}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {q.competency} {q.isProbe ? "• Adaptive Follow-Up" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                  {/* Candidate Answer */}
                  <div>
                    <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                      Your Answer:
                    </span>
                    {response ? (
                      <p className="p-3.5 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                        {response.responseText}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">No response submitted</p>
                    )}
                  </div>

                  {/* Feedback Details if present */}
                  {feedback && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Situation</span>
                          <span className="font-bold text-slate-900">{feedback.starSituationScore}/5</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Task</span>
                          <span className="font-bold text-slate-900">{feedback.starTaskScore}/5</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Action</span>
                          <span className="font-bold text-slate-900">{feedback.starActionScore}/5</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Result</span>
                          <span className="font-bold text-slate-900">{feedback.starResultScore}/5</span>
                        </div>
                      </div>

                      {/* Model Answer */}
                      {feedback.modelAnswer && (
                        <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-sky-900 text-[11px]">
                            <Sparkles className="w-3 h-3 text-sky-600" />
                            <span>Exemplary Model Answer:</span>
                          </div>
                          <p className="text-slate-700 italic leading-relaxed">
                            &quot;{feedback.modelAnswer}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
