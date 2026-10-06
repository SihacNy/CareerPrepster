"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ZoomOut, Printer, Pencil, Check } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVTemplateRenderer } from "@/components/preview/CVTemplateRenderer";
import { getTemplateById } from "@/types/templates";
import { ExportPdfButton } from "./ExportPdfButton";

interface DraftViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

export function DraftViewModal({
  isOpen,
  onClose,
  fileName: externalFileName,
  onFileNameChange,
}: DraftViewModalProps) {
  const { cvData } = useCV();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isEditingFileName, setIsEditingFileName] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const defaultBaseName = (cvData.personalInfo?.fullName || "Resume")
    .trim()
    .replace(/[^a-zA-Z0-9_\s-]/g, "")
    .replace(/\s+/g, "_") + "_ATS_Resume";

  const resolvedFileName = externalFileName || `${defaultBaseName}.pdf`;
  const [tempBaseName, setTempBaseName] = useState<string>(() =>
    resolvedFileName.replace(/\.pdf$/i, "")
  );

  useEffect(() => {
    if (!isEditingFileName) {
      setTempBaseName(resolvedFileName.replace(/\.pdf$/i, ""));
    }
  }, [resolvedFileName, isEditingFileName]);

  const handleSaveFileName = () => {
    const clean = tempBaseName.trim().replace(/[^a-zA-Z0-9_\s-]/g, "").replace(/\s+/g, "_");
    const finalName = clean ? `${clean}.pdf` : `${defaultBaseName}.pdf`;
    onFileNameChange?.(finalName);
    setIsEditingFileName(false);
  };

  const resumeRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(1123);

  // Close on Escape key (unless editing file name)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditingFileName) {
          setIsEditingFileName(false);
          return;
        }
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
  }, [isOpen, onClose, isEditingFileName]);

  useEffect(() => {
    if (resumeRef.current) {
      setContentHeight(Math.max(1123, resumeRef.current.offsetHeight));
    }
  }, [cvData, isOpen]);

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
          {isEditingFileName ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <div className="flex items-center bg-white border border-sky-500 rounded px-2 py-0.5 ring-1 ring-sky-500 shadow-xs">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={tempBaseName}
                  onChange={(e) => setTempBaseName(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      handleSaveFileName();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setTempBaseName(resolvedFileName.replace(/\.pdf$/i, ""));
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
                setTempBaseName(resolvedFileName.replace(/\.pdf$/i, ""));
                setIsEditingFileName(true);
              }}
              className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-semibold text-slate-900 hover:text-sky-600 transition-colors py-0.5 cursor-pointer"
              title="Click to rename export file"
            >
              <span>{resolvedFileName}</span>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors opacity-70 group-hover:opacity-100" />
            </button>
          )}
          <p className="text-[10px] text-slate-500">
            {cvData.personalInfo?.fullName ? `${cvData.personalInfo.fullName} • ` : ""}
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
          <ExportPdfButton variant="primary" fileName={resolvedFileName} />

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
        className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center items-start"
        onClick={(e) => {
          // Close if clicking outside the paper sheet
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          style={{
            width: `${794 * (zoomLevel / 100)}px`,
            height: `${contentHeight * (zoomLevel / 100)}px`,
            position: "relative",
            flexShrink: 0,
            transition: "width 0.15s ease-out, height 0.15s ease-out",
          }}
          className="my-4"
        >
          <div
            ref={resumeRef}
            style={{
              width: "794px",
              minWidth: "794px",
              maxWidth: "794px",
              minHeight: "1123px",
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
            className="bg-white shadow-2xl rounded-sm border border-slate-300"
          >
            <CVTemplateRenderer data={cvData} />
          </div>
        </div>
      </div>
    </div>
  );
}
