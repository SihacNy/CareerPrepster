"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Trash2, ChevronDown } from "lucide-react";
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

  const handleAddBullet = (expId: string) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === expId
          ? { ...item, bulletPoints: [...item.bulletPoints, ""] }
          : item
      ),
    }));
  };

  const handleUpdateBullet = (expId: string, bulletIdx: number, val: string) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === expId
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

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === expId
          ? {
              ...item,
              bulletPoints: item.bulletPoints.filter((_, i) => i !== bulletIdx),
            }
          : item
      ),
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
        <div className="space-y-6">
        {experience.map((exp) => (
          <div
            key={exp.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
          >
            <button
              type="button"
              onClick={() => handleRemoveEntry(exp.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
              title="Remove experience entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company / Organization <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleUpdateEntry(exp.id, "company", e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Job Title / Role <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => handleUpdateEntry(exp.id, "role", e.target.value)}
                  placeholder="e.g. Junior Frontend Developer"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => handleUpdateEntry(exp.id, "location", e.target.value)}
                  placeholder="e.g. Phnom Penh, Cambodia (or Remote)"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
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
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
