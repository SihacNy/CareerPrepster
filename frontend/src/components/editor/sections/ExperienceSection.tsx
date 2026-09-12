"use client";

import React from "react";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { ExperienceItem } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";

interface ExperienceSectionProps {
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
}

const EXPERIENCE_SUGGESTIONS = [
  "Architected and deployed scalable RESTful APIs in Node.js and TypeScript, handling 100,000+ weekly requests with 99.9% uptime.",
  "Optimized relational database query execution plans and indexed foreign keys, slashing median response times by 40%.",
  "Engineered responsive, accessible single-page web applications utilizing React, Next.js, and Tailwind CSS adhering to WCAG 2.1 AA.",
  "Designed and implemented automated CI/CD pipelines with GitHub Actions, reducing deployment cycle times from 45 mins to 8 mins.",
  "Authored comprehensive unit and integration test suites using Jest, boosting service code coverage from 68% to 91%.",
  "Collaborated in an Agile scrum team of 6 engineers, participating in bi-weekly sprints, code reviews, and retrospectives.",
];

export function ExperienceSection({ onRefineBullet }: ExperienceSectionProps) {
  const { cvData, setCVData } = useCV();
  const { experience } = cvData;

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
    <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-sky-600" />
          Work &amp; Internship Experience
        </h3>
        <button
          type="button"
          onClick={handleAddEntry}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Experience
        </button>
      </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleUpdateEntry(exp.id, "company", e.target.value)}
                  placeholder="e.g. Google, TechNova, Ministry of Education"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Title / Role *</label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => handleUpdateEntry(exp.id, "role", e.target.value)}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => handleUpdateEntry(exp.id, "location", e.target.value)}
                  placeholder="e.g. Remote or Phnom Penh"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => handleUpdateEntry(exp.id, "startDate", e.target.value)}
                    placeholder="Jun 2025"
                    className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => handleUpdateEntry(exp.id, "endDate", e.target.value)}
                    placeholder="Aug 2025"
                    className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
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
    </div>
  );
}
