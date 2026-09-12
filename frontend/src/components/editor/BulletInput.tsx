"use client";

import React from "react";
import { PenLine, Trash2 } from "lucide-react";

interface BulletInputProps {
  value: string;
  onChange: (newValue: string) => void;
  onRemove: () => void;
  onRefineWithAI: () => void;
  placeholder?: string;
}

export function BulletInput({
  value,
  onChange,
  onRemove,
  onRefineWithAI,
  placeholder = "Describe an achievement with action verbs and quantifiable results...",
}: BulletInputProps) {
  return (
    <div className="group flex items-start space-x-2 w-full">
      {/* Bullet dot indicator */}
      <span className="mt-2.5 text-slate-400 font-bold select-none text-xs">•</span>

      {/* Bullet Text Input */}
      <div className="flex-1 relative">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 pr-28 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all resize-y leading-relaxed"
        />

        {/* Action Toolbar Inside Input Right */}
        <div className="absolute right-2 bottom-2.5 flex items-center space-x-1.5">
          {/* Refine with AI Button */}
          <button
            type="button"
            onClick={onRefineWithAI}
            className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
            title="Refine wording with STAR/XYZ frameworks"
          >
            <PenLine className="w-3 h-3 mr-1 text-sky-600" />
            <span>Refine with AI</span>
          </button>

          {/* Remove Bullet */}
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Remove bullet point"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
