"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, UploadCloud, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { useCV } from "@/lib/store";
import { INITIAL_EMPTY_CV } from "@/lib/mockData";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const { setCVData } = useCV();
  const [selectedPath, setSelectedPath] = useState<"choice" | "upload">("choice");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleCreateFromScratch = () => {
    // Reset to clean template and navigate to editor
    setCVData({
      ...INITIAL_EMPTY_CV,
      id: `cv-${Date.now()}`,
      title: "New Student Resume",
      updatedAt: new Date().toISOString(),
    });
    onClose();
    router.push("/editor");
  };

  const handleFileSelected = (file: File) => {
    setIsUploading(true);
    // Simulate parsing & baseline audit generation (1.2s)
    setTimeout(() => {
      setCVData({
        ...INITIAL_EMPTY_CV,
        id: `cv-imported-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        personalInfo: {
          fullName: "Samnang Sok",
          email: "samnang.sok@camtech.edu.kh",
          phone: "+855 12 345 678",
          location: "Phnom Penh, Cambodia",
          linkedinUrl: "linkedin.com/in/samnang-sok",
          githubUrl: "github.com/samnang-dev",
          summary: "Passionate Computer Science student at CamTech focusing on Software Engineering and Cloud Computing.",
        },
        updatedAt: new Date().toISOString(),
      });

      setIsUploading(false);
      onClose();
      // Flow B: Take them to ATS Diagnostic first!
      router.push("/editor/ats?from=upload");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {selectedPath === "choice" ? (
          <div>
            <div className="text-center mb-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 mb-2">
                Get Started
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                How would you like to build your CV?
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Choose to start from scratch with ATS-friendly templates, or scan your existing resume for instant score feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Scratch */}
              <div
                onClick={handleCreateFromScratch}
                className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-sky-500 hover:bg-sky-50/30 cursor-pointer transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Create from Scratch
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Start with a clean Harvard or Jake&apos;s tech template. Pick from pre-curated bullet points.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Editing</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              {/* Option 2: Upload */}
              <div
                onClick={() => setSelectedPath("upload")}
                className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-sky-500 hover:bg-sky-50/30 cursor-pointer transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Upload Existing CV
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Upload your PDF or DOCX. Get an instant ATS diagnostic score before importing into our editor.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Scan & Improve</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setSelectedPath("choice")}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center mb-2"
              >
                ← Back to options
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                Upload Your Existing Resume
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                We will analyze your document across 4 ATS pillars and load your data into clean templates.
              </p>
            </div>

            <UploadDropzone
              onFileSelected={handleFileSelected}
              isLoading={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
