"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { useCV } from "@/lib/store";
import { ClassicAts } from "@/components/preview/templates/ClassicAts";
import { ModernCompact } from "@/components/preview/templates/ModernCompact";
import { ExportPdfButton } from "./ExportPdfButton";
import { DraftViewModal } from "./DraftViewModal";

export function ExportStage() {
  const { cvData } = useCV();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/editor/ats" className="hover:text-sky-600 flex items-center transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to ATS Review
            </Link>
            <span>•</span>
            <Link href="/editor" className="hover:text-sky-600 flex items-center transition-colors">
              <PenLine className="w-3 h-3 mr-1" />
              Edit CV Form
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Final Review &amp; Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your final formatted draft deliverable and download your ATS-ready vector PDF.
          </p>
        </div>

        {/* Right Controls: Download Button */}
        <div className="flex items-center">
          <ExportPdfButton variant="primary" />
        </div>
      </div>

      {/* Draft Preview Container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Document Sheet - Click to view full preview */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg shadow-card hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            title="Click to view full draft"
          >
            <div className="p-1 sm:p-2 pointer-events-none select-none">
              {cvData.templateId === "classic" ? (
                <ClassicAts data={cvData} />
              ) : (
                <ModernCompact data={cvData} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive Modal */}
      <DraftViewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
