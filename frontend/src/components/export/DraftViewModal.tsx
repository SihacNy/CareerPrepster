"use client";

import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Printer } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVTemplateRenderer } from "@/components/preview/CVTemplateRenderer";
import { getTemplateById } from "@/types/templates";
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
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
            {cvData.personalInfo.fullName || "CV Draft Preview"}
          </h2>
          <p className="text-[10px] text-slate-500">
            {getTemplateById(cvData.templateId).name} • {getTemplateById(cvData.templateId).subtitle}
          </p>
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
          <CVTemplateRenderer data={cvData} />
        </div>
      </div>
    </div>
  );
}
