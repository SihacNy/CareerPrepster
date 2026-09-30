"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { CVForm } from "@/components/editor/CVForm";
import { LivePreview } from "@/components/preview/LivePreview";
import { MobileViewToggle } from "@/components/editor/MobileViewToggle";
import { ContinueActionBar } from "@/components/editor/ContinueActionBar";
import { useCV, isRealCVDraft } from "@/lib/store";
import { cvApi } from "@/lib/api";
import { Columns2, PenLine, Eye, Loader2, X, ArrowLeft } from "lucide-react";

function EditorContent() {
  const { cvData, mobileView, desktopView, setDesktopView, loadCV, restoreDraft, hasSavedDraft } = useCV();
  const searchParams = useSearchParams();
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [isDraftDismissed, setIsDraftDismissed] = useState(false);
  const lastLoadedIdRef = useRef<string | null>(null);

  // Prompt the user to continue if they are on a blank CV and we detect a saved draft in storage
  const showDraftPrompt = !isRealCVDraft(cvData) && hasSavedDraft && !isDraftDismissed;

  const handleContinueWorking = () => {
    // Actively restore the saved draft into the editor
    restoreDraft();
    setIsDraftDismissed(true);
    if (desktopView === "preview") {
      setDesktopView("dual");
    }
    setTimeout(() => {
      const el = document.getElementById("section-personal") || document.getElementById("section-role");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")?.focus();
      }
    }, 50);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    if (lastLoadedIdRef.current === id) return;

    let isMounted = true;
    setIsLoadingCv(true);

    cvApi
      .getById(id)
      .then((remoteCV) => {
        if (isMounted && remoteCV) {
          lastLoadedIdRef.current = id;
          let roleTitle = "";
          if (typeof remoteCV.targetRole === "string") {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(remoteCV.targetRole);
            if (!isUuid) roleTitle = remoteCV.targetRole;
          } else if (typeof remoteCV.targetRole === "object" && remoteCV.targetRole !== null) {
            roleTitle = (remoteCV.targetRole as any).title || "";
          }

          loadCV({
            id: remoteCV.id,
            title: remoteCV.title,
            templateId: remoteCV.templateId,
            targetRole: roleTitle,
            targetRoleId: remoteCV.targetRoleId || (typeof remoteCV.targetRole === "object" ? (remoteCV.targetRole as any)?.id : undefined),
            personalInfo: {
              fullName: remoteCV.fullName,
              email: remoteCV.email,
              phone: remoteCV.phone || "",
              location: remoteCV.location || "",
              portfolioUrl: remoteCV.websiteUrl || "",
              linkedinUrl: remoteCV.linkedinUrl || "",
              githubUrl: remoteCV.githubUrl || "",
              summary: remoteCV.summary || "",
            },
            sections: remoteCV.sections || [],
            skillGroups: remoteCV.skillGroups || [],
          });
        }
      })
      .catch((err) => {
        console.warn("Could not load CV from API ID, using local draft:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCv(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, loadCV]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-sky-100">
      {/* Header & Multi-stage Stepper (Clean solid white, unaffected by backdrop patterns) */}
      <Header currentStage={1} />
      <EditorStepper currentStage={1} />

      {/* Mobile Screen View Switcher (Only on screens < 1024px) */}
      <MobileViewToggle />

      {/* Main Content Area */}
      <div className="relative flex-1 w-full isolate">
        {/* Subtle Workspace Micro-Grid Backdrop (Locked to content, clearly visible, scrolls naturally) */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1.25px, transparent 1.25px)",
            backgroundSize: "24px 24px",
            opacity: 0.45,
          }}
          aria-hidden="true"
        />

        <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Draft Notice Banner */}
          {showDraftPrompt && (
            <div className="mb-4 flex items-center justify-between bg-amber-50/90 border border-amber-200/90 px-3.5 py-2 rounded-xl text-xs text-amber-950 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-800">
                  Draft detected.
                </span>
                <button
                  type="button"
                  onClick={handleContinueWorking}
                  className="font-semibold text-sky-600 hover:text-sky-800 hover:underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Continue working?
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsDraftDismissed(true)}
                className="text-amber-600 hover:text-amber-800 p-1 rounded-lg hover:bg-amber-100 transition-colors"
                aria-label="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Desktop View Switcher Toolbar (Visible on lg+) */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link
                href="/editor/templates"
                className="inline-flex items-center justify-center p-1 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors group"
                title="Back to Template Selection"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <span>Workspace:</span>
              <span className="text-slate-700 font-semibold">
                {desktopView === "dual" && "Dual (Split Editor & Preview)"}
                {desktopView === "editor" && "Editor Only (Focused)"}
                {desktopView === "preview" && "Preview Mode (Full Document)"}
              </span>
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200/80 p-1 rounded-xl text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setDesktopView("dual")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${desktopView === "dual"
                  ? "bg-white text-sky-700 shadow-subtle border border-slate-200/80 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Dual Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setDesktopView("editor")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${desktopView === "editor"
                  ? "bg-white text-sky-700 shadow-subtle border border-slate-200/80 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Editor only</span>
              </button>

              <button
                type="button"
                onClick={() => setDesktopView("preview")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${desktopView === "preview"
                  ? "bg-white text-sky-700 shadow-subtle border border-slate-200/80 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Mode</span>
              </button>
            </div>
          </div>

          <div
            className={`flex flex-col h-full items-start ${desktopView === "dual" ? "lg:flex-row gap-6" : ""
              }`}
          >
            {/* Form Inputs (Desktop 50% in Dual / Full Width in Editor Mode / Hidden in Preview Mode) */}
            <div
              className={`w-full ${mobileView === "form" ? "block" : "hidden"
                } ${desktopView === "preview" ? "lg:hidden" : "lg:block"
                } ${desktopView === "dual"
                  ? "lg:w-1/2"
                  : "lg:w-full lg:max-w-4xl lg:mx-auto"
                }`}
            >
              <CVForm />
            </div>

            {/* Live Resume Preview (Desktop 50% in Dual / Full Width in Preview Mode / Hidden in Editor Mode) */}
            <div
              className={`w-full ${mobileView === "preview" ? "block" : "hidden"
                } ${desktopView === "editor" ? "lg:hidden" : "lg:block"
                } ${desktopView === "dual"
                  ? "lg:w-1/2 lg:sticky lg:top-24 h-[calc(100vh-140px)]"
                  : "lg:w-full lg:max-w-4xl lg:mx-auto h-[calc(100vh-180px)]"
                }`}
            >
              <LivePreview />
            </div>
          </div>
        </main>
      </div>
      {/* Bottom Sticky Action Bar */}
      <ContinueActionBar />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
          <p className="text-xs font-semibold">Loading editor...</p>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
