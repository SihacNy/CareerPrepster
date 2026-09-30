"use client";

import React, { useMemo, useState } from "react";
import { Cpu, Plus, Trash2, ChevronDown, X } from "lucide-react";
import { useCV } from "@/lib/store";
import { SkillGroup } from "@/types/cv";
import { buildValidationMap } from "@/lib/cvValidation";
import { FieldError, fieldErrorInputClass } from "@/components/editor/FieldError";

interface SkillCategoryRowProps {
  cat: SkillGroup;
  idx: number;
  onUpdateCategoryName: (id: string, name: string) => void;
  onUpdateSkills: (id: string, skills: string[]) => void;
  onRemoveCategory: (id: string) => void;
  categoryNameError?: string;
}

function SkillCategoryRow({
  cat,
  idx,
  onUpdateCategoryName,
  onUpdateSkills,
  onRemoveCategory,
  categoryNameError,
}: SkillCategoryRowProps) {
  const [inputValue, setInputValue] = useState("");

  const addSkillsFromText = (text: string) => {
    const tokens = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    const currentSkills = [...(cat.skills || [])];
    for (const token of tokens) {
      if (!currentSkills.includes(token)) {
        currentSkills.push(token);
      }
    }
    onUpdateSkills(cat.id, currentSkills);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkillsFromText(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && inputValue === "" && (cat.skills || []).length > 0) {
      // Remove last skill if input is empty
      const nextSkills = cat.skills.slice(0, -1);
      onUpdateSkills(cat.id, nextSkills);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      addSkillsFromText(val);
      setInputValue("");
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addSkillsFromText(inputValue);
      setInputValue("");
    }
  };

  const handleRemoveSkill = (skillIndex: number) => {
    const nextSkills = (cat.skills || []).filter((_, i) => i !== skillIndex);
    onUpdateSkills(cat.id, nextSkills);
  };

  return (
    <div className="p-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start gap-3.5 text-sm">
      <div className="w-full sm:w-48 flex-shrink-0 pt-0.5">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Category Name
          <FieldError message={categoryNameError} inline />
        </label>
        <input
          type="text"
          value={cat.categoryName}
          onChange={(e) => onUpdateCategoryName(cat.id, e.target.value)}
          data-validate={`skillGroups.${idx}.categoryName`}
          placeholder="e.g. Languages"
          className={`w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors ${
            categoryNameError ? fieldErrorInputClass : ""
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Skills
        </label>
        <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] p-1.5 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 shadow-2xs transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={
              (cat.skills || []).length === 0
                ? "e.g. TypeScript, React, Docker, Python, SQL"
                : "Add skill..."
            }
            className={`${
              (cat.skills || []).length === 0
                ? "flex-1 min-w-[200px]"
                : "shrink-0 min-w-[100px] w-28 focus:w-52 transition-all"
            } text-sm text-slate-800 bg-transparent px-2 py-1 outline-none placeholder:text-slate-400`}
          />
          {(cat.skills || []).map((skill, sIdx) => (
            <span
              key={`${cat.id}-${skill}-${sIdx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-medium border border-sky-100 hover:bg-sky-100 transition-colors group"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(sIdx)}
                className="text-sky-400 hover:text-rose-600 rounded p-0.5 transition-colors focus:outline-none"
                title={`Remove ${skill}`}
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="sm:self-center pt-5 sm:pt-6 flex-shrink-0">
        <button
          type="button"
          onClick={() => onRemoveCategory(cat.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
          title="Remove skill category"
          aria-label="Remove skill category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function SkillsSection({
  isOpen,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
} = {}) {
  const { cvData, updateSkillGroups, persistence } = useCV();
  const skillGroups = Array.isArray(cvData.skillGroups)
    ? cvData.skillGroups
    : (Array.isArray(cvData.skills) ? cvData.skills : []);
  const [internalOpen, setInternalOpen] = useState(true);

  const validationMap = useMemo(
    () => buildValidationMap(persistence.validationErrors ?? []),
    [persistence.validationErrors]
  );

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  const handleAddCategory = () => {
    const newCat: SkillGroup = {
      id: `skill-${Date.now()}`,
      categoryName: "New Category",
      skills: [],
      orderIndex: skillGroups.length,
    };
    updateSkillGroups([...skillGroups, newCat]);
  };

  const handleUpdateCategoryName = (id: string, name: string) => {
    updateSkillGroups(
      skillGroups.map((c) => (c.id === id ? { ...c, categoryName: name } : c))
    );
  };

  const handleUpdateSkillsList = (id: string, newSkills: string[]) => {
    updateSkillGroups(
      skillGroups.map((c) => (c.id === id ? { ...c, skills: newSkills } : c))
    );
  };

  const handleRemoveCategory = (id: string) => {
    updateSkillGroups(skillGroups.filter((c) => c.id !== id));
  };

  return (
    <div id="section-skills" className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 scroll-mt-24 transition-all">
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${
          isSectionOpen ? "pb-2.5 border-b border-slate-100 mb-4" : "mb-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isSectionOpen ? "" : "-rotate-90"
            }`}
          />
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>Categorized Technical Skills</span>
            <span className="text-xs text-slate-400 font-normal">
              ({skillGroups.length})
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
            className="w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        skillGroups.length === 0 ? (
          <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              No skill categories added yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {skillGroups.map((cat, idx) => {
              const categoryNameError = validationMap[`skillGroups.${idx}.categoryName`];
              return (
                <SkillCategoryRow
                  key={cat.id}
                  cat={cat}
                  idx={idx}
                  onUpdateCategoryName={handleUpdateCategoryName}
                  onUpdateSkills={handleUpdateSkillsList}
                  onRemoveCategory={handleRemoveCategory}
                  categoryNameError={categoryNameError}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
