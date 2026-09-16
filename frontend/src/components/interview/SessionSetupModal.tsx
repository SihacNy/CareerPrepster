"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  Layers,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  LogIn,
} from "lucide-react";
import {
  InterviewTrack,
  SessionLength,
  PracticeMode,
  CreateInterviewSessionPayload,
} from "@/types/interview";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface CVOption {
  id: string;
  title: string;
  targetRoleId?: string | null;
  updatedAt: string;
}

interface SessionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (payload: CreateInterviewSessionPayload) => Promise<void>;
  initialCVId?: string | null;
}

export function SessionSetupModal({
  isOpen,
  onClose,
  onStartSession,
  initialCVId = null,
}: SessionSetupModalProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cvs, setCvs] = useState<CVOption[]>([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(initialCVId);
  const [targetRoleTitle, setTargetRoleTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [track, setTrack] = useState<InterviewTrack>("BEHAVIORAL");
  const [sessionLength, setSessionLength] = useState<SessionLength>("STANDARD");
  const [mode, setMode] = useState<PracticeMode>("INSTANT_FEEDBACK");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available CVs on modal open
  useEffect(() => {
    if (!isOpen) return;
    setError(null); // Reset any stale errors when modal opens
    async function loadCvs() {
      setIsLoadingCvs(true);
      try {
        const result = await api.cvs.list();
        setCvs(result as CVOption[]);
        if (result && result.length > 0 && !selectedCvId) {
          const defaultCv = result[0];
          setSelectedCvId(defaultCv.id);
          // Pre-fill target role title from CV title as a default placeholder
          if (defaultCv.title) {
            setTargetRoleTitle(defaultCv.title);
          }
        }
      } catch (err) {
        // Not logged in or no CVs; user can still type target role directly
      } finally {
        setIsLoadingCvs(false);
      }
    }
    loadCvs();
  }, [isOpen]);

  // Sync role title when selected CV changes
  const handleSelectCv = (cvId: string | null) => {
    setSelectedCvId(cvId);
    if (cvId) {
      const found = cvs.find((c) => c.id === cvId);
      if (found?.title && !targetRoleTitle) {
        setTargetRoleTitle(found.title);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleTitle.trim()) {
      setError("Please specify a target role or job title.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onStartSession({
        cvId: selectedCvId,
        targetRoleTitle: targetRoleTitle.trim(),
        jobDescription: jobDescription.trim() || null,
        track,
        sessionLength,
        mode,
      });
    } catch (err: any) {
      const isAuthError =
        err.code === "UNAUTHORIZED" ||
        err.code === "HTTP_401" ||
        err.message?.toLowerCase().includes("authentication") ||
        err.message?.toLowerCase().includes("session token");
      setError(
        isAuthError
          ? "You need to be signed in to start a practice drill. Click Sign In in the top-right corner."
          : err.message || "Failed to initialize interview drill. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Configure Interview Practice Drill
              </h2>
              <p className="text-xs text-slate-500">
                Personalized AI interviewer simulation tailored to your experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Auth gate — shown when user is not signed in */}
          {!isAuthLoading && !user && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-sky-900">Sign in to start a practice drill</p>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  CareerPrepster uses your account to personalize questions from your CV and save your progress.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Submission/validation errors */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Contextual CV Ingestion */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Contextual CV Baseline (Optional)
            </label>
            {isLoadingCvs ? (
              <div className="flex items-center space-x-2 text-xs text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                <span>Loading your saved CV documents...</span>
              </div>
            ) : cvs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectCv(null)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedCvId === null
                      ? "border-sky-500 bg-sky-50/50 text-slate-900 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>No CV (Role-Based Drill)</span>
                    {selectedCvId === null && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Questions based strictly on target job role</p>
                </button>

                {cvs.map((cv) => (
                  <button
                    key={cv.id}
                    type="button"
                    onClick={() => handleSelectCv(cv.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCvId === cv.id
                        ? "border-sky-500 bg-sky-50/50 text-slate-900 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between truncate">
                      <span className="truncate flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">{cv.title}</span>
                      </span>
                      {selectedCvId === cv.id && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {cv.targetRoleId ? "Targeted CV" : "Tailored CV claims & projects"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                No saved resumes found. Enter your target role below to practice immediately!
              </p>
            )}
          </div>

          {/* Section 2: Target Role & Job Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Career Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={targetRoleTitle}
                  onChange={(e) => setTargetRoleTitle(e.target.value)}
                  placeholder="e.g. Junior Full-Stack Engineer, Frontend Developer, Data Analyst"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key requirements or job posting bullets here to anchor situational questions..."
                rows={2}
                className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Section 3: Interview Track */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Interview Track
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "BEHAVIORAL" as InterviewTrack,
                  title: "Behavioral (STAR)",
                  desc: "Teamwork, conflict, ownership, and adaptability scenarios.",
                },
                {
                  id: "TECHNICAL" as InterviewTrack,
                  title: "Technical & Projects",
                  desc: "System architecture, tech hurdles, and project defense.",
                },
                {
                  id: "MIXED" as InterviewTrack,
                  title: "Mixed Situational",
                  desc: "Comprehensive blend of behavioral & technical questions.",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTrack(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    track === item.id
                      ? "border-sky-500 bg-sky-50/50 text-slate-900 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{item.title}</span>
                    {track === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Length & Practice Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Drill Length
              </label>
              <div className="space-y-2">
                {[
                  { id: "QUICK" as SessionLength, label: "Quick Drill", time: "3 questions (~10 min)" },
                  { id: "STANDARD" as SessionLength, label: "Standard Practice", time: "5 questions (~20 min)" },
                  { id: "FULL" as SessionLength, label: "Full Mock Interview", time: "8 questions (~35 min)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSessionLength(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all text-xs ${
                      sessionLength === item.id
                        ? "border-sky-500 bg-sky-50/50 font-semibold text-slate-900"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Practice Mode
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: "INSTANT_FEEDBACK" as PracticeMode,
                    title: "Instant Feedback Mode",
                    desc: "Rubric critique & model answer after each response.",
                  },
                  {
                    id: "EXAM" as PracticeMode,
                    title: "Exam Mode",
                    desc: "Continuous mock; full evaluation at final scorecard.",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      mode === item.id
                        ? "border-sky-500 bg-sky-50/50 text-slate-900"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>{item.title}</span>
                      {mode === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !targetRoleTitle.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing Interview Simulation...</span>
              </>
            ) : (
              <>
                <span>Start Practice Drill</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
