"use client";

import React, { useState, useRef, useEffect } from "react";
import { RoleAutocomplete } from "./RoleAutocomplete";
import { PersonalSection } from "./sections/PersonalSection";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { CustomSection } from "./sections/CustomSection";
import { AIEnhanceModal } from "./AIEnhanceModal";
import { useCV } from "@/lib/store";
import { CVSection } from "@/types/cv";
import {
  Compass,
  ChevronsUpDown,
  ChevronDown,
  Tag,
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Code2,
  Trash2,
  Plus,
  Layers,
} from "lucide-react";

const JUMP_SECTIONS = [
  { id: "section-role", label: "Target Job Title", icon: Tag },
  { id: "section-personal", label: "Personal Information", icon: User },
  { id: "section-education", label: "Education", icon: GraduationCap },
  { id: "section-experience", label: "Work Experience", icon: Briefcase },
  { id: "section-projects", label: "Academic Projects", icon: FolderGit2 },
  { id: "section-skills", label: "Technical Skills", icon: Code2 },
];

function JumpSectionDropdown({
  onSelect,
  customSections = [],
}: {
  onSelect: (id: string) => void;
  customSections?: CVSection[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
        aria-expanded={isOpen}
      >
        <Compass className="w-3.5 h-3.5 text-sky-600" />
        <span>Jump to section...</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-sky-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100 max-h-80 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            CV Sections
          </div>
          {JUMP_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  onSelect(section.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left group"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                <span>{section.label}</span>
              </button>
            );
          })}

          {customSections.length > 0 && (
            <>
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-t border-slate-100 mt-1">
                Custom Sections
              </div>
              {customSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    onSelect(`section-${sec.id}`);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left group"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  <span className="truncate">{sec.title || "Custom Section"}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CVForm() {
  const { cvData, clearAll, addCustomSection, persistence } = useCV();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const customSections = (cvData.sections || []).filter((s) => s.sectionType === "CUSTOM");

  // State for AI Refine modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeRefineText, setActiveRefineText] = useState("");
  const [activeApplyCallback, setActiveApplyCallback] = useState<((newText: string) => void) | null>(null);

  // Accordion state for standard sections
  const [openSections, setOpenSections] = useState({
    role: true,
    personal: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
  });

  // Accordion state for custom sections
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCustomSection = (id: string) => {
    setCustomOpen((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const expandAll = () => {
    setOpenSections({
      role: true,
      personal: true,
      education: true,
      experience: true,
      projects: true,
      skills: true,
    });
    const allCustom: Record<string, boolean> = {};
    customSections.forEach((s) => {
      allCustom[s.id] = true;
    });
    setCustomOpen(allCustom);
  };

  const collapseAll = () => {
    setOpenSections({
      role: false,
      personal: false,
      education: false,
      experience: false,
      projects: false,
      skills: false,
    });
    const allCustom: Record<string, boolean> = {};
    customSections.forEach((s) => {
      allCustom[s.id] = false;
    });
    setCustomOpen(allCustom);
  };

  const handleJumpToSection = (sectionId: string) => {
    if (!sectionId) return;
    if (sectionId.startsWith("section-sec-")) {
      const customId = sectionId.replace("section-", "");
      setCustomOpen((prev) => ({ ...prev, [customId]: true }));
    } else {
      const key = sectionId.replace("section-", "") as keyof typeof openSections;
      setOpenSections((prev) => ({ ...prev, [key]: true }));
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const handleOpenRefineModal = (text: string, onApply: (newText: string) => void) => {
    setActiveRefineText(text);
    setActiveApplyCallback(() => onApply);
    setAiModalOpen(true);
  };

  const handleApplyRefine = (refinedText: string) => {
    if (activeApplyCallback) {
      activeApplyCallback(refinedText);
    }
  };

  const allOpen = Object.values(openSections).every(Boolean);

  // When a save/continue is blocked by validation, expand the section that
  // contains the first invalid field, scroll it into view, and focus that
  // specific input (never the section's first input) so an already-filled
  // field is not re-selected on the next attempt.
  useEffect(() => {
    const errors = persistence.validationErrors;
    if (!errors || errors.length === 0) return;

    const firstField = errors[0].field;
    let sectionKey: keyof typeof openSections | null = null;
    let customSectionId: string | null = null;

    if (firstField.startsWith("personalInfo.")) {
      sectionKey = "personal";
    } else if (firstField.startsWith("skillGroups.")) {
      sectionKey = "skills";
    } else if (firstField.startsWith("sections.")) {
      const idx = Number(firstField.split(".")[1]);
      const sec = cvData.sections?.[idx];
      if (sec?.sectionType === "EDUCATION") sectionKey = "education";
      else if (sec?.sectionType === "EXPERIENCE") sectionKey = "experience";
      else if (sec?.sectionType === "PROJECTS") sectionKey = "projects";
      else if (sec?.sectionType === "SKILLS" || !sec) sectionKey = "skills";
      else customSectionId = sec.id;
    }

    const focusTarget = (containerId: string | null) => {
      // Prefer the exact invalid field so a fixed field is never re-focused.
      const exact = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[data-validate="${CSS.escape(firstField)}"]`
      );
      if (exact) {
        exact.scrollIntoView({ behavior: "smooth", block: "center" });
        if (document.activeElement !== exact) {
          exact.focus({ preventScroll: true });
        }
        return;
      }
      // Fallback: first input of the containing section.
      if (!containerId) return;
      const el = document.getElementById(containerId);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")?.focus({
        preventScroll: true,
      });
    };

    if (customSectionId) {
      setCustomOpen((prev) => ({ ...prev, [customSectionId]: true }));
      setTimeout(() => focusTarget(`section-${customSectionId}`), 80);
      return;
    }

    if (!sectionKey) return;
    if (!openSections[sectionKey]) {
      toggleSection(sectionKey);
    }
    setTimeout(() => focusTarget(`section-${sectionKey}`), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistence.validationErrors]);

  return (
    <div className="w-full pb-16">
      {/* Quick Section Navigation & Accordion Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 px-1">
        {/* Jump to section dropdown */}
        <JumpSectionDropdown
          onSelect={handleJumpToSection}
          customSections={customSections}
        />

        {/* Expand / Collapse All & Clear All Toggles */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={allOpen ? collapseAll : expandAll}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{allOpen ? "Collapse All" : "Expand All"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 bg-white hover:border-rose-200 border border-slate-200 rounded-lg shadow-2xs transition-colors group"
            title="Clear all CV fields"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Target Role & Autocomplete */}
      <RoleAutocomplete
        isOpen={openSections.role}
        onToggle={() => toggleSection("role")}
      />

      {/* Form Sections */}
      <PersonalSection
        isOpen={openSections.personal}
        onToggle={() => toggleSection("personal")}
      />
      <EducationSection
        onRefineBullet={handleOpenRefineModal}
        isOpen={openSections.education}
        onToggle={() => toggleSection("education")}
      />
      <ExperienceSection
        onRefineBullet={handleOpenRefineModal}
        isOpen={openSections.experience}
        onToggle={() => toggleSection("experience")}
      />
      <ProjectsSection
        onRefineBullet={handleOpenRefineModal}
        isOpen={openSections.projects}
        onToggle={() => toggleSection("projects")}
      />
      <SkillsSection
        isOpen={openSections.skills}
        onToggle={() => toggleSection("skills")}
      />

      {/* User-added Custom Sections */}
      {customSections.map((sec) => (
        <CustomSection
          key={sec.id}
          section={sec}
          onRefineBullet={handleOpenRefineModal}
          isOpen={customOpen[sec.id] !== false}
          onToggle={() => toggleCustomSection(sec.id)}
        />
      ))}

      {/* Add Custom Section Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => addCustomSection("Certifications & Activities")}
          className="w-full py-3.5 px-4 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl bg-sky-50/40 hover:bg-sky-50 text-sky-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-sm group cursor-pointer"
        >
          <Plus className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          <span>Add Custom Section (e.g. Certifications, Volunteering, Publications)</span>
        </button>
      </div>

      {/* AI Refine Modal */}
      <AIEnhanceModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        originalText={activeRefineText}
        targetRole={cvData.targetRole}
        onApply={handleApplyRefine}
      />

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-4">
            <Trash2 className="w-9 h-9 text-rose-600" />

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Clear all CV content?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will reset all sections to a blank template and delete any saved progress. This action cannot be undone.
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setShowClearConfirm(false);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-subtle"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
