"use client";

import React from "react";
import { FolderGit2, Plus, Trash2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { ProjectItem } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";

interface ProjectsSectionProps {
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
}

const PROJECT_SUGGESTIONS = [
  "Architected an asynchronous worker queue in TypeScript processing 10,000+ simulated concurrent jobs per minute.",
  "Constructed dead-letter queueing and exponential backoff retry algorithms to guarantee zero message loss during worker failovers.",
  "Integrated Redis caching layer for high-throughput product catalog, serving 45,000 daily active requests with sub-15ms latency.",
  "Containerized full-stack application with Docker Compose for seamless local developer testing and CI/CD validation.",
  "Engineered end-to-end encrypted user authentication utilizing JWTs, HTTP-only cookies, and bcrypt password hashing.",
  "Designed responsive interactive analytics dashboards utilizing Next.js, Tailwind CSS, and Recharts.",
];

export function ProjectsSection({ onRefineBullet }: ProjectsSectionProps) {
  const { cvData, setCVData } = useCV();
  const { projects } = cvData;

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
    <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <FolderGit2 className="w-4 h-4 text-sky-600" />
          Academic &amp; Capstone Projects
        </h3>
        <button
          type="button"
          onClick={handleAddEntry}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Project
        </button>
      </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => handleUpdateEntry(proj.id, "name", e.target.value)}
                  placeholder="e.g. Distributed Task Queue / E-Commerce App"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
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
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Repository / Demo Link</label>
                <input
                  type="text"
                  value={proj.linkUrl || ""}
                  onChange={(e) => handleUpdateEntry(proj.id, "linkUrl", e.target.value)}
                  placeholder="github.com/username/project"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={proj.startDate || ""}
                    onChange={(e) => handleUpdateEntry(proj.id, "startDate", e.target.value)}
                    placeholder="Jan 2025"
                    className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    value={proj.endDate || ""}
                    onChange={(e) => handleUpdateEntry(proj.id, "endDate", e.target.value)}
                    placeholder="May 2025"
                    className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
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
    </div>
  );
}
