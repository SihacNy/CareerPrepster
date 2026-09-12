"use client";

import React, { useState } from "react";
import { Cpu, Plus, Trash2, ChevronDown } from "lucide-react";
import { useCV } from "@/lib/store";
import { SkillCategory } from "@/types/cv";

export function SkillsSection({
  isOpen,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
} = {}) {
  const { cvData, setCVData } = useCV();
  const { skills } = cvData;
  const [internalOpen, setInternalOpen] = useState(true);

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      categoryName: "New Category",
      skills: [],
    };
    setCVData((prev) => ({
      ...prev,
      skills: [...prev.skills, newCat],
    }));
  };

  const handleUpdateCategoryName = (id: string, name: string) => {
    setCVData((prev) => ({
      ...prev,
      skills: prev.skills.map((c) =>
        c.id === id ? { ...c, categoryName: name } : c
      ),
    }));
  };

  const handleUpdateSkillsList = (id: string, skillsString: string) => {
    const parsed = skillsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setCVData((prev) => ({
      ...prev,
      skills: prev.skills.map((c) =>
        c.id === id ? { ...c, skills: parsed } : c
      ),
    }));
  };

  const handleRemoveCategory = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      skills: prev.skills.filter((c) => c.id !== id),
    }));
  };

  return (
    <div id="section-skills" className="bg-white p-5 rounded-xl border border-slate-200 mb-5 scroll-mt-24 transition-all">
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${
          isSectionOpen ? "pb-2 border-b border-slate-100 mb-4" : "mb-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isSectionOpen ? "" : "-rotate-90"
            }`}
          />
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>Categorized Technical Skills</span>
            <span className="text-xs text-slate-400 font-normal">
              ({skills.length})
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddCategory();
              if (!isSectionOpen) toggleSection();
            }}
            title="Add Category"
            aria-label="Add Category"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        <div className="space-y-4">
        {skills.map((cat) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-3 text-xs"
          >
            <div className="w-full sm:w-48 flex-shrink-0">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                value={cat.categoryName}
                onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                placeholder="e.g. Languages"
                className="w-full text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={cat.skills.join(", ")}
                onChange={(e) => handleUpdateSkillsList(cat.id, e.target.value)}
                placeholder="e.g. TypeScript, React, Docker, Python, SQL"
                className="w-full text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="sm:self-end">
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                title="Remove skill category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
