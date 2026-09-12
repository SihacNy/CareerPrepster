"use client";

import React from "react";
import { Cpu, Plus, Trash2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { SkillCategory } from "@/types/cv";

export function SkillsSection() {
  const { cvData, setCVData } = useCV();
  const { skills } = cvData;

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
    <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-sky-600" />
          Categorized Technical Skills
        </h3>
        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {skills.map((cat) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-3 text-xs"
          >
            <div className="w-full sm:w-48 flex-shrink-0">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={cat.categoryName}
                onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                placeholder="e.g. Languages"
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={cat.skills.join(", ")}
                onChange={(e) => handleUpdateSkillsList(cat.id, e.target.value)}
                placeholder="e.g. TypeScript, React, Docker, Python, SQL"
                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-sky-500"
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
    </div>
  );
}
