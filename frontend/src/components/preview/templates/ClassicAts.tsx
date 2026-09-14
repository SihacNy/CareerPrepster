"use client";

import React from "react";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { FormattedText } from "@/lib/formatText";

interface TemplateProps {
  data: CVData;
}

export function ClassicAts({ data }: TemplateProps) {
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
    <div className="w-full bg-white text-slate-900 p-8 sm:p-10 font-sans leading-normal text-[13px] shadow-sm max-w-[800px] mx-auto min-h-[1050px]">
      {/* Header */}
      <header className="text-center pb-4 border-b border-slate-300">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-[12px] text-slate-700">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>•</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.location && <span>•</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span>•</span>}
          {personalInfo.linkedinUrl && <span>{personalInfo.linkedinUrl}</span>}
          {personalInfo.githubUrl && <span>•</span>}
          {personalInfo.githubUrl && <span>{personalInfo.githubUrl}</span>}
        </div>
        {personalInfo.summary && (
          <p className="mt-2 text-[12px] text-slate-600 text-center max-w-xl mx-auto italic">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2.5">
            {education.map((edu) => {
              const bullets = getBulletTexts(edu.bulletPoints);
              return (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-semibold text-slate-900">
                    <span>{edu.subtitle || (edu as any).institution || "University Name"}</span>
                    <span className="text-[12px] font-normal text-slate-600">
                      {edu.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-slate-800 text-[12px]">
                    <span>
                      {edu.title || (edu as any).degree}
                      {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                    </span>
                    <span className="text-[11px] not-italic text-slate-600">
                      {edu.startDate} – {edu.isCurrent ? "Present" : edu.endDate}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-5 mt-1 space-y-0.5 text-slate-700 text-[12px]">
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
        <section className="mt-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => {
              const bullets = getBulletTexts(exp.bulletPoints);
              return (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-semibold text-slate-900">
                    <span>{exp.subtitle || (exp as any).company || "Company Name"}</span>
                    <span className="text-[12px] font-normal text-slate-600">
                      {exp.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-slate-800 text-[12px]">
                    <span>{exp.title || (exp as any).role}</span>
                    <span className="text-[11px] not-italic text-slate-600">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-5 mt-1 space-y-0.5 text-slate-700 text-[12px]">
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
        <section className="mt-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Academic &amp; Technical Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => {
              const bullets = getBulletTexts(proj.bulletPoints);
              const techList = proj.techStack && proj.techStack.length > 0
                ? proj.techStack
                : proj.subtitle ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean) : [];
              return (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline text-slate-900">
                    <span className="font-semibold">
                      {proj.title || (proj as any).name}
                      {techList.length > 0 && (
                        <span className="font-normal italic text-slate-600 text-[12px] ml-1.5">
                          | {techList.join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {proj.startDate && proj.endDate ? `${proj.startDate} – ${proj.endDate}` : ""}
                    </span>
                  </div>
                  {(proj.url || (proj as any).linkUrl) && (
                    <div className="text-[11px] text-slate-600">
                      {proj.url || (proj as any).linkUrl}
                    </div>
                  )}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-5 mt-1 space-y-0.5 text-slate-700 text-[12px]">
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
        <section className="mt-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Technical Skills
          </h2>
          <div className="space-y-1 text-[12px]">
            {skillGroups.map((group) => (
              <div key={group.id} className="flex">
                <span className="font-semibold text-slate-900 w-44 flex-shrink-0">
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
        <section key={sec.id} className="mt-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            {sec.title}
          </h2>
          <div className="space-y-3">
            {sec.items.map((item) => {
              const bullets = getBulletTexts(item.bulletPoints);
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline font-semibold text-slate-900">
                    <span>{item.title}</span>
                    {item.location && (
                      <span className="text-[12px] font-normal text-slate-600">
                        {item.location}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div className="flex justify-between items-baseline italic text-slate-800 text-[12px]">
                      <span>{item.subtitle}</span>
                      {(item.startDate || item.endDate) && (
                        <span className="text-[11px] not-italic text-slate-600">
                          {item.startDate} {item.endDate ? `– ${item.isCurrent ? "Present" : item.endDate}` : ""}
                        </span>
                      )}
                    </div>
                  )}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-5 mt-1 space-y-0.5 text-slate-700 text-[12px]">
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
