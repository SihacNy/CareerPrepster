"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Trash2, ChevronDown } from "lucide-react";
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

  const handleAddBullet = (eduId: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === eduId
          ? { ...item, bulletPoints: [...item.bulletPoints, ""] }
          : item
      ),
    }));
  };

  const handleUpdateBullet = (eduId: string, bulletIdx: number, val: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === eduId
          ? {
              ...item,
              bulletPoints: item.bulletPoints.map((bp, i) =>
                i === bulletIdx ? val : bp
              ),
            }
          : item
      ),
    }));
  };

  const handleRemoveBullet = (eduId: string, bulletIdx: number) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === eduId
          ? {
              ...item,
              bulletPoints: item.bulletPoints.filter((_, i) => i !== bulletIdx),
            }
          : item
      ),
    }));
  };

  return (
    <div id="section-education" className="bg-white p-5 rounded-xl border border-slate-200 mb-5 scroll-mt-24 transition-all">
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
        <div className="space-y-6">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
          >
            <button
              type="button"
              onClick={() => handleRemoveEntry(edu.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
              title="Remove education entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  University / College <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleUpdateEntry(edu.id, "institution", e.target.value)}
                  placeholder="e.g. CamTech University / State University"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Degree &amp; Major <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleUpdateEntry(edu.id, "degree", e.target.value)}
                  placeholder="e.g. B.S. in Computer Science"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => handleUpdateEntry(edu.id, "location", e.target.value)}
                  placeholder="e.g. Phnom Penh, Cambodia"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  GPA (Optional)
                </label>
                <input
                  type="text"
                  value={edu.gpa || ""}
                  onChange={(e) => handleUpdateEntry(edu.id, "gpa", e.target.value)}
                  placeholder="e.g. 3.85 / 4.00"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
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
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
