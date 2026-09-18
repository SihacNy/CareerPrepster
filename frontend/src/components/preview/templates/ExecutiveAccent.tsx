"use client";

import React from "react";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { FormattedText } from "@/lib/formatText";

interface TemplateProps {
  data: CVData;
}

export function ExecutiveAccent({ data }: TemplateProps) {
  const { personalInfo } = data;
  const accentColor = data.accentColor || "#1d58ba";
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

  const initials = personalInfo.fullName
    ? personalInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CV";

  // Build clean contact items list with pipe separators (all in unified sans-serif)
  const contactItems: string[] = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedinUrl ? personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "") : "",
    personalInfo.portfolioUrl ? personalInfo.portfolioUrl.replace(/^https?:\/\/(www\.)?/, "") : "",
    personalInfo.githubUrl ? personalInfo.githubUrl.replace(/^https?:\/\/(www\.)?/, "") : "",
  ].filter(Boolean) as string[];

  return (
    <div className="w-full bg-white text-slate-900 p-8 sm:p-10 font-sans leading-normal text-[12px] shadow-sm max-w-[800px] mx-auto min-h-[1050px]">
      {/* ========================================================================= */}
      {/* HEADER: Circular Photo with Accent Border + Name & Pipe Contact Info     */}
      {/* ========================================================================= */}
      <header className="flex flex-row items-center gap-6 pb-2">
        {/* Circular Profile Photo with Thick Accent Border */}
        <div className="flex-shrink-0">
          {photoUrl ? (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[4px] shadow-sm flex-shrink-0 bg-slate-100"
              style={{ borderColor: accentColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={personalInfo.fullName || "Profile Photo"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-50 border-[4px] flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Right Info: Name + Underline Rule + Pipe Contact Bar */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide leading-tight"
            style={{ color: accentColor }}
          >
            {personalInfo.fullName || "Richard Sanchez"}
          </h1>

          {data.targetRole && (
            <div className="text-[12px] font-semibold text-slate-700 uppercase tracking-wider mt-0.5">
              {data.targetRole}
            </div>
          )}

          {/* Thin horizontal line beneath name - consistent with section lines */}
          <div
            className="w-full h-[2px] mt-2 mb-2.5"
            style={{ backgroundColor: accentColor }}
          />

          {/* Pipe-separated contact items in unified sans-serif */}
          {contactItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-600 font-medium">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span className="text-slate-400 font-normal select-none">|</span>
                  )}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PROFILE SUMMARY                                                           */}
      {/* ========================================================================= */}
      {personalInfo.summary && (
        <section className="mt-4">
          <div className="flex items-center gap-3 mb-2.5">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: accentColor }}
            >
              PROFILE SUMMARY
            </h2>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          <p className="text-[11.5px] text-slate-600 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* ========================================================================= */}
      {/* EDUCATION                                                                 */}
      {/* ========================================================================= */}
      {education && education.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center gap-3 mb-2.5">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: accentColor }}
            >
              EDUCATION
            </h2>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          <div className="space-y-3">
            {education.map((edu) => {
              const bullets = getBulletTexts(edu.bulletPoints);
              const dateStr = [edu.startDate, edu.isCurrent ? "PRESENT" : edu.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();

              return (
                <div key={edu.id}>
                  {/* Top Line: Degree | Institution on left, Italic colored date on right */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[12.5px] text-slate-800">
                      <span>{edu.title || (edu as any).degree || edu.subtitle || (edu as any).institution}</span>
                      {(edu.title || (edu as any).degree) && (edu.subtitle || (edu as any).institution) && (
                        <>
                          <span className="text-slate-400 font-normal mx-1.5 select-none">|</span>
                          <span className="font-bold text-slate-800">
                            {edu.subtitle || (edu as any).institution}
                          </span>
                        </>
                      )}
                      {edu.location && (
                        <span className="text-slate-500 font-normal text-[11px] ml-1.5">
                          ({edu.location})
                        </span>
                      )}
                      {edu.gpa && (
                        <span className="text-slate-500 font-normal text-[11px] ml-1.5">
                          • GPA: {edu.gpa}
                        </span>
                      )}
                    </span>
                    {dateStr && (
                      <span
                        className="text-[11.5px] italic font-semibold whitespace-nowrap ml-2"
                        style={{ color: accentColor }}
                      >
                        {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Bullet achievements (only if user provided bullets, exactly like Work Experience) */}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11.5px] text-slate-600 leading-relaxed">
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
        </section>
      )}

      {/* ========================================================================= */}
      {/* WORK EXPERIENCE                                                           */}
      {/* ========================================================================= */}
      {experience && experience.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center gap-3 mb-2.5">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: accentColor }}
            >
              WORK EXPERIENCE
            </h2>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          <div className="space-y-3.5">
            {experience.map((exp) => {
              const bullets = getBulletTexts(exp.bulletPoints);
              const dateStr = [exp.startDate, exp.isCurrent ? "PRESENT" : exp.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();

              return (
                <div key={exp.id}>
                  {/* Top Line: Job Title | Company on left, Italic colored date on right */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[12.5px] text-slate-800">
                      <span>{exp.title || (exp as any).role}</span>
                      {(exp.subtitle || (exp as any).company) && (
                        <>
                          <span className="text-slate-400 font-normal mx-1.5 select-none">|</span>
                          <span className="font-bold text-slate-800">
                            {exp.subtitle || (exp as any).company}
                          </span>
                        </>
                      )}
                      {exp.location && (
                        <span className="text-slate-500 font-normal text-[11px] ml-1.5">
                          ({exp.location})
                        </span>
                      )}
                    </span>
                    {dateStr && (
                      <span
                        className="text-[11.5px] italic font-semibold whitespace-nowrap ml-2"
                        style={{ color: accentColor }}
                      >
                        {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Bullet achievements */}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11.5px] text-slate-600 leading-relaxed">
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

      {/* ========================================================================= */}
      {/* KEY PROJECTS                                                              */}
      {/* ========================================================================= */}
      {projects && projects.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center gap-3 mb-2.5">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: accentColor }}
            >
              KEY PROJECTS
            </h2>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const bullets = getBulletTexts(proj.bulletPoints);
              const dateStr = [proj.startDate, proj.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();
              const techList =
                proj.techStack && proj.techStack.length > 0
                  ? proj.techStack
                  : proj.subtitle
                  ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];

              return (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[12.5px] text-slate-800">
                      <span>{proj.title || (proj as any).name}</span>
                      {techList.length > 0 && (
                        <>
                          <span className="text-slate-400 font-normal mx-1.5 select-none">|</span>
                          <span className="font-normal text-[11px] text-slate-500">
                            {techList.join(", ")}
                          </span>
                        </>
                      )}
                    </span>
                    {dateStr && (
                      <span
                        className="text-[11.5px] italic font-semibold whitespace-nowrap ml-2"
                        style={{ color: accentColor }}
                      >
                        {dateStr}
                      </span>
                    )}
                  </div>

                  {(proj.url || (proj as any).linkUrl) && (
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {proj.url || (proj as any).linkUrl}
                    </div>
                  )}

                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-[11.5px] text-slate-600 leading-relaxed">
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

      {/* ========================================================================= */}
      {/* SKILLS & EXPERTISE                                                        */}
      {/* ========================================================================= */}
      {skillGroups && skillGroups.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center gap-3 mb-2.5">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: accentColor }}
            >
              SKILLS &amp; EXPERTISE
            </h2>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          <div className="space-y-1.5 text-[11.5px]">
            {skillGroups.map((group) => (
              <div key={group.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-bold text-slate-800 min-w-[140px] flex-shrink-0">
                  {group.categoryName}:
                </span>
                <span className="text-slate-600">
                  {group.skills.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM SECTIONS                                                           */}
      {/* ========================================================================= */}
      {customSections.map((sec) => (
        <section key={sec.id} className="mt-5">
          <div className="flex items-center gap-3 mb-2.5">
            <h2
              className="text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: accentColor }}
            >
              {sec.title.toUpperCase()}
            </h2>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          <div className="space-y-3">
            {sec.items.map((item) => {
              const bullets = getBulletTexts(item.bulletPoints);
              const dateStr = [item.startDate, item.isCurrent ? "PRESENT" : item.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();

              return (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-800 text-[12.5px]">
                    <span>{item.title}</span>
                    {dateStr && (
                      <span
                        className="text-[11.5px] italic font-semibold whitespace-nowrap ml-2"
                        style={{ color: accentColor }}
                      >
                        {dateStr}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div className="text-slate-600 text-[11px] italic">
                      {item.subtitle}
                    </div>
                  )}
                  {bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-slate-600 text-[11px] leading-relaxed">
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
