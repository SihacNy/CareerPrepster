"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  Sliders,
  Globe2,
  FileQuestion,
  Loader2,
  LogIn,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Radar,
  ArrowRight,
  Briefcase,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { JobMatchCard } from "@/components/jobs/JobMatchCard";
import { JobPreferencesModal } from "@/components/jobs/JobPreferencesModal";
import { JobFilters } from "@/components/jobs/JobFilters";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/auth";
import { jobsApi } from "@/lib/api";
import type {
  JobMatchRecommendationDto,
  JobSearchPreferenceDto,
  JobListFilterParams,
  RecommendationStatus,
} from "@/types/jobs";

export default function JobsPage() {
  const { user, isBackendSession, loginAsDemo } = useAuth();

  // State
  const [recommendations, setRecommendations] = useState<JobMatchRecommendationDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<JobListFilterParams>({
    status: "ACTIVE",
    minScore: 0,
    sortBy: "matchScore",
    sortOrder: "desc",
    page: 1,
    limit: 12,
  });

  // Modals
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<JobSearchPreferenceDto | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cooldown
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (!isBackendSession) {
        await loginAsDemo(user.email);
      }
      const response = await jobsApi.listRecommendations(filters);
      setRecommendations(response.items || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to fetch job recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, user, isBackendSession, loginAsDemo]);

  // Fetch preferences & cooldown status
  const fetchInitialMeta = useCallback(async () => {
    if (!user) return;

    try {
      if (!isBackendSession) {
        await loginAsDemo(user.email);
      }
      const [prefs, refreshStatus] = await Promise.all([
        jobsApi.getPreferences().catch(() => null),
        jobsApi.getRefreshStatus().catch(() => null),
      ]);

      if (prefs) setPreferences(prefs);
      if (refreshStatus?.cooldownSecondsRemaining) {
        setCooldownSeconds(refreshStatus.cooldownSecondsRemaining);
      }
    } catch {
      // Ignore initial metadata fetch errors
    }
  }, [user, isBackendSession, loginAsDemo]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    fetchInitialMeta();
  }, [fetchInitialMeta]);

  // Live Countdown Timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Handle Refresh Trigger
  const handleTriggerRefresh = async () => {
    if (cooldownSeconds > 0 || isRefreshing) return;
    setIsRefreshing(true);
    setStatusMessage("Recalculating recommendations against your latest CV in the background...");

    try {
      const res = await jobsApi.triggerRefresh();
      setCooldownSeconds(res.cooldownSecondsRemaining || 900);
      // Wait a moment then reload recommendations
      setTimeout(async () => {
        await fetchRecommendations();
        setIsRefreshing(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err: any) {
      setIsRefreshing(false);
      setStatusMessage(err.message || "Failed to trigger refresh");
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Handle Live Playwright Discovery Trigger
  const handleAdminDiscovery = async () => {
    if (isDiscovering) return;
    setIsDiscovering(true);
    setStatusMessage("Launching Playwright to scrape live LinkedIn vacancies...");

    try {
      const res = await jobsApi.adminDiscover("Software Engineer", "Remote");
      setStatusMessage(`Scrape complete! Scanned ${res.jobsScanned} postings, added ${res.jobsInserted} new.`);
      await fetchRecommendations();
    } catch (err: any) {
      setStatusMessage(`Discovery failed: ${err.message}`);
    } finally {
      setIsDiscovering(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Status Update for Card
  const handleUpdateStatus = async (id: string, newStatus: RecommendationStatus, userNotes?: string) => {
    try {
      const updated = await jobsApi.updateRecommendationStatus(id, newStatus, userNotes);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status, userNotes: updated.userNotes } : r))
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async (newPrefs: Partial<JobSearchPreferenceDto>) => {
    const updated = await jobsApi.updatePreferences(newPrefs);
    setPreferences(updated);
    // Reload matches with new preference weighting
    fetchRecommendations();
  };

  const formatCooldown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? `0${s}` : s}s`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Top CTAs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Personalized Job Matches</span>
              <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                AI Powered
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live vacancies scored against your verified CV data using 4-pillar algorithmic alignment and Google Gemini AI.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Preferences Button */}
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Preferences</span>
            </button>

            {/* Scan LinkedIn Button */}
            <button
              type="button"
              disabled={isDiscovering}
              onClick={handleAdminDiscovery}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Globe2 className={`w-3.5 h-3.5 text-emerald-600 ${isDiscovering ? "animate-spin" : ""}`} />
              <span>{isDiscovering ? "Scraping..." : "Scan LinkedIn"}</span>
            </button>

            {/* Refresh Matches Button */}
            <button
              type="button"
              disabled={cooldownSeconds > 0 || isRefreshing}
              onClick={handleTriggerRefresh}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs shadow-sky-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>
                {isRefreshing
                  ? "Evaluating..."
                  : cooldownSeconds > 0
                  ? `Refresh in ${formatCooldown(cooldownSeconds)}`
                  : "Refresh Matches"}
              </span>
            </button>
          </div>
        </div>

        {/* Analytics & Progress Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium">Total Matches Found</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{totalItems}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium">Highest Fit Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {recommendations.length > 0
                ? `${Math.max(...recommendations.map((r) => r.overallScore))}%`
                : "None yet"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium">Saved / Applied</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {recommendations.filter((r) => r.status === "SAVED" || r.status === "APPLIED").length}
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="mb-6 p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center gap-2 animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Authenticated Dashboard */}
        {user && (
          <>
            {/* Filters Bar */}
            <JobFilters
              filters={filters}
              onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
              totalItems={totalItems}
            />

            {/* Recommendations Grid / Skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-6 h-72 animate-pulse flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-4/5" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">No vacancies match your criteria</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Try lowering your minimum match score filter or clearing the search terms.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFilters({ status: "ACTIVE", minScore: 0, page: 1, sortBy: "matchScore", sortOrder: "desc" })}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminDiscovery}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Globe2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Scan New Jobs</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Job Match Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec) => (
                  <JobMatchCard
                    key={rec.id}
                    recommendation={rec}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={filters.page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Page {filters.page || 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <JobPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onSave={handleSavePreferences}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <Footer />
    </div>
  );
}
