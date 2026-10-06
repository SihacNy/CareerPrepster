"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  PlayCircle,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  FileEdit,
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { SessionSetupModal } from "@/components/interview/SessionSetupModal";
import { SessionHistoryTable } from "@/components/interview/SessionHistoryTable";
import { CreateInterviewSessionPayload } from "@/types/interview";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function InterviewHubPage() {
  const router = useRouter();
  const { user, isBackendSession } = useAuth();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load past interview history
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await api.interviews.listSessions({ limit: 20 });
      setSessions(result.sessions || []);
    } catch (err) {
      // User may not be logged in or no history yet
      setSessions([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user, isBackendSession]);

  const handleStartSession = async (payload: CreateInterviewSessionPayload) => {
    const response = await api.interviews.createSession(payload);
    if (response?.session?.id) {
      router.push(`/interview/${response.session.id}`);
    }
  };

  const handleRetake = (pastSession: any) => {
    setIsSetupOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-white border border-slate-200/80 p-8 sm:p-12 overflow-hidden shadow-xs">
          <div className="max-w-3xl space-y-5 relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master Your Interview Answers with{" "}
              <span className="text-sky-600 underline decoration-yellow-300 underline-offset-4">
                Real-Time STAR Coaching
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Don&apos;t get caught off guard by tough behavioral or project defense questions.
              CareerPrepster ingests your CV claims to conduct tailored, multi-turn mock interviews,
              evaluating your Situation, Task, Action, and Result structure with immediate actionable critique.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsSetupOpen(true)}
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Practice Drill</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Decorative Feature Tags */}
          <div className="mt-8 pt-8 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-600">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100/80 text-sky-600 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Contextual Questions</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Directly derived from your capstone projects, internships, and technical skills.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Adaptive Probing</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Follow-up probing questions challenge vague answers to extract metrics and tools.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">CV Feedback Loop</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Translates strong spoken interview points into upgraded CV bullet point revisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History / Past Drills Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Practice History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your readiness score progression across behavioral and technical drills
              </p>
            </div>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Drill</span>
            </button>
          </div>

          <SessionHistoryTable
            sessions={sessions}
            isLoading={isLoadingHistory}
            onRetake={handleRetake}
            onNewDrillClick={() => setIsSetupOpen(true)}
          />
        </div>
      </main>

      {/* Setup Drill Modal */}
      <SessionSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartSession={handleStartSession}
      />
    </div>
  );
}
