"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface SessionHistoryItem {
  id: string;
  targetRoleTitle: string;
  track: "BEHAVIORAL" | "TECHNICAL" | "MIXED";
  sessionLength: "QUICK" | "STANDARD" | "FULL";
  mode: "INSTANT_FEEDBACK" | "EXAM";
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  overallScore?: number | null;
  startedAt: string;
  completedAt?: string | null;
  questionCount: number;
}

interface SessionHistoryTableProps {
  sessions: SessionHistoryItem[];
  isLoading: boolean;
  onRetake?: (session: SessionHistoryItem) => void;
  onNewDrillClick: () => void;
}

export function SessionHistoryTable({
  sessions,
  isLoading,
  onRetake,
  onNewDrillClick,
}: SessionHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500">Loading interview practice history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          No Practice Sessions Yet
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
          Start your first AI mock interview drill. Practice articulating your capstone projects and work achievements with real-time STAR feedback.
        </p>
        <button
          onClick={onNewDrillClick}
          className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <span>Start Practice Drill</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const getTrackBadge = (track: string) => {
    switch (track) {
      case "TECHNICAL":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Technical</span>;
      case "MIXED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">Mixed</span>;
      case "BEHAVIORAL":
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200">Behavioral</span>;
    }
  };

  const getScoreBadge = (score?: number | null, status?: string) => {
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" />
          <span>In Progress</span>
        </span>
      );
    }
    if (score === null || score === undefined) {
      return <span className="text-xs text-slate-400">—</span>;
    }
    const colorClass =
      score >= 85
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : score >= 70
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>
        {score} / 100
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3.5">Target Role</th>
              <th className="px-6 py-3.5">Track</th>
              <th className="px-6 py-3.5">Questions</th>
              <th className="px-6 py-3.5">Readiness Score</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/75 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {s.targetRoleTitle}
                </td>
                <td className="px-6 py-4">{getTrackBadge(s.track)}</td>
                <td className="px-6 py-4 text-slate-500">{s.questionCount} Qs</td>
                <td className="px-6 py-4">{getScoreBadge(s.overallScore, s.status)}</td>
                <td className="px-6 py-4 text-slate-400 text-[11px]">
                  {new Date(s.startedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {s.status === "COMPLETED" ? (
                    <Link
                      href={`/interview/${s.id}/scorecard`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
                    >
                      <span>Scorecard</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  ) : (
                    <Link
                      href={`/interview/${s.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </Link>
                  )}
                  {onRetake && s.status === "COMPLETED" && (
                    <button
                      onClick={() => onRetake(s)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Retake with same configuration"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
