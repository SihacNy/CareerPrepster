"use client";

import React from "react";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { ExportStage } from "@/components/export/ExportStage";

export default function ExportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header currentStage={3} />
      <EditorStepper currentStage={3} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ExportStage />
      </main>
    </div>
  );
}
