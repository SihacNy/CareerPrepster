"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Upload,
  Search,
  Award,
  Sparkles,
  FolderOpen,
  LogIn,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { HistoryCard } from "@/components/history/HistoryCard";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { CVHistoryItem, CVHistoryStatus, normalizeCVData } from "@/types/cv";
import { useCV } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { cvApi, jobRoleApi } from "@/lib/api";
import { HISTORY_STORAGE_KEY } from "@/lib/storageKeys";

function getRoleDisplayName(rcv: any, roleMap: Map<string, string>): string {
  const isUuid = (val?: string) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

  if (typeof rcv.targetRole === "string" && rcv.targetRole.trim() && !isUuid(rcv.targetRole)) {
    return rcv.targetRole.trim();
  }
  if (typeof rcv.targetRole === "object" && rcv.targetRole !== null && rcv.targetRole.title) {
    return rcv.targetRole.title;
  }
  if (rcv.targetRoleId && roleMap.has(rcv.targetRoleId)) {
    return roleMap.get(rcv.targetRoleId)!;
  }
  return "General";
}

export default function HistoryPage() {
  const router = useRouter();
  const { clearAll } = useCV();
  const { isBackendSession } = useAuth();
  const [historyItems, setHistoryItems] = useState<CVHistoryItem[]>([]);
  const [roleMap, setRoleMap] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | CVHistoryStatus>("all");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(true);

  // Load history exclusively from MySQL when authenticated
  useEffect(() => {
    // Purge any stale localStorage history key
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch {
        // Ignore storage access errors
      }
    }

    if (!isBackendSession) {
      setHistoryItems([]);
      setIsLoadingRemote(false);
      return;
    }

    let isMounted = true;
    const fetchRemoteCVs = async () => {
      setIsLoadingRemote(true);
      try {
        const [remoteCvs, roles] = await Promise.all([
          cvApi.list(),
          jobRoleApi.search().catch(() => []),
        ]);
        const newRoleMap = new Map<string, string>();
        if (Array.isArray(roles)) {
          roles.forEach((r) => {
            if (r.id && r.title) newRoleMap.set(r.id, r.title);
          });
        }
        if (isMounted) {
          setRoleMap(newRoleMap);
        }

        if (isMounted && Array.isArray(remoteCvs)) {
          const items: CVHistoryItem[] = remoteCvs.map((rcv) => ({
            id: rcv.id,
            cvId: rcv.id,
            title: rcv.title || "Untitled CV",
            targetRole: getRoleDisplayName(rcv, newRoleMap),
            fullName: rcv.fullName || "Candidate",
            status: "draft",
            templateId: (rcv.templateId as any) || "classic",
            createdAt: rcv.createdAt,
            updatedAt: rcv.updatedAt,
          }));
          setHistoryItems(items);
        }
      } catch (err) {
        console.warn("Failed to load CV history from MySQL:", err);
      } finally {
        if (isMounted) setIsLoadingRemote(false);
      }
    };

    fetchRemoteCVs();
    return () => {
      isMounted = false;
    };
  }, [isBackendSession]);

  const handleCreateNew = () => {
    clearAll();
    router.push("/editor");
  };

  const handleDelete = async (id: string) => {
    try {
      await cvApi.delete(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.warn("Failed to delete remote CV from MySQL:", err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const existing = await cvApi.getById(id);
      if (!existing) return;
      const cloned = normalizeCVData({
        ...existing,
        id: undefined,
        title: `${existing.title || "Untitled CV"} (Copy)`,
        updatedAt: new Date().toISOString(),
      });
      await cvApi.create(cloned);
      const remoteCvs = await cvApi.list();
      if (Array.isArray(remoteCvs)) {
        setHistoryItems(
          remoteCvs.map((rcv) => ({
            id: rcv.id,
            cvId: rcv.id,
            title: rcv.title || "Untitled CV",
            targetRole: getRoleDisplayName(rcv, roleMap),
            fullName: rcv.fullName || "Candidate",
            status: "draft",
            templateId: (rcv.templateId as any) || "classic",
            createdAt: rcv.createdAt,
            updatedAt: rcv.updatedAt,
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to duplicate CV in MySQL:", err);
    }
  };

  // Filtered history items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [historyItems, searchQuery, selectedStatus]);

  // Quick stats
  const stats = useMemo(() => {
    const total = historyItems.length;
    const scores = historyItems
      .map((i) => i.atsScore)
      .filter((s): s is number => typeof s === "number");
    const highestScore = scores.length > 0 ? Math.max(...scores) : null;
    const exportedCount = historyItems.filter((i) => i.status === "exported").length;

    return { total, highestScore, exportedCount };
  }, [historyItems]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Title & Top CTAs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Resume & Audit History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your saved CV drafts, ATS diagnostic scans, and exported vector PDFs stored in MySQL.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Resume</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs shadow-sky-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Resume</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <FileText className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium">Saved Resumes</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium">Highest ATS Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.highestScore !== null ? `${stats.highestScore}/100` : "None yet"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium">Exported Documents</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.exportedCount}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, role, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({historyItems.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("draft")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === "draft"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Drafts ({historyItems.filter((i) => i.status === "draft").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("audited")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === "audited"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Audited ({historyItems.filter((i) => i.status === "audited").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("exported")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === "exported"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Exported ({historyItems.filter((i) => i.status === "exported").length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingRemote ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs my-4 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading saved resumes from MySQL...</p>
          </div>
        ) : !isBackendSession ? (
          /* Guest Not Signed In Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs my-4">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">
              Sign in to View MySQL Saved Resumes
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
              Resume history is stored directly in MySQL cloud database. Sign in with Google to save, sync, and access your CV history across devices.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                Create New Resume
              </button>
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          /* History Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Empty State for Authenticated User */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs my-4">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">
              No matching resumes found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery
                ? `No resumes match your search query "${searchQuery}". Try clearing your search.`
                : "You don't have any saved resumes in MySQL yet. Start drafting or import an existing document."}
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Import Resume
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    Create New Resume
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Onboarding modal for import or fresh resume */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <Footer />
    </div>
  );
}
