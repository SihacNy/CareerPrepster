"use client";

import React from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { EducationItem } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";

interface EducationSectionProps {
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
}

const EDUCATION_SUGGESTIONS = [
  "Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Management Systems, Cloud Computing.",
  "Dean's Honor List for 5 consecutive semesters; Vice President of ACM Student Chapter.",
  "Undergraduate Teaching Assistant for Intro to Computer Science, mentoring 45+ freshman students.",
  "Recipient of Faculty Academic Excellence Scholarship for ranking in top 5% of class.",
  "Organized collegiate hackathon with 200+ participants across 12 universities.",
];

export function EducationSection({ onRefineBullet }: EducationSectionProps) {
  const { cvData, setCVData } = useCV();
  const { education } = cvData;

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
    <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          Education
        </h3>
        <button
          type="button"
          onClick={handleAddEntry}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Degree
        </button>
      </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  University / College *
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleUpdateEntry(edu.id, "institution", e.target.value)}
                  placeholder="e.g. CamTech University / State University"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Degree &amp; Major *
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleUpdateEntry(edu.id, "degree", e.target.value)}
                  placeholder="e.g. B.S. in Computer Science"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => handleUpdateEntry(edu.id, "location", e.target.value)}
                  placeholder="e.g. Phnom Penh, Cambodia"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  GPA (Optional)
                </label>
                <input
                  type="text"
                  value={edu.gpa || ""}
                  onChange={(e) => handleUpdateEntry(edu.id, "gpa", e.target.value)}
                  placeholder="e.g. 3.85 / 4.00"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={(e) => handleUpdateEntry(edu.id, "startDate", e.target.value)}
                  placeholder="Sep 2022"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Graduation / End Date
                </label>
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={(e) => handleUpdateEntry(edu.id, "endDate", e.target.value)}
                  placeholder="Jun 2026"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
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
    </div>
  );
}
