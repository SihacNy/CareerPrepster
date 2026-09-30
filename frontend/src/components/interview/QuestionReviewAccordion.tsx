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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
      <div className="pb-5 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Question-by-Question Review
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Inspect all questions, your answers, and AI-generated model improvements
        </p>
      </div>

      <div className="space-y-3.5">
        {questions.map((q, idx) => {
          const isOpen = !!openIndexes[idx];
          const response = q.responses?.[0];
          const feedback = response?.feedback;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? "border-sky-300 shadow-xs"
                  : "border-slate-200/90 hover:border-slate-300"
              } overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-5 sm:p-6 flex items-start justify-between text-left hover:bg-slate-50/70 transition-colors gap-4"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center text-sm font-extrabold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <span className="text-sm sm:text-base font-bold text-slate-900 block leading-snug">
                      {q.questionText}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 block">
                      {q.competency} {q.isProbe ? "• Adaptive Follow-Up" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pt-1 text-slate-400">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="p-6 sm:p-7 border-t border-slate-100 bg-slate-50/60 space-y-5 text-sm">
                  {/* Candidate Answer */}
                  <div>
                    <span className="font-bold text-slate-700 block mb-2 text-xs uppercase tracking-wider">
                      Your Answer:
                    </span>
                    {response ? (
                      <p className="p-4 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-sm sm:text-base">
                        {response.responseText}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-sm">No response submitted</p>
                    )}
                  </div>

                  {/* Feedback Details if present */}
                  {feedback && (
                    <div className="space-y-4 pt-1">
                      <div>
                        <span className="font-bold text-slate-700 block mb-2 text-xs uppercase tracking-wider">
                          STAR Framework Scoring:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Situation</span>
                            <span className="text-lg font-black text-slate-900 mt-0.5 block">{feedback.starSituationScore}/5</span>
                          </div>
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Task</span>
                            <span className="text-lg font-black text-slate-900 mt-0.5 block">{feedback.starTaskScore}/5</span>
                          </div>
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Action</span>
                            <span className="text-lg font-black text-slate-900 mt-0.5 block">{feedback.starActionScore}/5</span>
                          </div>
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Result</span>
                            <span className="text-lg font-black text-slate-900 mt-0.5 block">{feedback.starResultScore}/5</span>
                          </div>
                        </div>
                      </div>

                      {/* Areas for Improvement */}
                      {feedback.improvements && feedback.improvements.length > 0 && (
                        <div className="p-4.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                            Key Areas for Improvement:
                          </span>
                          <ul className="space-y-1.5 text-sm text-amber-950 leading-relaxed list-disc list-inside">
                            {feedback.improvements.map((imp, impIdx) => (
                              <li key={impIdx}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Model Answer */}
                      {feedback.modelAnswer && (
                        <div className="p-4.5 bg-sky-50/80 rounded-xl border border-sky-200/80 space-y-2">
                          <div className="flex items-center space-x-1.5 font-bold text-sky-900 text-xs uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span>Exemplary Model Answer:</span>
                          </div>
                          <p className="text-sm sm:text-base text-sky-950 italic leading-relaxed font-medium">
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
