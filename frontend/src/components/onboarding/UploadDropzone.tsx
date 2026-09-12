"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, Loader2 } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export function UploadDropzone({ onFileSelected, isLoading = false }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = (file: File) => {
    setErrorMessage(null);

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const isPdfOrDoc =
      validTypes.includes(file.type) ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc");

    if (!isPdfOrDoc) {
      setErrorMessage("Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5MB size limit. Please upload a smaller file.");
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 ${
          isDragOver
            ? "border-sky-500 bg-sky-50/60"
            : "border-slate-300 bg-slate-50 hover:bg-white hover:border-sky-400"
        } ${isLoading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndHandleFile(e.target.files[0]);
            }
          }}
        />

        {isLoading ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Parsing Resume & Running ATS Audit...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Extracting education, projects, and computing 4-pillar scores
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-sky-600 flex items-center justify-center shadow-subtle">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-800">
                <span className="text-sky-600 font-semibold underline underline-offset-2">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: PDF or DOCX (Max 5MB)
              </p>
            </div>

            <div className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium bg-white text-slate-600 border border-slate-200">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Digital PDF with selectable text recommended
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
