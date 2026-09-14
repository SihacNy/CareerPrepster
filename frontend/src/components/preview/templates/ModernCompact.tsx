"use client";

import React from "react";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { FormattedText } from "@/lib/formatText";

interface TemplateProps {
  data: CVData;
}

export function ModernCompact({ data }: TemplateProps) {
  const { personalInfo } = data;
  const education = getSectionItems(data, "EDUCATION");
  const experience = getSectionItems(data, "EXPERIENCE");
  const projects = getSectionItems(data, "PROJECTS");
  const customSections = (data.sections || []).filter(
    (s) => s.sectionType === "CUSTOM" && s.isVisible !== false && s.items && s.items.length > 0
  );
  const skillGroups = data.skillGroups && data.skillGroups.length > 0
    ? data.skillGroups
    : (data.skills || []);

  return (
    <div className="w-full bg-white text-slate-900 p-8 sm:p-10 font-sans leading-tight text-[12.5px] shadow-sm max-w-[800px] mx-auto min-h-[1050px]">
      {/* Header - Left Aligned Tech Standard */}
      <header className="pb-3 border-b border-slate-300">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11.5px] text-slate-600 font-mono">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>|</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.location && <span>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span>|</span>}
          {personalInfo.linkedinUrl && <span>{personalInfo.linkedinUrl}</span>}
          {personalInfo.githubUrl && <span>|</span>}
          {personalInfo.githubUrl && <span>{personalInfo.githubUrl}</span>}
        </div>
      </header>

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => {
              const bullets = getBulletTexts(edu.bulletPoints);
              return (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{edu.subtitle || (edu as any).institution}</span>
                    <span className="text-[11.5px] font-normal text-slate-600">
                      {edu.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 text-[11.5px]">
                    <span>
                      {edu.title || (edu as any).degree}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono">
                      {edu.startDate} – {edu.isCurrent ? "Present" : edu.endDate}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px]">
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

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => {
              const bullets = getBulletTexts(exp.bulletPoints);
              return (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.subtitle || (exp as any).company}</span>
                    <span className="text-[11.5px] font-normal text-slate-600">
                      {exp.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 text-[11.5px] italic">
                    <span>{exp.title || (exp as any).role}</span>
                    <span className="text-[11px] not-italic text-slate-600 font-mono">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
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

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            Technical Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => {
              const bullets = getBulletTexts(proj.bulletPoints);
              const techList = proj.techStack && proj.techStack.length > 0
                ? proj.techStack
                : proj.subtitle ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean) : [];
              return (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline text-slate-900">
                    <span className="font-bold">
                      {proj.title || (proj as any).name}
                      {techList.length > 0 && (
                        <span className="font-normal text-slate-600 text-[11.5px] ml-1.5">
                          | {techList.join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono">
                      {proj.startDate && proj.endDate ? `${proj.startDate} – ${proj.endDate}` : ""}
                    </span>
                  </div>
                  {(proj.url || (proj as any).linkUrl) && (
                    <div className="text-[11px] text-slate-600 font-mono">
                      {proj.url || (proj as any).linkUrl}
                    </div>
                  )}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
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

      {/* Technical Skills */}
      {skillGroups && skillGroups.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-[11.5px]">
            {skillGroups.map((group) => (
              <div key={group.id} className="flex">
                <span className="font-bold text-slate-900 w-48 flex-shrink-0">
                  {group.categoryName}:
                </span>
                <span className="text-slate-700">
                  {group.skills.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections.map((sec) => (
        <section key={sec.id} className="mt-3.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            {sec.title}
          </h2>
          <div className="space-y-2.5">
            {sec.items.map((item) => {
              const bullets = getBulletTexts(item.bulletPoints);
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{item.title}</span>
                    {item.location && (
                      <span className="text-[11.5px] font-normal text-slate-600">
                        {item.location}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div className="flex justify-between items-baseline text-slate-800 text-[11.5px] italic">
                      <span>{item.subtitle}</span>
                      {(item.startDate || item.endDate) && (
                        <span className="text-[11px] not-italic text-slate-600 font-mono">
                          {item.startDate} {item.endDate ? `– ${item.isCurrent ? "Present" : item.endDate}` : ""}
                        </span>
                      )}
                    </div>
                  )}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
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
    </div>
  );
}
