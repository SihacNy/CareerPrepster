"use client";

import React from "react";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { CVForm } from "@/components/editor/CVForm";
import { LivePreview } from "@/components/preview/LivePreview";
import { MobileViewToggle } from "@/components/editor/MobileViewToggle";
import { ContinueActionBar } from "@/components/editor/ContinueActionBar";
import { useCV } from "@/lib/store";
import { Columns2, PenLine, Eye } from "lucide-react";

export default function EditorPage() {
  const { mobileView, desktopView, setDesktopView } = useCV();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header & Multi-stage Stepper */}
      <Header currentStage={1} />
      <EditorStepper currentStage={1} />

      {/* Mobile Screen View Switcher (Only on screens < 1024px) */}
      <MobileViewToggle />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop View Switcher Toolbar (Visible on lg+) */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Workspace:</span>
            <span className="text-slate-700 font-semibold">
              {desktopView === "dual" && "Dual (Split Editor & Preview)"}
              {desktopView === "editor" && "Editor Only (Focused)"}
              {desktopView === "preview" && "Preview Mode (Full Document)"}
            </span>
          </div>

          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setDesktopView("dual")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                desktopView === "dual"
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                desktopView === "editor"
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                desktopView === "preview"
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
          className={`flex flex-col h-full items-start ${
            desktopView === "dual" ? "lg:flex-row gap-6" : ""
          }`}
        >
          {/* Form Inputs (Desktop 50% in Dual / Full Width in Editor Mode / Hidden in Preview Mode) */}
          <div
            className={`w-full ${
              mobileView === "form" ? "block" : "hidden"
            } ${
              desktopView === "preview" ? "lg:hidden" : "lg:block"
            } ${
              desktopView === "dual"
                ? "lg:w-1/2"
                : "lg:w-full lg:max-w-4xl lg:mx-auto"
            }`}
          >
            <CVForm />
          </div>

          {/* Live Resume Preview (Desktop 50% in Dual / Full Width in Preview Mode / Hidden in Editor Mode) */}
          <div
            className={`w-full ${
              mobileView === "preview" ? "block" : "hidden"
            } ${
              desktopView === "editor" ? "lg:hidden" : "lg:block"
            } ${
              desktopView === "dual"
                ? "lg:w-1/2 lg:sticky lg:top-24 h-[calc(100vh-140px)]"
                : "lg:w-full lg:max-w-4xl lg:mx-auto h-[calc(100vh-180px)]"
            }`}
          >
            <LivePreview />
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <ContinueActionBar />
    </div>
  );
}
