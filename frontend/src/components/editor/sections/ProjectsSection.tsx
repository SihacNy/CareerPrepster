"use client";

import React, { useState } from "react";
import { FolderGit2, Plus, Trash2, ChevronDown } from "lucide-react";
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

  const handleAddBullet = (projId: string) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === projId
          ? { ...item, bulletPoints: [...item.bulletPoints, ""] }
          : item
      ),
    }));
  };

  const handleUpdateBullet = (projId: string, bulletIdx: number, val: string) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === projId
          ? {
              ...item,
              bulletPoints: item.bulletPoints.map((bp, i) =>
                i === bulletIdx ? val : bp
              ),
            }
          : item
      ),
    }));
  };

  const handleRemoveBullet = (projId: string, bulletIdx: number) => {
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === projId
          ? {
              ...item,
              bulletPoints: item.bulletPoints.filter((_, i) => i !== bulletIdx),
            }
          : item
      ),
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
        <div className="space-y-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
          >
            <button
              type="button"
              onClick={() => handleRemoveEntry(proj.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-white transition-colors"
              title="Remove project entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project Name <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => handleUpdateEntry(proj.id, "name", e.target.value)}
                  placeholder="e.g. Distributed Task Queue / E-Commerce App"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Repository / Demo Link</label>
                <input
                  type="text"
                  value={proj.linkUrl || ""}
                  onChange={(e) => handleUpdateEntry(proj.id, "linkUrl", e.target.value)}
                  placeholder="github.com/username/project"
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-sky-500"
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
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
