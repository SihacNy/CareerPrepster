"use client";

import React, { useState, useEffect } from "react";
import { X, Sliders, Save, MapPin, Briefcase, DollarSign, Bell } from "lucide-react";
import type { JobSearchPreferenceDto, WorkArrangement, JobEmploymentType } from "@/types/jobs";

interface JobPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: JobSearchPreferenceDto | null;
  onSave: (prefs: Partial<JobSearchPreferenceDto>) => Promise<void>;
}

export function JobPreferencesModal({
  isOpen,
  onClose,
  preferences,
  onSave,
}: JobPreferencesModalProps) {
  const [desiredRoles, setDesiredRoles] = useState("");
  const [preferredLocations, setPreferredLocations] = useState("");
  const [preferredArrangement, setPreferredArrangement] = useState<WorkArrangement | "">("");
  const [preferredEmploymentType, setPreferredEmploymentType] = useState<JobEmploymentType | "">("");
  const [minSalary, setMinSalary] = useState<number | "">("");
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setDesiredRoles(preferences.desiredRoles?.join(", ") || "");
      setPreferredLocations(preferences.preferredLocations?.join(", ") || "");
      setPreferredArrangement(preferences.preferredArrangement || "");
      setPreferredEmploymentType(preferences.preferredEmploymentType || "");
      setMinSalary(preferences.minSalary ?? "");
      setNotifyDaily(preferences.notifyDaily ?? true);
    }
  }, [preferences]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const rolesArray = desiredRoles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const locationsArray = preferredLocations
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      await onSave({
        desiredRoles: rolesArray,
        preferredLocations: locationsArray,
        preferredArrangement: preferredArrangement ? (preferredArrangement as WorkArrangement) : null,
        preferredEmploymentType: preferredEmploymentType ? (preferredEmploymentType as JobEmploymentType) : null,
        minSalary: minSalary !== "" ? Number(minSalary) : null,
        notifyDaily,
      });

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Job Match Preferences</h2>
              <p className="text-xs text-slate-500">Fine-tune candidate criteria for tailored matching</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Role Titles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Job Titles (Comma-separated)
            </label>
            <input
              type="text"
              value={desiredRoles}
              onChange={(e) => setDesiredRoles(e.target.value)}
              placeholder="e.g. Frontend Developer, React Engineer, Full Stack"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
            />
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Locations (Comma-separated)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={preferredLocations}
                onChange={(e) => setPreferredLocations(e.target.value)}
                placeholder="e.g. Remote, Phnom Penh, Singapore"
                className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
              />
            </div>
          </div>

          {/* Work Arrangement & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Arrangement
              </label>
              <select
                value={preferredArrangement}
                onChange={(e) => setPreferredArrangement(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 bg-white"
              >
                <option value="">Any Arrangement</option>
                <option value="REMOTE">Remote Only</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employment Type
              </label>
              <select
                value={preferredEmploymentType}
                onChange={(e) => setPreferredEmploymentType(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 bg-white"
              >
                <option value="">Any Type</option>
                <option value="FULL_TIME">Full-Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract / Freelance</option>
                <option value="PART_TIME">Part-Time</option>
              </select>
            </div>
          </div>

          {/* Minimum Salary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Minimum Salary Expectation (USD/month)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min="0"
                step="50"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 500"
                className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
              />
            </div>
          </div>

          {/* Daily Notifications Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Nightly Match Alerts</p>
                <p className="text-[11px] text-slate-500">Recalculate and prioritize daily vacancies</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
