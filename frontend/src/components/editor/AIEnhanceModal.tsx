"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2, ArrowRight } from "lucide-react";
import { generateMockBulletEnhancements, AISuggestion } from "@/lib/mockAI";

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
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && originalText) {
      setIsLoading(true);
      generateMockBulletEnhancements(originalText, targetRole)
        .then((results) => {
          setSuggestions(results);
          if (results.length > 0) {
            setSelectedId(results[0].id);
          }
        })
        .finally(() => setIsLoading(false));
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
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Your Draft Bullet
            </span>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;{originalText || "No text entered"}&rdquo;
            </p>
          </div>

          {/* AI Suggestions List */}
          <div>
            <span className="text-xs font-semibold text-slate-900 block mb-2">
              Select an Enhancement Framework:
            </span>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">
                  Analyzing bullet with Google XYZ and STAR frameworks...
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {suggestions.map((suggestion) => {
                  const isSelected = selectedId === suggestion.id;
                  return (
                    <div
                      key={suggestion.id}
                      onClick={() => setSelectedId(suggestion.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/30"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                          {suggestion.type}
                        </span>
                        {isSelected && (
                          <span className="flex items-center text-[11px] font-semibold text-sky-600">
                            <Check className="w-3.5 h-3.5 mr-0.5 text-sky-600 stroke-[2.5]" />
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-900 font-medium leading-relaxed">
                        {suggestion.text}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
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
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedId || isLoading}
            onClick={handleApply}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors shadow-subtle"
          >
            <span>Apply to CV</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
