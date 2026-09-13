"use client";

import React, { useState } from "react";
import { FolderGit2, Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { useCV } from "@/lib/store";
import { ProjectItem } from "@/types/cv";
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
  const { cvData, setCVData } = useCV();
  const { projects } = cvData;
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
    const newEntry: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: "",
      role: "",
      techStack: [],
      linkUrl: "",
      startDate: "",
      endDate: "",
      bulletPoints: [""],
    };
    setCVData((prev) => ({
      ...prev,
      projects: [...prev.projects, newEntry],
    }));
    setCollapsedEntries((prev) => ({
      ...prev,
      [newEntry.id]: false,
    }));
  };

  const handleUpdateEntry = (id: string, field: keyof ProjectItem, value: any) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveEntry = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  return (
    <div id="section-projects" className="bg-white p-5 rounded-xl border border-slate-200 mb-5 scroll-mt-24 transition-all">
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${
          isSectionOpen ? "pb-2 border-b border-slate-100 mb-4" : "mb-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isSectionOpen ? "" : "-rotate-90"
            }`}
          />
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
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
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        projects.length === 0 ? (
          <div className="py-7 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-500">
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
                  isCollapsed ? "px-3 py-2 space-y-0" : "p-4 space-y-3"
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
                    <span className="text-xs font-medium text-slate-700 truncate group-hover/title:text-sky-600 transition-colors">
                      {proj.name || `Project #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleEntryCollapse(proj.id)}
                      className={`p-1 rounded hover:bg-white transition-colors ${
                        !isCollapsed ? "text-sky-600" : "text-slate-400 hover:text-slate-700"
                      }`}
                      title={isCollapsed ? "Edit entry" : "Collapse entry"}
                      aria-label={isCollapsed ? "Edit entry" : "Collapse entry"}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
                      title="Remove project entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Project Name <span className="text-red-500 font-semibold">*</span>
                        </label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => handleUpdateEntry(proj.id, "name", e.target.value)}
                          placeholder="e.g. Distributed Task Queue / E-Commerce App"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Technologies Used (comma separated)
                        </label>
                        <input
                          type="text"
                          value={proj.techStack ? proj.techStack.join(", ") : ""}
                          onChange={(e) =>
                            handleUpdateEntry(
                              proj.id,
                              "techStack",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="e.g. React, Node.js, TypeScript, Docker"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Repository / Demo Link</label>
                        <input
                          type="text"
                          value={proj.linkUrl || ""}
                          onChange={(e) => handleUpdateEntry(proj.id, "linkUrl", e.target.value)}
                          placeholder="github.com/username/project"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-colors"
                        />
                      </div>

                      <div className="col-span-2">
                        <DateRangePicker
                          startDate={proj.startDate || ""}
                          endDate={proj.endDate || ""}
                          isCurrent={proj.endDate?.toLowerCase() === "present"}
                          onStartDateChange={(val) => handleUpdateEntry(proj.id, "startDate", val)}
                          onEndDateChange={(val) => handleUpdateEntry(proj.id, "endDate", val)}
                          onIsCurrentChange={(isCurrent) => {
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
                        bullets={proj.bulletPoints || []}
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
