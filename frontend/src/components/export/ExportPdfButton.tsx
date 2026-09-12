"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { pdf } from "@react-pdf/renderer";
import { ClassicPdfDocument } from "@/lib/pdf/ClassicPdfDocument";
import { ModernPdfDocument } from "@/lib/pdf/ModernPdfDocument";

interface ExportPdfButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

export function ExportPdfButton({
  variant = "primary",
  className = "",
}: ExportPdfButtonProps) {
  const { cvData } = useCV();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);

      const DocumentComponent =
        cvData.templateId === "classic" ? (
          <ClassicPdfDocument data={cvData} />
        ) : (
          <ModernPdfDocument data={cvData} />
        );

      const blob = await pdf(DocumentComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanName = (cvData.personalInfo.fullName || "Resume")
        .replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `${cleanName}_ATS_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate PDF. Please verify resume fields and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all shadow-sm ${
        isPrimary
          ? "bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 sm:px-4.5 sm:py-2 text-xs sm:text-sm"
          : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-3.5 py-1.5 text-xs"
      } ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          <span>Download ATS PDF</span>
        </>
      )}
    </button>
  );
}
