"use client";

import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Printer, Maximize2, FileText } from "lucide-react";
import { useCV } from "@/lib/store";
import { ClassicAts } from "@/components/preview/templates/ClassicAts";
import { ModernCompact } from "@/components/preview/templates/ModernCompact";
import { ExportPdfButton } from "./ExportPdfButton";

interface DraftViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DraftViewModal({ isOpen, onClose }: DraftViewModalProps) {
  const { cvData } = useCV();
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleZoomReset = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Top Modal Header */}
      <div className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-subtle flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
              {cvData.personalInfo.fullName || "CV Draft Preview"}
            </h2>
            <p className="text-[10px] text-slate-500">
              {cvData.templateId === "classic" ? "Harvard Classic ATS Template" : "Jake's Tech High-Density Template"}
            </p>
          </div>
        </div>

        {/* Center / Right Toolbar Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:text-slate-900"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Download button */}
          <ExportPdfButton variant="primary" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Scroll Viewport */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start"
        onClick={(e) => {
          // Close if clicking outside the paper sheet
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="w-full max-w-3xl bg-white shadow-2xl rounded-sm border border-slate-300 my-4"
        >
          {cvData.templateId === "classic" ? (
            <ClassicAts data={cvData} />
          ) : (
            <ModernCompact data={cvData} />
          )}
        </div>
      </div>
    </div>
  );
}
