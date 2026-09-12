"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";
import { useCV } from "@/lib/store";

export function PersonalSection() {
  const { cvData, updatePersonalInfo } = useCV();
  const { personalInfo } = cvData;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5">
      <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-1.5">
        <User className="w-4 h-4 text-sky-600" />
        Personal Information &amp; Contact
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Full Name */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo("email", e.target.value)}
            placeholder="alex.rivera@university.edu"
            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
            placeholder="+1 (555) 432-8901"
            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => updatePersonalInfo("location", e.target.value)}
            placeholder="City, State / Country"
            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">LinkedIn Profile</label>
          <input
            type="text"
            value={personalInfo.linkedinUrl}
            onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
            placeholder="linkedin.com/in/username"
            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">GitHub / Portfolio</label>
          <input
            type="text"
            value={personalInfo.githubUrl}
            onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
            placeholder="github.com/username"
            className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3.5">
        <label className="block font-medium text-slate-700 mb-1 text-xs">
          Professional Bio / Objective (Optional)
        </label>
        <textarea
          rows={2}
          value={personalInfo.summary}
          onChange={(e) => updatePersonalInfo("summary", e.target.value)}
          placeholder="Brief 1-2 sentence overview of your degree, key technical competencies, and target role..."
          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
