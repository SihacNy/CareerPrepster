"use client";

import React from "react";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { FormattedText } from "@/lib/formatText";

interface TemplateProps {
  data: CVData;
}

export function ModernPhoto({ data }: TemplateProps) {
  const { personalInfo } = data;
  const accentColor = data.accentColor || "#263244";
  const photoUrl = personalInfo.photoUrl;
  const education = getSectionItems(data, "EDUCATION");
  const experience = getSectionItems(data, "EXPERIENCE");
  const projects = getSectionItems(data, "PROJECTS");
  const customSections = (data.sections || []).filter(
    (s) => s.sectionType === "CUSTOM" && s.isVisible !== false && s.items && s.items.length > 0
  );
  const skillGroups =
    data.skillGroups && data.skillGroups.length > 0
      ? data.skillGroups
      : data.skills || [];

  // Compute initials if photo is not available
  const initials = personalInfo.fullName
    ? personalInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CV";

  return (
    <div className="w-full bg-white text-slate-900 font-sans leading-normal text-[12px] shadow-sm max-w-[800px] mx-auto min-h-[1050px] flex flex-row overflow-hidden">
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR (Dark Accent: Photo, Contact, Education, Expertise)          */}
      {/* ========================================================================= */}
      <aside
        className="w-[34%] p-5 sm:p-6 text-white flex-shrink-0 flex flex-col justify-start space-y-5 transition-colors"
        style={{ backgroundColor: accentColor }}
      >
        {/* Profile Headshot */}
        <div className="flex justify-center pt-1 pb-1">
          {photoUrl ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/30 shadow-md bg-white/10 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={personalInfo.fullName || "Profile Photo"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-2xl text-white shadow-md flex-shrink-0">
              {initials}
            </div>
          )}
        </div>

        {/* Section: Contact */}
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-white pb-1 border-b border-white/30 mb-2.5">
            Contact
          </h2>
          <div className="space-y-2 text-[11px]">
            {personalInfo.phone && (
              <div>
                <div className="font-bold text-white text-[10px] uppercase tracking-wide">Phone</div>
                <div className="text-slate-200 mt-0.5">{personalInfo.phone}</div>
              </div>
            )}
            {personalInfo.email && (
              <div>
                <div className="font-bold text-white text-[10px] uppercase tracking-wide">Email</div>
                <div className="text-slate-200 mt-0.5 break-all">{personalInfo.email}</div>
              </div>
            )}
            {personalInfo.location && (
              <div>
                <div className="font-bold text-white text-[10px] uppercase tracking-wide">Address</div>
                <div className="text-slate-200 mt-0.5">{personalInfo.location}</div>
              </div>
            )}
            {personalInfo.linkedinUrl && (
              <div>
                <div className="font-bold text-white text-[10px] uppercase tracking-wide">LinkedIn</div>
                <div className="text-slate-200 mt-0.5 break-all font-mono text-[10px]">
                  {personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </div>
              </div>
            )}
            {personalInfo.portfolioUrl && (
              <div>
                <div className="font-bold text-white text-[10px] uppercase tracking-wide">Portfolio</div>
                <div className="text-slate-200 mt-0.5 break-all font-mono text-[10px]">
                  {personalInfo.portfolioUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </div>
              </div>
            )}
            {personalInfo.githubUrl && (
              <div>
                <div className="font-bold text-white text-[10px] uppercase tracking-wide">GitHub</div>
                <div className="text-slate-200 mt-0.5 break-all font-mono text-[10px]">
                  {personalInfo.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-white pb-1 border-b border-white/30 mb-2.5">
              Education
            </h2>
            <div className="space-y-3 text-[11px]">
              {education.map((edu) => {
                const dateStr = [edu.startDate, edu.isCurrent ? "Present" : edu.endDate]
                  .filter(Boolean)
                  .join(" – ");
                const bullets = getBulletTexts(edu.bulletPoints);
                return (
                  <div key={edu.id} className="space-y-0.5">
                    {dateStr && (
                      <div className="font-semibold text-slate-200 text-[10.5px]">
                        {dateStr}
                      </div>
                    )}
                    <div className="font-bold text-white text-[11.5px] leading-snug">
                      {edu.title || (edu as any).degree}
                    </div>
                    <div className="text-slate-200 text-[10.5px]">
                      {edu.subtitle || (edu as any).institution}
                      {edu.location ? `, ${edu.location}` : ""}
                    </div>
                    {edu.gpa && (
                      <div className="text-slate-300 text-[10px] italic">
                        GPA: {edu.gpa}
                      </div>
                    )}
                    {bullets.length > 0 && (
                      <ul className="list-disc ml-3.5 mt-1 space-y-0.5 text-slate-200 text-[10.5px]">
                        {bullets.map((b, i) => (
                          <li key={i}>
                            <FormattedText text={b} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Expertise */}
        {skillGroups && skillGroups.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-white pb-1 border-b border-white/30 mb-2.5">
              Expertise
            </h2>
            <div className="space-y-2.5">
              {skillGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  {group.categoryName && (
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      {group.categoryName}
                    </div>
                  )}
                  <ul className="space-y-1 text-[11px]">
                    {group.skills.map((skill, idx) => (
                      <li key={idx} className="flex items-start text-slate-100 font-medium leading-snug">
                        <span className="mr-1.5 text-white font-bold leading-none select-none">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ========================================================================= */}
      {/* RIGHT MAIN CONTENT (Name, Role, Bio, Timeline Experience & Projects)     */}
      {/* ========================================================================= */}
      <main className="w-[66%] p-5 sm:p-7 flex flex-col justify-start">
        {/* Candidate Name & Title */}
        <header className="mb-3.5">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight uppercase">
            {personalInfo.fullName || "Mariana Anderson"}
          </h1>
          {data.targetRole && (
            <div className="text-[12px] font-semibold text-slate-600 tracking-[0.22em] uppercase mt-1">
              {data.targetRole}
            </div>
          )}
          {personalInfo.summary && (
            <p className="mt-2.5 text-[11px] text-slate-600 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          )}
        </header>

        {/* Section: Experience (Timeline Rail) */}
        {experience && experience.length > 0 && (
          <section className="mt-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-800 pb-1 border-b-2 border-slate-700 mb-4">
              Experience
            </h2>

            {/* Timeline track */}
            <div className="relative pl-5 border-l-2 border-slate-300 ml-1.5 space-y-4">
              {experience.map((exp) => {
                const bullets = getBulletTexts(exp.bulletPoints);
                const dateStr = [exp.startDate, exp.isCurrent ? "Present" : exp.endDate]
                  .filter(Boolean)
                  .join(" – ");
                const companyAndLocation = [exp.subtitle || (exp as any).company, exp.location]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <div key={exp.id} className="relative">
                    {/* Node circle on the vertical timeline line */}
                    <div
                      className="absolute -left-[27px] top-[2px] w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: accentColor }}
                    />

                    {/* Dates */}
                    {dateStr && (
                      <div className="text-[11px] font-bold text-slate-800">
                        {dateStr}
                      </div>
                    )}

                    {/* Company & Location */}
                    {companyAndLocation && (
                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                        {companyAndLocation}
                      </div>
                    )}

                    {/* Job Title */}
                    <div className="text-[12px] font-bold text-slate-900 mt-0.5">
                      {exp.title || (exp as any).role}
                    </div>

                    {/* Achievements */}
                    {bullets.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-slate-600 text-[11px] leading-relaxed">
                        {bullets.map((bp, i) => (
                          <li key={i} className="text-justify">
                            <FormattedText text={bp} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section: Projects (Timeline Rail) */}
        {projects && projects.length > 0 && (
          <section className="mt-5">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-800 pb-1 border-b-2 border-slate-700 mb-4">
              Featured Projects
            </h2>

            <div className="relative pl-5 border-l-2 border-slate-300 ml-1.5 space-y-4">
              {projects.map((proj) => {
                const bullets = getBulletTexts(proj.bulletPoints);
                const dateStr = [proj.startDate, proj.endDate].filter(Boolean).join(" – ");
                const techList =
                  proj.techStack && proj.techStack.length > 0
                    ? proj.techStack
                    : proj.subtitle
                    ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];

                return (
                  <div key={proj.id} className="relative">
                    <div
                      className="absolute -left-[27px] top-[2px] w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: accentColor }}
                    />

                    {dateStr && (
                      <div className="text-[11px] font-bold text-slate-800">
                        {dateStr}
                      </div>
                    )}

                    <div className="flex items-baseline flex-wrap gap-1.5 text-[12px] font-bold text-slate-900 mt-0.5">
                      <span>{proj.title || (proj as any).name}</span>
                      {techList.length > 0 && (
                        <span className="text-[10.5px] font-normal text-slate-500">
                          ({techList.join(", ")})
                        </span>
                      )}
                    </div>

                    {(proj.url || (proj as any).linkUrl) && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {proj.url || (proj as any).linkUrl}
                      </div>
                    )}

                    {bullets.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-slate-600 text-[11px] leading-relaxed">
                        {bullets.map((bp, i) => (
                          <li key={i}>
                            <FormattedText text={bp} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section: Custom Sections */}
        {customSections.map((sec) => (
          <section key={sec.id} className="mt-5">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-800 pb-1 border-b-2 border-slate-700 mb-4">
              {sec.title}
            </h2>
            <div className="relative pl-5 border-l-2 border-slate-300 ml-1.5 space-y-3.5">
              {sec.items.map((item) => {
                const bullets = getBulletTexts(item.bulletPoints);
                return (
                  <div key={item.id} className="relative">
                    <div
                      className="absolute -left-[27px] top-[2px] w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: accentColor }}
                    />
                    <div className="flex justify-between items-baseline font-bold text-slate-900 text-[11.5px]">
                      <span>{item.title}</span>
                      {(item.location || item.url) && (
                        <span className="text-[10.5px] font-normal text-slate-500">
                          {item.location || item.url}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <div className="text-slate-600 text-[11px] italic">
                        {item.subtitle}
                      </div>
                    )}
                    {bullets.length > 0 && (
                      <ul className="mt-0.5 space-y-0.5 text-slate-600 text-[11px] leading-relaxed">
                        {bullets.map((bp, i) => (
                          <li key={i}>
                            <FormattedText text={bp} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
