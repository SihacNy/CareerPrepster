"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { useCV } from "@/lib/store";
import { EducationItem } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";
import { DateRangePicker } from "../DateRangePicker";

interface EducationSectionProps {
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const EDUCATION_SUGGESTIONS = [
  "Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Management Systems, Cloud Computing.",
  "Dean's Honor List for 5 consecutive semesters; Vice President of ACM Student Chapter.",
  "Undergraduate Teaching Assistant for Intro to Computer Science, mentoring 45+ freshman students.",
  "Recipient of Faculty Academic Excellence Scholarship for ranking in top 5% of class.",
  "Organized collegiate hackathon with 200+ participants across 12 universities.",
];

export function EducationSection({ onRefineBullet, isOpen, onToggle }: EducationSectionProps) {
  const { cvData, setCVData } = useCV();
  const { education } = cvData;
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
    const newEntry: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      gpa: "",
      bulletPoints: [""],
    };
    setCVData((prev) => ({
      ...prev,
      education: [...prev.education, newEntry],
    }));
    setCollapsedEntries((prev) => ({ ...prev, [newEntry.id]: false }));
  };

  const handleUpdateEntry = (id: string, field: keyof EducationItem, value: any) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveEntry = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  return (
    <div id="section-education" className="bg-white p-5 rounded-xl border border-slate-200 mb-5 scroll-mt-24 transition-all">
      {/* Section Header */}
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${isSectionOpen ? "pb-2 border-b border-slate-100 mb-4" : "mb-0"
          }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSectionOpen ? "" : "-rotate-90"
              }`}
          />
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>Education</span>
            <span className="text-xs text-slate-400 font-normal">
              ({education.length})
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
            title="Add Degree"
            aria-label="Add Degree"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        education.length === 0 ? (
          <div className="py-7 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-500">
              No education added yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {education.map((edu, index) => {
              const isCollapsed = !!collapsedEntries[edu.id];
              return (
                <div
                  key={edu.id}
                  className={`rounded-xl border border-slate-200 bg-slate-50/50 relative group transition-all ${
                    isCollapsed ? "px-3 py-2 space-y-0" : "p-4 space-y-3"
                  }`}
                >
                  {/* Top header bar: Summary + Edit & Trash actions */}
                  <div
                    className={`flex items-center justify-between ${
                      !isCollapsed ? "pb-3 border-b border-slate-200/70" : "py-0.5"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer select-none min-w-0 pr-2 group/title flex-1"
                      onClick={() => toggleEntryCollapse(edu.id)}
                      title={isCollapsed ? "Click to edit" : "Click to collapse"}
                    >
                      <span className="text-xs font-medium text-slate-700 group-hover/title:text-sky-600 transition-colors truncate">
                        {edu.institution || edu.degree || `Education #${index + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleEntryCollapse(edu.id)}
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
                        onClick={() => handleRemoveEntry(edu.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
                        title="Remove education entry"
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
                            University / College <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEntry(edu.id, "institution", e.target.value)}
                            placeholder="e.g. CamTech University / State University"
                            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Degree &amp; Major <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEntry(edu.id, "degree", e.target.value)}
                            placeholder="e.g. B.S. in Computer Science"
                            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => handleUpdateEntry(edu.id, "location", e.target.value)}
                            placeholder="e.g. Phnom Penh, Cambodia"
                            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) => handleUpdateEntry(edu.id, "gpa", e.target.value)}
                            placeholder="e.g. 3.85 / 4.00"
                            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div className="col-span-2">
                          <DateRangePicker
                            startDate={edu.startDate}
                            endDate={edu.endDate}
                            isCurrent={edu.isCurrent}
                            onStartDateChange={(val) => handleUpdateEntry(edu.id, "startDate", val)}
                            onEndDateChange={(val) => handleUpdateEntry(edu.id, "endDate", val)}
                            onIsCurrentChange={(isCurrent) => handleUpdateEntry(edu.id, "isCurrent", isCurrent)}
                            endLabel="Graduation / End Date"
                            currentLabel="I am currently enrolled / studying here"
                          />
                        </div>
                      </div>

                      {/* Bullet Points with Sora-like Rich Formatting & Refine with AI */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <RichBulletEditor
                          label="Coursework, Honors & Leadership Bullets"
                          bullets={edu.bulletPoints || []}
                          suggestions={EDUCATION_SUGGESTIONS}
                          onChange={(newBullets) => handleUpdateEntry(edu.id, "bulletPoints", newBullets)}
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
