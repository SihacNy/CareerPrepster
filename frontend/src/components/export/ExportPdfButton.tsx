"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVData } from "@/types/cv";
import { pdf } from "@react-pdf/renderer";
import { ClassicPdfDocument } from "@/lib/pdf/ClassicPdfDocument";
import { ModernPdfDocument } from "@/lib/pdf/ModernPdfDocument";
import { ExecutiveAccentPdfDocument } from "@/lib/pdf/ExecutiveAccentPdfDocument";
import { ModernPhotoPdfDocument } from "@/lib/pdf/ModernPhotoPdfDocument";

interface ExportPdfButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

/**
 * Ensures any uploaded photo is converted into a standard, baseline JPEG Data URL
 * that @react-pdf/renderer natively understands without crashing.
 */
async function preparePdfCompatibleImage(url?: string | null): Promise<string | null> {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      if (/^https?:\/\//i.test(trimmed)) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const targetDim = 500;
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Center-crop to 1:1 square (object-fit: cover equivalent)
          const rawWidth = img.naturalWidth || img.width || targetDim;
          const rawHeight = img.naturalHeight || img.height || targetDim;
          const squareSize = Math.min(rawWidth, rawHeight);
          const sx = (rawWidth - squareSize) / 2;
          const sy = (rawHeight - squareSize) / 2;

          // Clip to a perfect circle on the canvas so corners are transparent
          ctx.beginPath();
          ctx.arc(targetDim / 2, targetDim / 2, targetDim / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Draw the center-cropped square into the circular clip
          ctx.drawImage(img, sx, sy, squareSize, squareSize, 0, 0, targetDim, targetDim);

          // Standard PNG with alpha channel preserves the circular shape perfectly in @react-pdf/renderer
          const pngUrl = canvas.toDataURL("image/png");
          resolve(pngUrl);
        } catch (canvasErr) {
          console.warn("Canvas image conversion failed for PDF, falling back to initials:", canvasErr);
          resolve(null);
        }
      };

      img.onerror = (imgErr) => {
        console.warn("Image load failed for PDF, falling back to initials:", imgErr);
        resolve(null);
      };

      img.src = trimmed;
    } catch {
      resolve(null);
    }
  });
}

function getDocumentElement(data: CVData): React.ReactElement {
  switch (data.templateId) {
    case "executive-accent":
      return <ExecutiveAccentPdfDocument data={data} />;
    case "modern-photo":
      return <ModernPhotoPdfDocument data={data} />;
    case "modern":
      return <ModernPdfDocument data={data} />;
    case "classic":
    default:
      return <ClassicPdfDocument data={data} />;
  }
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

      // 1. Sanitize photo URL into guaranteed-compatible JPEG data URL for @react-pdf/renderer
      let safePhotoUrl: string | null = null;
      if (cvData.personalInfo?.photoUrl) {
        safePhotoUrl = await preparePdfCompatibleImage(cvData.personalInfo.photoUrl);
      }

      // 2. Sanitize data tree so arrays and text fields never throw inside PDF renderer
      const sanitizedData: CVData = {
        ...cvData,
        personalInfo: {
          ...cvData.personalInfo,
          photoUrl: safePhotoUrl || "",
        },
        skillGroups: (cvData.skillGroups || []).map((sg) => ({
          ...sg,
          skills: Array.isArray(sg.skills)
            ? sg.skills.filter(Boolean).map(String)
            : typeof sg.skills === "string"
            ? (sg.skills as string).split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        })),
      };

      // 3. Render PDF blob with fallback protection
      let blob: Blob;
      try {
        blob = await pdf(getDocumentElement(sanitizedData)).toBlob();
      } catch (firstErr) {
        console.warn("PDF generation encountered issue, attempting fallback without photo...", firstErr);
        // Fallback without photo if image buffer failed
        const fallbackData: CVData = {
          ...sanitizedData,
          personalInfo: {
            ...sanitizedData.personalInfo,
            photoUrl: "",
          },
        };
        blob = await pdf(getDocumentElement(fallbackData)).toBlob();
      }

      // 4. Trigger browser file download
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

      if (typeof window !== "undefined") {
        sessionStorage.setItem("careerprepster_pdf_downloaded", "true");
        window.dispatchEvent(new CustomEvent("careerprepster:pdf-downloaded"));
      }
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
