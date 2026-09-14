"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2, ArrowRight, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { aiApi } from "@/lib/api";

export interface AISuggestionItem {
  id: string;
  type: "Action-Oriented" | "Quantified Metrics (XYZ)" | "STAR Framework";
  text: string;
  explanation: string;
}

interface AIEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  targetRole: string;
  onApply: (refinedText: string) => void;
}

export function AIEnhanceModal({
  isOpen,
  onClose,
  originalText,
  targetRole,
  onApply,
}: AIEnhanceModalProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEnhancements = async () => {
    if (!originalText) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await aiApi.enhanceBullet({
        rawBullet: originalText,
        sectionContext: { roleTitle: targetRole },
        framework: "AUTO",
      });

      if (res?.suggestions && res.suggestions.length > 0) {
        const mapped: AISuggestionItem[] = res.suggestions.map((s) => ({
          id: s.id || Math.random().toString(),
          type: s.framework === "STAR" ? "STAR Framework" : "Quantified Metrics (XYZ)",
          text: s.enhancedText,
          explanation: s.explanation || "Optimized with high-impact power verb and quantifiable metric.",
        }));
        setSuggestions(mapped);
        setSelectedId(mapped[0].id);
      } else {
        setErrorMessage("AI generation returned no suggestions. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to connect to AI assistant. Please verify backend service and GEMINI_API_KEY."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && originalText) {
      fetchEnhancements();
    }
  }, [isOpen, originalText, targetRole]);

  if (!isOpen) return null;

  const handleApply = () => {
    const selected = suggestions.find((s) => s.id === selectedId);
    if (selected) {
      onApply(selected.text);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Refine with AI (STAR &amp; XYZ Wording)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn plain descriptions into employer-aligned quantifiable achievements.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Original Text Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Your Draft Bullet
            </span>
            <p className="text-sm text-slate-700 italic leading-relaxed">
              &ldquo;{originalText || "No text entered"}&rdquo;
            </p>
          </div>

          {/* AI Suggestions List */}
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 block mb-2">
              Select an Enhancement Framework:
            </span>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Analyzing bullet with Google Gemini Flash (STAR &amp; XYZ)...
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col items-start gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>AI Generation Notice</span>
                </div>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={fetchEnhancements}
                  className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const isSelected = selectedId === suggestion.id;
                  return (
                    <div
                      key={suggestion.id}
                      onClick={() => setSelectedId(suggestion.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/40 ring-1 ring-sky-500"
                          : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                          {suggestion.type}
                        </span>
                        {isSelected && (
                          <span className="flex items-center text-xs font-semibold text-sky-600">
                            <Check className="w-4 h-4 mr-1 text-sky-600 stroke-[2.5]" />
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-900 font-medium leading-relaxed">
                        {suggestion.text}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {suggestion.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedId || isLoading}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors"
          >
            Apply to CV
          </button>
        </div>
      </div>
    </div>
  );
}
