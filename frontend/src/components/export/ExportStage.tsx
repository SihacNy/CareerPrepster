"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PenLine, Pencil, Check, Maximize2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVTemplateRenderer } from "@/components/preview/CVTemplateRenderer";
import { ExportPdfButton } from "./ExportPdfButton";
import { DraftViewModal } from "./DraftViewModal";

export function ExportStage() {
  const { cvData } = useCV();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingFileName, setIsEditingFileName] = useState(false);

  const defaultBaseName = (cvData.personalInfo?.fullName || "Resume")
    .trim()
    .replace(/[^a-zA-Z0-9_\s-]/g, "")
    .replace(/\s+/g, "_") + "_ATS_Resume";

  const [fileName, setFileName] = useState<string>(() => `${defaultBaseName}.pdf`);
  const [tempBaseName, setTempBaseName] = useState<string>(defaultBaseName);

  // Sync default file name if candidate name changes and user hasn't typed a custom file name
  useEffect(() => {
    if (!fileName || fileName.startsWith("Resume_ATS_Resume.pdf")) {
      const updated = `${defaultBaseName}.pdf`;
      setFileName(updated);
      setTempBaseName(defaultBaseName);
    }
  }, [cvData.personalInfo?.fullName, defaultBaseName]);

  const handleSaveFileName = () => {
    const clean = tempBaseName.trim().replace(/[^a-zA-Z0-9_\s-]/g, "").replace(/\s+/g, "_");
    const finalName = clean ? `${clean}.pdf` : `${defaultBaseName}.pdf`;
    setFileName(finalName);
    setIsEditingFileName(false);
  };

  return (
    <div className="w-full pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-medium text-slate-500 mb-1">
            <Link href="/editor/ats" className="group hover:text-sky-600 flex items-center transition-colors">
              <ArrowLeft className="w-3 h-3 mr-1 text-slate-400 group-hover:text-sky-600 transition-colors" />
              <span>Back to ATS Review</span>
            </Link>
            <span className="text-slate-300 select-none">/</span>
            <Link href="/editor" className="group hover:text-sky-600 flex items-center transition-colors">
              <PenLine className="w-3 h-3 mr-1 text-slate-400 group-hover:text-sky-600 transition-colors" />
              <span>Edit CV Form</span>
            </Link>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Final Review &amp; Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Review your final formatted draft deliverable and download your ATS-ready vector PDF.
          </p>
        </div>

        {/* Right Controls: Download Button */}
        <div className="flex items-center sm:self-center flex-shrink-0">
          <ExportPdfButton variant="primary" fileName={fileName} />
        </div>
      </div>

      {/* Draft Preview Container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[794px]">
          {/* Top Preview Bar with Editable File Name on Top Left */}
          <div className="flex items-center justify-between pb-2 px-1">
            <div className="flex items-center gap-2">
              {isEditingFileName ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-white border border-sky-500 rounded px-2 py-0.5 ring-1 ring-sky-500 shadow-xs">
                    <input
                      type="text"
                      value={tempBaseName}
                      onChange={(e) => setTempBaseName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveFileName();
                        } else if (e.key === "Escape") {
                          setTempBaseName(fileName.replace(/\.pdf$/i, ""));
                          setIsEditingFileName(false);
                        }
                      }}
                      onBlur={handleSaveFileName}
                      placeholder="File name"
                      className="text-xs sm:text-sm font-semibold text-slate-900 outline-none max-w-[160px] sm:max-w-[240px] bg-transparent"
                      autoFocus
                    />
                    <span className="text-xs text-slate-400 select-none">.pdf</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveFileName}
                    className="p-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded transition-colors"
                    title="Save file name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempBaseName(fileName.replace(/\.pdf$/i, ""));
                    setIsEditingFileName(true);
                  }}
                  className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                  title="Click to rename export file"
                >
                  <span>{fileName}</span>
                  <Pencil className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors opacity-70 group-hover:opacity-100" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-100 flex items-center justify-center transition-colors group cursor-pointer"
              title="Interactive Preview"
              aria-label="Interactive Preview"
            >
              <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
            </button>
          </div>

          {/* Document Sheet - Click to view full preview */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg shadow-card hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            title="Click to view full draft"
          >
            <div className="p-1 sm:p-2 pointer-events-none select-none">
              <CVTemplateRenderer data={cvData} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive Modal */}
      <DraftViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fileName={fileName}
        onFileNameChange={setFileName}
      />
    </div>
  );
}
