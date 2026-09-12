"use client";

import React, { useState } from "react";
import { PenLine, Trash2, Undo2 } from "lucide-react";

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
  const [prevValue, setPrevValue] = useState<string | null>(null);

  const handleChange = (newVal: string) => {
    setPrevValue(value);
    onChange(newVal);
  };

  const handleUndo = () => {
    if (prevValue !== null) {
      onChange(prevValue);
      setPrevValue(null);
    }
  };

  return (
    <div className="group flex items-start space-x-2 w-full">
      {/* Bullet dot indicator */}
      <span className="mt-2 text-slate-400 font-bold select-none text-base">•</span>

      {/* Bullet Text Input */}
      <div className="flex-1 relative">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm text-slate-800 bg-white border border-slate-200 rounded-lg p-3 pr-36 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all resize-y leading-relaxed"
        />

        {/* Action Toolbar Inside Input Right */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center space-x-1.5">
          {prevValue !== null && (
            <button
              type="button"
              onClick={handleUndo}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Undo bullet change"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Refine with AI Button */}
          <button
            type="button"
            onClick={onRefineWithAI}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-sky-700 bg-white hover:bg-sky-600 hover:text-white border border-sky-200 hover:border-sky-600 transition-colors"
            title="Refine wording with STAR/XYZ frameworks"
          >
            <PenLine className="w-3.5 h-3.5 mr-1" />
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
