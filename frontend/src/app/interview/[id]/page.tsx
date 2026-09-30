"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  GitPullRequest,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInputArea } from "@/components/interview/AnswerInputArea";
import { TurnFeedbackCard } from "@/components/interview/TurnFeedbackCard";
import {
  InterviewSessionData,
  InterviewQuestionData,
  InputModality,
  TurnFeedbackData,
} from "@/types/interview";
import { api } from "@/lib/api";

export default function ActiveInterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [activeQuestion, setActiveQuestion] =
    useState<InterviewQuestionData | null>(null);
  const [parentQuestion, setParentQuestion] =
    useState<InterviewQuestionData | null>(null);
  const [lastEvaluatedQuestionText, setLastEvaluatedQuestionText] =
    useState<string | null>(null);

  // Instant Feedback mode state
  const [turnFeedback, setTurnFeedback] = useState<TurnFeedbackData | null>(null);
  const [nextQuestionPending, setNextQuestionPending] =
    useState<InterviewQuestionData | null>(null);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.interviews.getSession(sessionId);
        setSession(data);

        // If session is already completed, redirect to scorecard
        if (data.status === "COMPLETED") {
          router.push(`/interview/${sessionId}/scorecard`);
          return;
        }

        const questions = data.questions || [];

        // Find current active unanswered question (ordered by questionIndex asc, createdAt asc)
        const currentUnanswered = questions.find(
          (q) => !q.responses || q.responses.length === 0
        );

        if (currentUnanswered) {
          setActiveQuestion(currentUnanswered);
          if (currentUnanswered.isProbe && currentUnanswered.parentQuestionId) {
            const parent = questions.find(
              (q) => q.id === currentUnanswered.parentQuestionId
            );
            setParentQuestion(parent || null);
          } else {
            setParentQuestion(null);
          }
        } else if (questions.length > 0) {
          // All existing questions answered — redirect to scorecard
          router.push(`/interview/${sessionId}/scorecard`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load interview session.");
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, router]);

  // Handle answer submission
  const handleSubmitAnswer = async (
    responseText: string,
    modality: InputModality,
    durationSeconds: number
  ) => {
    if (!activeQuestion || !session) return;

    setIsSubmitting(true);
    setError(null);

    const currentQ = activeQuestion;
    setLastEvaluatedQuestionText(currentQ.questionText);

    try {
      const response = await api.interviews.submitAnswer(sessionId, {
        questionId: currentQ.id,
        responseText,
        inputModality: modality,
        durationSeconds,
      });

      // 1. Adaptive follow-up probe triggered
      if (response.type === "PROBE") {
        const probeQ = response.probeQuestion;
        setParentQuestion(currentQ);
        setActiveQuestion(probeQ);

        // Update local session state to include the probe and record previous response
        setSession((prev) => {
          if (!prev) return prev;
          const questionsList = [...(prev.questions || [])];
          const parentIdx = questionsList.findIndex((q) => q.id === currentQ.id);

          if (parentIdx >= 0) {
            questionsList[parentIdx] = {
              ...questionsList[parentIdx],
              responses: [
                ...(questionsList[parentIdx].responses || []),
                {
                  id: "temp-resp-" + Date.now(),
                  questionId: currentQ.id,
                  responseText,
                  inputModality: modality,
                  durationSeconds,
                  wordCount: responseText.trim().split(/\s+/).filter(Boolean).length,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }

          if (!questionsList.some((q) => q.id === probeQ.id)) {
            questionsList.push(probeQ);
          }

          return { ...prev, questions: questionsList };
        });

        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // 2. Session completed
      if (response.type === "SESSION_COMPLETED") {
        if (session.mode === "INSTANT_FEEDBACK" && response.feedback) {
          // In Instant Feedback mode, let candidate review final question feedback first
          setTurnFeedback(response.feedback);
          setIsSessionFinished(true);
          setIsSubmitting(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        router.push(`/interview/${sessionId}/scorecard`);
        return;
      }

      // 3. Standard Turn Evaluation
      if (session.mode === "INSTANT_FEEDBACK") {
        // Show TurnFeedbackCard
        setTurnFeedback(response.feedback);
        setNextQuestionPending(response.nextQuestion || null);

        // Update local session questions
        setSession((prev) => {
          if (!prev) return prev;
          const questionsList = [...(prev.questions || [])];
          const currIdx = questionsList.findIndex((q) => q.id === currentQ.id);

          if (currIdx >= 0) {
            questionsList[currIdx] = {
              ...questionsList[currIdx],
              responses: [
                ...(questionsList[currIdx].responses || []),
                {
                  id: "temp-resp-" + Date.now(),
                  questionId: currentQ.id,
                  responseText,
                  inputModality: modality,
                  durationSeconds,
                  wordCount: responseText.trim().split(/\s+/).filter(Boolean).length,
                  createdAt: new Date().toISOString(),
                  feedback: response.feedback,
                },
              ],
            };
          }

          if (
            response.nextQuestion &&
            !questionsList.some((q) => q.id === response.nextQuestion!.id)
          ) {
            questionsList.push(response.nextQuestion);
          }

          return { ...prev, questions: questionsList };
        });

        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Exam Mode: advance seamlessly to next question
        if (response.nextQuestion) {
          setActiveQuestion(response.nextQuestion);
          setParentQuestion(null);

          setSession((prev) => {
            if (!prev) return prev;
            const questionsList = [...(prev.questions || [])];
            const currIdx = questionsList.findIndex((q) => q.id === currentQ.id);

            if (currIdx >= 0) {
              questionsList[currIdx] = {
                ...questionsList[currIdx],
                responses: [
                  ...(questionsList[currIdx].responses || []),
                  {
                    id: "temp-resp-" + Date.now(),
                    questionId: currentQ.id,
                    responseText,
                    inputModality: modality,
                    durationSeconds,
                    wordCount: responseText.trim().split(/\s+/).filter(Boolean).length,
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
            }

            if (!questionsList.some((q) => q.id === response.nextQuestion!.id)) {
              questionsList.push(response.nextQuestion!);
            }

            return { ...prev, questions: questionsList };
          });

          setIsSubmitting(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          router.push(`/interview/${sessionId}/scorecard`);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to evaluate answer. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Instant Feedback "Continue to Next Question" handler
  const handleProceedToNextQuestion = () => {
    if (isSessionFinished) {
      router.push(`/interview/${sessionId}/scorecard`);
      return;
    }

    if (nextQuestionPending) {
      setActiveQuestion(nextQuestionPending);
      setParentQuestion(null);
      setTurnFeedback(null);
      setNextQuestionPending(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/interview/${sessionId}/scorecard`);
    }
  };

  // --- Loading & Error states ---
  if (isLoading && !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs text-slate-500">Entering interview room...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 max-w-lg mx-auto p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Session Error</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link
            href="/interview"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
          >
            Return to Interview Hub
          </Link>
        </div>
      </div>
    );
  }

  // --- Progress calculations ---
  const totalQuestions = session?.totalQuestions || 5;
  const questionsList = session?.questions || [];

  // Primary questions (excluding probes)
  const primaryQuestions = questionsList.filter((q) => !q.isProbe);

  // A primary question is completed if it has a response AND any child probe also has a response
  const completedPrimaryCount = primaryQuestions.filter((pq) => {
    const hasResponse = pq.responses && pq.responses.length > 0;
    if (!hasResponse) return false;
    const childProbe = questionsList.find(
      (q) => q.isProbe && q.parentQuestionId === pq.id
    );
    if (childProbe) {
      return Boolean(childProbe.responses && childProbe.responses.length > 0);
    }
    return true;
  }).length;

  // Active question index in primary track (1-indexed)
  const activePrimaryIndex = activeQuestion
    ? activeQuestion.questionIndex
    : Math.min(totalQuestions, completedPrimaryCount + 1);

  const progressPercent = Math.min(
    100,
    Math.round((completedPrimaryCount / totalQuestions) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Drill Progress Banner */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/interview"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Exit drill"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                {session?.targetRoleTitle}
              </span>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <span className="capitalize">
                  {session?.track.toLowerCase()} Track
                </span>
                <span>•</span>
                <span
                  className={
                    session?.mode === "INSTANT_FEEDBACK"
                      ? "text-sky-600 font-semibold"
                      : "text-slate-500 font-medium"
                  }
                >
                  {session?.mode === "INSTANT_FEEDBACK"
                    ? "Instant Feedback Mode"
                    : "Exam Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress dots & counter */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Dot indicators */}
            <div className="flex items-center space-x-1.5">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const questionNum = i + 1;
                const isCompleted = questionNum < activePrimaryIndex;
                const isActive = questionNum === activePrimaryIndex;
                const isProbeActive = isActive && activeQuestion?.isProbe;

                return (
                  <span
                    key={i}
                    title={`Question ${questionNum}`}
                    className={`block rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "w-2.5 h-2.5 bg-emerald-500"
                        : isProbeActive
                        ? "w-3 h-3 bg-amber-500 ring-2 ring-amber-300 animate-pulse"
                        : isActive
                        ? "w-3 h-3 bg-sky-500 ring-2 ring-sky-200"
                        : "w-2 h-2 bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-xs font-semibold text-slate-600">
              {activeQuestion?.isProbe ? (
                <span className="text-amber-700 font-medium">
                  Question {activePrimaryIndex} of {totalQuestions} (Follow-Up Probe)
                </span>
              ) : (
                <span>
                  {completedPrimaryCount}/{totalQuestions} answered
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Smooth progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="bg-sky-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Room Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: Instant Feedback Card View */}
        {turnFeedback ? (
          <div className="space-y-6">
            {lastEvaluatedQuestionText && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                <span className="font-semibold text-slate-700 block">Question Evaluated:</span>
                <p className="text-slate-600 italic leading-relaxed">
                  &quot;{lastEvaluatedQuestionText}&quot;
                </p>
              </div>
            )}

            <TurnFeedbackCard
              feedback={turnFeedback}
              isComplete={isSessionFinished}
              onNextQuestion={handleProceedToNextQuestion}
              nextQuestionNumber={nextQuestionPending?.questionIndex || activePrimaryIndex + 1}
            />
          </div>
        ) : (
          /* State 2: Active Question & Input View */
          <>
            {/* Adaptive Probe Highlight Banner */}
            {activeQuestion?.isProbe && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start space-x-3 shadow-xs animate-in fade-in duration-300">
                <GitPullRequest className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-800">
                    Interviewer Follow-Up Probe
                  </span>
                  <p className="text-amber-700 leading-relaxed">
                    The interviewer is probing for more specifics on your previous response. Elaborate with the concrete tools, actions, and measurable outcomes you achieved.
                  </p>
                </div>
              </div>
            )}

            {/* Question Card */}
            {activeQuestion && (
              <QuestionCard
                question={activeQuestion}
                currentIndex={activePrimaryIndex}
                totalQuestions={totalQuestions}
                parentQuestionText={parentQuestion?.questionText}
              />
            )}

            {/* Answer Input Area — keyed by question ID to ensure clean reset on every question/probe */}
            {activeQuestion && (
              <AnswerInputArea
                key={activeQuestion.id}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
