"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInputArea } from "@/components/interview/AnswerInputArea";
import { TurnFeedbackCard } from "@/components/interview/TurnFeedbackCard";
import {
  InterviewSessionData,
  InterviewQuestionData,
  TurnFeedbackData,
  InputModality,
} from "@/types/interview";
import { api } from "@/lib/api";

export default function ActiveInterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestionData | null>(null);
  const [parentQuestion, setParentQuestion] = useState<InterviewQuestionData | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<TurnFeedbackData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true);
      try {
        const data = await api.interviews.getSession(sessionId);
        setSession(data);

        // If session is already completed, redirect to scorecard
        if (data.status === "COMPLETED") {
          router.push(`/interview/${sessionId}/scorecard`);
          return;
        }

        // Find current active unanswered question
        const questions = data.questions || [];
        const currentUnanswered = questions.find((q) => !q.responses || q.responses.length === 0);

        if (currentUnanswered) {
          setActiveQuestion(currentUnanswered);
          if (currentUnanswered.isProbe && currentUnanswered.parentQuestionId) {
            const parent = questions.find((q) => q.id === currentUnanswered.parentQuestionId);
            setParentQuestion(parent || null);
          }
        } else if (questions.length > 0) {
          // If all answered but not marked completed, take latest
          const latest = questions[questions.length - 1];
          setActiveQuestion(latest);
          if (latest.responses?.[0]?.feedback) {
            setCurrentFeedback(latest.responses[0].feedback);
          }
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
    try {
      const response = await api.interviews.submitAnswer(sessionId, {
        questionId: activeQuestion.id,
        responseText,
        inputModality: modality,
        durationSeconds,
      });

      if (response.type === "PROBE") {
        // Adaptive follow-up probe triggered!
        setParentQuestion(activeQuestion);
        setActiveQuestion(response.probeQuestion);
      } else if (response.type === "TURN_EVALUATION") {
        // Turn feedback ready
        setCurrentFeedback(response.feedback);
        // Pre-store next question
        if (response.nextQuestion) {
          // Keep active question until user clicks next
        }
      } else if (response.type === "SESSION_COMPLETED") {
        // Session concluded
        if (session.mode === "INSTANT_FEEDBACK" && (response as any).feedback) {
          setCurrentFeedback((response as any).feedback);
        } else {
          router.push(`/interview/${sessionId}/scorecard`);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to evaluate answer. Please try submitting again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transition to next question or scorecard after viewing turn feedback
  const handleNextQuestionTransition = async () => {
    setCurrentFeedback(null);
    setIsLoading(true);
    try {
      const refreshed = await api.interviews.getSession(sessionId);
      setSession(refreshed);

      if (refreshed.status === "COMPLETED") {
        router.push(`/interview/${sessionId}/scorecard`);
        return;
      }

      const questions = refreshed.questions || [];
      const currentUnanswered = questions.find((q) => !q.responses || q.responses.length === 0);

      if (currentUnanswered) {
        setActiveQuestion(currentUnanswered);
        if (currentUnanswered.isProbe && currentUnanswered.parentQuestionId) {
          const parent = questions.find((q) => q.id === currentUnanswered.parentQuestionId);
          setParentQuestion(parent || null);
        } else {
          setParentQuestion(null);
        }
      } else {
        router.push(`/interview/${sessionId}/scorecard`);
      }
    } catch (err: any) {
      setError("Failed to advance to next question.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const currentIndex = activeQuestion?.questionIndex || session?.currentQuestionIndex || 1;
  const totalQuestions = session?.totalQuestions || 5;
  const progressPercent = Math.min(100, Math.round((currentIndex / totalQuestions) * 100));

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
                <span className="capitalize">{session?.track.toLowerCase()} Track</span>
                <span>•</span>
                <span>{session?.mode === "INSTANT_FEEDBACK" ? "Instant Feedback" : "Exam Mode"}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Counter */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600">
              Q{currentIndex} of {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Room Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Question Card */}
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            parentQuestionText={parentQuestion?.questionText}
          />
        )}

        {/* 2. Feedback Card (When in Instant Feedback state) */}
        {currentFeedback ? (
          <TurnFeedbackCard
            feedback={currentFeedback}
            isComplete={currentIndex >= totalQuestions}
            onNextQuestion={handleNextQuestionTransition}
            nextQuestionNumber={currentIndex + 1}
          />
        ) : (
          /* 3. Answer Input Area (When awaiting candidate response) */
          <AnswerInputArea
            onSubmit={handleSubmitAnswer}
            isSubmitting={isSubmitting}
            disabled={!activeQuestion}
          />
        )}
      </main>
    </div>
  );
}
