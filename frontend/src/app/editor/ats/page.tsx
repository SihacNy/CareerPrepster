"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { EditorStepper } from "@/components/navigation/EditorStepper";
import { ATSScoringStage } from "@/components/ats/ATSScoringStage";
import { Loader2 } from "lucide-react";

function ATSPageContent() {
  const searchParams = useSearchParams();
  const isFromUpload = searchParams.get("from") === "upload";

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ATSScoringStage isFromUpload={isFromUpload} />
    </main>
  );
}

export default function ATSReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header currentStage={2} />
      <EditorStepper currentStage={2} />

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          </div>
        }
      >
        <ATSPageContent />
      </Suspense>
    </div>
  );
}
