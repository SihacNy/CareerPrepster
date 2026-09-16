"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { ScorecardSummary } from "@/components/interview/ScorecardSummary";
import { CVRecommendationsCard } from "@/components/interview/CVRecommendationsCard";
import { QuestionReviewAccordion } from "@/components/interview/QuestionReviewAccordion";
import { InterviewScorecardData, InterviewSessionData } from "@/types/interview";
import { api } from "@/lib/api";

export default function InterviewScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [scorecard, setScorecard] = useState<InterviewScorecardData | null>(null);
  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScorecard() {
      setIsLoading(true);
      setError(null);
      try {
        const [scorecardData, sessionData] = await Promise.all([
          api.interviews.getScorecard(sessionId),
          api.interviews.getSession(sessionId),
        ]);
        setScorecard(scorecardData);
        setSession(sessionData);
      } catch (err: any) {
        setError(err.message || "Failed to load interview scorecard.");
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) {
      loadScorecard();
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Synthesizing Your Interview Scorecard...
          </h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Our AI coach is aggregating your STAR adherence, quantifying results, and cross-referencing your answers with your CV.
          </p>
        </div>
      </div>
    );
  }

  if (error || !scorecard || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 max-w-md mx-auto p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Scorecard Not Available</h2>
          <p className="text-xs text-slate-500">{error || "Could not retrieve scorecard details."}</p>
          <Link
            href="/interview"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
          >
            Back to Interview Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Top Header Actions Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/interview"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Interview Hub</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/interview"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Another Drill</span>
            </Link>

            {session.cvId && (
              <a
                href={`/editor?cvId=${session.cvId}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Apply Feedback in CV Editor</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Scorecard Report Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* 1. Scorecard Summary (Overall Score, Tiers, 4 Dimensional Bars, Strengths, Growth) */}
        <ScorecardSummary
          scorecard={scorecard}
          targetRoleTitle={session.targetRoleTitle}
          track={session.track}
        />

        {/* 2. Cross-Referenced CV Bullet Recommendations */}
        <CVRecommendationsCard
          recommendations={scorecard.cvRecommendations || []}
          cvId={session.cvId}
        />

        {/* 3. Question-by-Question Review Accordion */}
        <QuestionReviewAccordion questions={session.questions || []} />
      </main>
    </div>
  );
}
