"use client";

import React, { useMemo, useState } from "react";
import { User, Mail, Phone, MapPin, Linkedin, Github, ChevronDown, Trash2, Upload } from "lucide-react";
import { useCV } from "@/lib/store";
import { buildValidationMap } from "@/lib/cvValidation";
import { FieldError, fieldErrorInputClass } from "@/components/editor/FieldError";
import { getTemplateById } from "@/types/templates";

export function PersonalSection({
  isOpen,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
} = {}) {
  const { cvData, updatePersonalInfo, persistence } = useCV();
  const { personalInfo } = cvData;
  const [internalOpen, setInternalOpen] = useState(true);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");

  const templateDef = getTemplateById(cvData.templateId);
  const supportsPhoto = templateDef.supportsPhoto;

  const validationMap = useMemo(
    () => buildValidationMap(persistence.validationErrors ?? []),
    [persistence.validationErrors]
  );
  const fullNameError = validationMap["personalInfo.fullName"];
  const emailError = validationMap["personalInfo.email"];
  const linkedinError = validationMap["personalInfo.linkedinUrl"];
  const githubError = validationMap["personalInfo.githubUrl"];
  const photoFieldError = validationMap["personalInfo.photoUrl"];

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
          {/* Profile Photo Uploader (Only visible on templates that support photo) */}
          {supportsPhoto && (
            <div className="mb-5 pb-5 border-b border-slate-100">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                Profile Photo <span className="text-red-500 font-semibold">*</span>
                <FieldError message={photoFieldError} inline />
              </label>

              {/* Profile Card with Big Photo and Controls */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/70 border rounded-2xl p-4 shadow-2xs transition-colors ${
                  photoFieldError ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200"
                }`}
              >
                {/* Big Profile Avatar with Dashed Stroke */}
                <label
                  htmlFor="photo-upload-input"
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-xs cursor-pointer hover:border-sky-500 hover:bg-sky-50/20 transition-all ${
                    photoFieldError ? "border-rose-300" : "border-slate-300"
                  }`}
                  title="Click to choose profile photo"
                >
                  {personalInfo.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={personalInfo.photoUrl}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className={`w-12 h-12 ${photoFieldError ? "text-rose-300" : "text-slate-300"}`} />
                  )}
                </label>

                {/* Controls & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <label
                      htmlFor="photo-upload-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choose File</span>
                    </label>

                    {personalInfo.photoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updatePersonalInfo("photoUrl" as any, "");
                          setPhotoFileName("");
                        }}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <span className="text-xs sm:text-sm text-slate-600 font-medium truncate max-w-xs">
                      {photoFileName || (personalInfo.photoUrl ? "Photo uploaded" : "No file chosen")}
                    </span>

                    <input
                      type="file"
                      id="photo-upload-input"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
                        const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

                        if (!ALLOWED_TYPES.includes(file.type)) {
                          setPhotoError("Only PNG, JPEG, and WebP images are supported.");
                          e.target.value = "";
                          return;
                        }

                        if (file.size > MAX_SIZE) {
                          setPhotoError("Image exceeds the 10MB limit. Please upload a smaller image.");
                          e.target.value = "";
                          return;
                        }

                        setPhotoError(null);
                        setPhotoFileName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === "string") {
                            updatePersonalInfo("photoUrl" as any, reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Required for photo-enabled templates ({templateDef.name}). Max file size: 10MB (PNG, JPEG, WebP).
                  </p>

                  {photoError && (
                    <p className="mt-2 text-xs text-rose-600 font-medium">
                      {photoError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                Full Name <span className="text-red-500 font-semibold">*</span>
                <FieldError message={fullNameError} inline />
              </label>
              <input
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                data-validate="personalInfo.fullName"
                placeholder="e.g. Alex Rivera"
                className={`w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors ${
                  fullNameError ? fieldErrorInputClass : ""
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-500 font-semibold">*</span>
                <FieldError message={emailError} inline />
              </label>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                data-validate="personalInfo.email"
                placeholder="alex.rivera@university.edu"
                className={`w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors ${
                  emailError ? fieldErrorInputClass : ""
                }`}
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
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                LinkedIn Profile
                <FieldError message={linkedinError} inline />
              </label>
              <input
                type="text"
                value={personalInfo.linkedinUrl}
                onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
                data-validate="personalInfo.linkedinUrl"
                placeholder="linkedin.com/in/username"
                className={`w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors ${
                  linkedinError ? fieldErrorInputClass : ""
                }`}
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                GitHub / Portfolio
                <FieldError message={githubError} inline />
              </label>
              <input
                type="text"
                value={personalInfo.githubUrl}
                onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
                data-validate="personalInfo.githubUrl"
                placeholder="github.com/username"
                className={`w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none shadow-2xs transition-colors ${
                  githubError ? fieldErrorInputClass : ""
                }`}
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
