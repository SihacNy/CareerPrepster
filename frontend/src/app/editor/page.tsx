"use client";

import React from "react";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { CVForm } from "@/components/editor/CVForm";
import { LivePreview } from "@/components/preview/LivePreview";
import { MobileViewToggle } from "@/components/editor/MobileViewToggle";
import { ContinueActionBar } from "@/components/editor/ContinueActionBar";
import { useCV } from "@/lib/store";

export default function EditorPage() {
  const { mobileView } = useCV();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header & Multi-stage Stepper */}
      <Header currentStage={1} />
      <EditorStepper currentStage={1} />

      {/* Mobile Screen View Switcher */}
      <MobileViewToggle />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
          {/* Left Column: Form Inputs (Desktop 55% / Mobile conditional) */}
          <div
            className={`w-full lg:w-[55%] ${
              mobileView === "form" ? "block" : "hidden lg:block"
            }`}
          >
            <CVForm />
          </div>

          {/* Right Column: Live Resume Preview (Desktop 45% sticky / Mobile conditional) */}
          <div
            className={`w-full lg:w-[45%] lg:sticky lg:top-24 h-[calc(100vh-140px)] ${
              mobileView === "preview" ? "block" : "hidden lg:block"
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
