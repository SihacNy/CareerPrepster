"use client";

import React, { useState } from "react";
import { FolderGit2, Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVItem, getSectionItems, getBulletTexts, createBulletPoints } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";
import { DateRangePicker } from "../DateRangePicker";

interface ProjectsSectionProps {
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const PROJECT_SUGGESTIONS = [
  "Architected an asynchronous worker queue in TypeScript processing 10,000+ simulated concurrent jobs per minute.",
  "Constructed dead-letter queueing and exponential backoff retry algorithms to guarantee zero message loss during worker failovers.",
  "Integrated Redis caching layer for high-throughput product catalog, serving 45,000 daily active requests with sub-15ms latency.",
  "Containerized full-stack application with Docker Compose for seamless local developer testing and CI/CD validation.",
  "Engineered end-to-end encrypted user authentication utilizing JWTs, HTTP-only cookies, and bcrypt password hashing.",
  "Designed responsive interactive analytics dashboards utilizing Next.js, Tailwind CSS, and Recharts.",
];

export function ProjectsSection({ onRefineBullet, isOpen, onToggle }: ProjectsSectionProps) {
  const { cvData, updateSectionItems } = useCV();
  const projects = getSectionItems(cvData, "PROJECTS");
  const [internalOpen, setInternalOpen] = useState(true);
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});

  const toggleEntryCollapse = (id: string) => {
    setCollapsedEntries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  const handleAddEntry = () => {
    const newEntry: CVItem = {
      id: `proj-${Date.now()}`,
      title: "",
      subtitle: "",
      techStack: [],
      url: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      orderIndex: projects.length,
      bulletPoints: createBulletPoints([""]),
    };
    updateSectionItems("PROJECTS", [...projects, newEntry]);
    setCollapsedEntries((prev) => ({
      ...prev,
      [newEntry.id]: false,
    }));
  };

  const handleUpdateEntry = (id: string, field: string, value: any) => {
    const updated = projects.map((item) => {
      if (item.id !== id) return item;
      if (field === "name") {
        return { ...item, title: value };
      }
      if (field === "linkUrl") {
        return { ...item, url: value };
      }
      if (field === "techStack") {
        return { ...item, techStack: value, subtitle: Array.isArray(value) ? value.join(", ") : value };
      }
      if (field === "bulletPoints") {
        const bps = typeof value[0] === "string" ? createBulletPoints(value) : value;
        return { ...item, bulletPoints: bps };
      }
      return { ...item, [field]: value };
    });
    updateSectionItems("PROJECTS", updated);
  };

  const handleRemoveEntry = (id: string) => {
    updateSectionItems(
      "PROJECTS",
      projects.filter((item) => item.id !== id)
    );
  };

  return (
    <div id="section-projects" className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 scroll-mt-24 transition-all">
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${
          isSectionOpen ? "pb-2.5 border-b border-slate-100 mb-4" : "mb-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isSectionOpen ? "" : "-rotate-90"
            }`}
          />
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-sky-600" />
            <span>Academic &amp; Capstone Projects</span>
            <span className="text-xs text-slate-400 font-normal">
              ({projects.length})
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddEntry();
              if (!isSectionOpen) toggleSection();
            }}
            title="Add Project"
            aria-label="Add Project"
            className="w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        projects.length === 0 ? (
          <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              No projects added yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
          {projects.map((proj, index) => {
            const isCollapsed = !!collapsedEntries[proj.id];

            return (
              <div
                key={proj.id}
                className={`rounded-xl border border-slate-200 bg-slate-50/50 relative group transition-all ${
                  isCollapsed ? "px-3.5 py-2.5 space-y-0" : "p-5 space-y-4"
                }`}
              >
                {/* Entry Header: Summary title on left, Edit & Trash on right */}
                <div
                  className={`flex items-center justify-between ${
                    !isCollapsed ? "pb-3 border-b border-slate-200/70" : "py-0.5"
                  }`}
                >
                  <div
                    onClick={() => toggleEntryCollapse(proj.id)}
                    className="flex items-center gap-2 cursor-pointer select-none group/title flex-1 min-w-0 pr-2"
                    title={isCollapsed ? "Click to edit" : "Click to collapse"}
                  >
                    <span className="text-sm font-medium text-slate-700 truncate group-hover/title:text-sky-600 transition-colors">
                      {proj.title || (proj as any).name || `Project #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleEntryCollapse(proj.id)}
                      className={`p-1.5 rounded-lg hover:bg-white transition-colors ${
                        !isCollapsed ? "text-sky-600" : "text-slate-400 hover:text-slate-700"
                      }`}
                      title={isCollapsed ? "Edit entry" : "Collapse entry"}
                      aria-label={isCollapsed ? "Edit entry" : "Collapse entry"}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                      title="Remove project entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                          Project Name <span className="text-red-500 font-semibold">*</span>
                        </label>
                        <input
                          type="text"
                          value={proj.title || (proj as any).name || ""}
                          onChange={(e) => handleUpdateEntry(proj.id, "name", e.target.value)}
                          placeholder="e.g. Distributed Task Queue / E-Commerce App"
                          className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                          Technologies Used (comma separated)
                        </label>
                        <input
                          type="text"
                          value={proj.techStack ? proj.techStack.join(", ") : (proj.subtitle || "")}
                          onChange={(e) =>
                            handleUpdateEntry(
                              proj.id,
                              "techStack",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="e.g. React, Node.js, TypeScript, Docker"
                          className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">Repository / Demo Link</label>
                        <input
                          type="text"
                          value={proj.url || (proj as any).linkUrl || ""}
                          onChange={(e) => handleUpdateEntry(proj.id, "linkUrl", e.target.value)}
                          placeholder="github.com/username/project"
                          className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div className="col-span-2">
                        <DateRangePicker
                          startDate={proj.startDate || ""}
                          endDate={proj.endDate || ""}
                          isCurrent={proj.isCurrent || proj.endDate?.toLowerCase() === "present"}
                          onStartDateChange={(val) => handleUpdateEntry(proj.id, "startDate", val)}
                          onEndDateChange={(val) => handleUpdateEntry(proj.id, "endDate", val)}
                          onIsCurrentChange={(isCurrent) => {
                            handleUpdateEntry(proj.id, "isCurrent", isCurrent);
                            handleUpdateEntry(proj.id, "endDate", isCurrent ? "Present" : "");
                          }}
                          currentLabel="Ongoing project"
                        />
                      </div>
                    </div>

                    {/* Bullets with Sora-like Rich Formatting & Refine with AI */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <RichBulletEditor
                        label="Project Contributions & Architectural Highlights"
                        bullets={getBulletTexts(proj.bulletPoints)}
                        suggestions={PROJECT_SUGGESTIONS}
                        onChange={(newBullets) => handleUpdateEntry(proj.id, "bulletPoints", newBullets)}
                        onRefineWithAI={onRefineBullet}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
          </div>
        )
      )}
    </div>
  );
}
