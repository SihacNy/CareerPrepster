"use client";

import React from "react";
import { CVData } from "@/types/cv";
import { FormattedText } from "@/lib/formatText";

interface TemplateProps {
  data: CVData;
}

export function ModernCompact({ data }: TemplateProps) {
  const { personalInfo, education, experience, projects, skills } = data;

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
          {personalInfo.email && (
            <span className="text-slate-900 font-medium">{personalInfo.email}</span>
          )}
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
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{edu.institution}</span>
                  <span className="text-[11.5px] font-normal text-slate-600">
                    {edu.location}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-slate-800 text-[11.5px]">
                  <span>
                    {edu.degree}
                    {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                  </span>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {edu.startDate} – {edu.isCurrent ? "Present" : edu.endDate}
                  </span>
                </div>
                {edu.bulletPoints && edu.bulletPoints.length > 0 && (
                  <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px]">
                    {edu.bulletPoints.map((bp, i) => (
                      <li key={i}>
                        <FormattedText text={bp} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
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
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{exp.company}</span>
                  <span className="text-[11.5px] font-normal text-slate-600">
                    {exp.location}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-slate-800 text-[11.5px] italic">
                  <span>{exp.role}</span>
                  <span className="text-[11px] not-italic text-slate-600 font-mono">
                    {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
                    {exp.bulletPoints.map((bp, i) => (
                      <li key={i}>
                        <FormattedText text={bp} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
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
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline text-slate-900">
                  <span className="font-bold">
                    {proj.name}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <span className="font-normal text-slate-600 text-[11.5px] ml-1.5">
                        | {proj.techStack.join(", ")}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {proj.startDate && proj.endDate ? `${proj.startDate} – ${proj.endDate}` : ""}
                  </span>
                </div>
                {proj.bulletPoints && proj.bulletPoints.length > 0 && (
                  <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
                    {proj.bulletPoints.map((bp, i) => (
                      <li key={i}>
                        <FormattedText text={bp} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {skills && skills.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-[11.5px]">
            {skills.map((skillGroup) => (
              <div key={skillGroup.id} className="flex">
                <span className="font-bold text-slate-900 w-48 flex-shrink-0">
                  {skillGroup.categoryName}:
                </span>
                <span className="text-slate-700">
                  {skillGroup.skills.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
