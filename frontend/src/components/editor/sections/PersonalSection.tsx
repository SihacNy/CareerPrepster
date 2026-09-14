"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Linkedin, Github, ChevronDown } from "lucide-react";
import { useCV } from "@/lib/store";

export function PersonalSection({
  isOpen,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
} = {}) {
  const { cvData, updatePersonalInfo } = useCV();
  const { personalInfo } = cvData;
  const [internalOpen, setInternalOpen] = useState(true);

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div id="section-personal" className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 scroll-mt-24 transition-all">
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${isSectionOpen ? "pb-2.5 border-b border-slate-100 mb-4" : "mb-0"
          }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSectionOpen ? "" : "-rotate-90"
              }`}
          />
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            Personal Information &amp; Contact
          </h3>
        </div>

        {!isSectionOpen && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 truncate max-w-[220px]">
            {personalInfo.fullName || personalInfo.email || "Details hidden"}
          </span>
        )}
      </div>

      {isSectionOpen && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                Full Name <span className="text-red-500 font-semibold">*</span>
              </label>
              <input
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-500 font-semibold">*</span>
              </label>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="alex.rivera@university.edu"
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+1 (555) 432-8901"
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">Location</label>
              <input
                type="text"
                value={personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="City, State / Country"
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">LinkedIn Profile</label>
              <input
                type="text"
                value={personalInfo.linkedinUrl}
                onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">GitHub / Portfolio</label>
              <input
                type="text"
                value={personalInfo.githubUrl}
                onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
                placeholder="github.com/username"
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4">
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
              Professional Bio / Objective (Optional)
            </label>
            <textarea
              rows={2}
              value={personalInfo.summary}
              onChange={(e) => updatePersonalInfo("summary", e.target.value)}
              placeholder="Brief 1-2 sentence overview of your degree, key technical competencies, and target role..."
              className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none leading-relaxed shadow-2xs transition-colors"
            />
          </div>
        </>
      )}
    </div>
  );
}
