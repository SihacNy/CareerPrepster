"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { useCV } from "@/lib/store";
import { ExperienceItem } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";
import { DateRangePicker } from "../DateRangePicker";

interface ExperienceSectionProps {
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const EXPERIENCE_SUGGESTIONS = [
  "Architected and deployed scalable RESTful APIs in Node.js and TypeScript, handling 100,000+ weekly requests with 99.9% uptime.",
  "Optimized relational database query execution plans and indexed foreign keys, slashing median response times by 40%.",
  "Engineered responsive, accessible single-page web applications utilizing React, Next.js, and Tailwind CSS adhering to WCAG 2.1 AA.",
  "Designed and implemented automated CI/CD pipelines with GitHub Actions, reducing deployment cycle times from 45 mins to 8 mins.",
  "Authored comprehensive unit and integration test suites using Jest, boosting service code coverage from 68% to 91%.",
  "Collaborated in an Agile scrum team of 6 engineers, participating in bi-weekly sprints, code reviews, and retrospectives.",
];

export function ExperienceSection({ onRefineBullet, isOpen, onToggle }: ExperienceSectionProps) {
  const { cvData, setCVData } = useCV();
  const { experience } = cvData;
  const [internalOpen, setInternalOpen] = useState(true);
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});

  const toggleEntryCollapse = (id: string) => {
    setCollapsedEntries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  const handleAddEntry = () => {
    const newEntry: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      bulletPoints: [""],
    };
    setCVData((prev) => ({
      ...prev,
      experience: [...prev.experience, newEntry],
    }));
    setCollapsedEntries((prev) => ({
      ...prev,
      [newEntry.id]: false,
    }));
  };

  const handleUpdateEntry = (id: string, field: keyof ExperienceItem, value: any) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveEntry = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  return (
    <div id="section-experience" className="bg-white p-5 rounded-xl border border-slate-200 mb-5 scroll-mt-24 transition-all">
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
            <Briefcase className="w-4 h-4 text-sky-600" />
            <span>Work &amp; Internship Experience</span>
            <span className="text-xs text-slate-400 font-normal">
              ({experience.length})
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddEntry();
              if (!isSectionOpen) toggleSection();
            }}
            title="Add Experience"
            aria-label="Add Experience"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        experience.length === 0 ? (
          <div className="py-7 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-500">
              No work experience added yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
          {experience.map((exp, index) => {
            const isCollapsed = !!collapsedEntries[exp.id];

            return (
              <div
                key={exp.id}
                className={`rounded-xl border border-slate-200 bg-slate-50/50 relative group transition-all ${
                  isCollapsed ? "px-3 py-2 space-y-0" : "p-4 space-y-3"
                }`}
              >
                {/* Entry Header: Summary title on left, Edit & Trash on right */}
                <div
                  className={`flex items-center justify-between ${
                    !isCollapsed ? "pb-3 border-b border-slate-200/70" : "py-0.5"
                  }`}
                >
                  <div
                    onClick={() => toggleEntryCollapse(exp.id)}
                    className="flex items-center gap-2 cursor-pointer select-none group/title flex-1 min-w-0 pr-2"
                    title={isCollapsed ? "Click to edit" : "Click to collapse"}
                  >
                    <span className="text-xs font-medium text-slate-700 truncate group-hover/title:text-sky-600 transition-colors">
                      {exp.company || exp.role || `Experience #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleEntryCollapse(exp.id)}
                      className={`p-1 rounded hover:bg-white transition-colors ${
                        !isCollapsed ? "text-sky-600" : "text-slate-400 hover:text-slate-700"
                      }`}
                      title={isCollapsed ? "Edit entry" : "Collapse entry"}
                      aria-label={isCollapsed ? "Edit entry" : "Collapse entry"}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
                      title="Remove experience entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Company / Organization <span className="text-red-500 font-semibold">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateEntry(exp.id, "company", e.target.value)}
                          placeholder="e.g. Acme Tech Solutions"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Job Title / Role <span className="text-red-500 font-semibold">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateEntry(exp.id, "role", e.target.value)}
                          placeholder="e.g. Junior Frontend Developer"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => handleUpdateEntry(exp.id, "location", e.target.value)}
                          placeholder="e.g. Phnom Penh, Cambodia (or Remote)"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div className="col-span-2">
                        <DateRangePicker
                          startDate={exp.startDate}
                          endDate={exp.endDate}
                          isCurrent={exp.isCurrent}
                          onStartDateChange={(val) => handleUpdateEntry(exp.id, "startDate", val)}
                          onEndDateChange={(val) => handleUpdateEntry(exp.id, "endDate", val)}
                          onIsCurrentChange={(isCurrent) => handleUpdateEntry(exp.id, "isCurrent", isCurrent)}
                          currentLabel="I currently work here"
                        />
                      </div>
                    </div>

                    {/* Bullets with Sora-like Rich Formatting & Refine with AI */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <RichBulletEditor
                        label="Key Achievements & Responsibilities"
                        bullets={exp.bulletPoints || []}
                        suggestions={EXPERIENCE_SUGGESTIONS}
                        onChange={(newBullets) => handleUpdateEntry(exp.id, "bulletPoints", newBullets)}
                        onRefineWithAI={onRefineBullet}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
          </div>
        )
      )}
    </div>
  );
}
