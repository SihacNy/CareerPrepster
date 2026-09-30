"use client";

import React, { useMemo, useState } from "react";
import { FolderGit2, Plus, Trash2, ChevronDown, Pencil, X } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVItem, getSectionItems, getBulletTexts, createBulletPoints } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";
import { DateRangePicker } from "../DateRangePicker";
import { buildValidationMap } from "@/lib/cvValidation";
import {
  FieldError,
  fieldErrorInputClass,
  useReopenErroredEntries,
} from "@/components/editor/FieldError";

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

interface TechStackInputProps {
  technologies: string[];
  onChange: (techs: string[]) => void;
}

function TechStackInput({ technologies, onChange }: TechStackInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTechsFromText = (text: string) => {
    const tokens = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    const currentTechs = [...technologies];
    for (const token of tokens) {
      if (!currentTechs.includes(token)) {
        currentTechs.push(token);
      }
    }
    onChange(currentTechs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTechsFromText(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && inputValue === "" && technologies.length > 0) {
      onChange(technologies.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      addTechsFromText(val);
      setInputValue("");
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTechsFromText(inputValue);
      setInputValue("");
    }
  };

  const handleRemoveTech = (index: number) => {
    onChange(technologies.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] p-1.5 px-2 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 shadow-2xs transition-all">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={
          technologies.length === 0
            ? "e.g. React, Node.js, TypeScript, Docker"
            : "Add tech..."
        }
        className={`${
          technologies.length === 0
            ? "flex-1 min-w-[200px]"
            : "shrink-0 min-w-[100px] w-28 focus:w-52 transition-all"
        } text-sm text-slate-800 bg-transparent px-2 py-1 outline-none placeholder:text-slate-400`}
      />
      {technologies.map((tech, idx) => (
        <span
          key={`${tech}-${idx}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-medium border border-sky-100 hover:bg-sky-100 transition-colors group"
        >
          <span>{tech}</span>
          <button
            type="button"
            onClick={() => handleRemoveTech(idx)}
            className="text-sky-400 hover:text-rose-600 rounded p-0.5 transition-colors focus:outline-none cursor-pointer"
            title={`Remove ${tech}`}
            aria-label={`Remove ${tech}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function ProjectsSection({ onRefineBullet, isOpen, onToggle }: ProjectsSectionProps) {
  const { cvData, updateSectionItems, persistence } = useCV();
  const projects = getSectionItems(cvData, "PROJECTS");
  const sectionIdx = cvData.sections.findIndex((s) => s.sectionType === "PROJECTS");
  const validationMap = useMemo(
    () => buildValidationMap(persistence.validationErrors ?? []),
    [persistence.validationErrors]
  );
  const [internalOpen, setInternalOpen] = useState(true);
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});

  const erroredIds = useMemo(
    () =>
      projects
        .map((proj, index) => ({
          id: proj.id,
          hasError: !!validationMap[`sections.${sectionIdx}.items.${index}.title`],
        }))
        .filter((e) => e.hasError)
        .map((e) => e.id),
    [projects, sectionIdx, validationMap]
  );
  useReopenErroredEntries(erroredIds, persistence.validationRunId, setCollapsedEntries);

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
      if (field === "isCurrent") {
        return {
          ...item,
          isCurrent: value,
          endDate: value ? "Present" : (item.endDate?.toLowerCase() === "present" ? "" : item.endDate),
        };
      }
      if (field === "endDate") {
        return {
          ...item,
          endDate: value,
          isCurrent: value?.toLowerCase() === "present" ? true : (item.endDate?.toLowerCase() === "present" ? false : item.isCurrent),
        };
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
            const projectNameError = validationMap[`sections.${sectionIdx}.items.${index}.title`];
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
                          <FieldError message={projectNameError} inline />
                        </label>
                        <input
                          type="text"
                          value={proj.title || (proj as any).name || ""}
                          onChange={(e) => handleUpdateEntry(proj.id, "name", e.target.value)}
                          data-validate={`sections.${sectionIdx}.items.${index}.title`}
                          placeholder="e.g. Distributed Task Queue / E-Commerce App"
                          className={`w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors ${
                            projectNameError ? fieldErrorInputClass : ""
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                          Technologies Used
                        </label>
                        <TechStackInput
                          technologies={
                            proj.techStack && proj.techStack.length > 0
                              ? proj.techStack
                              : proj.subtitle
                              ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean)
                              : []
                          }
                          onChange={(techs) => handleUpdateEntry(proj.id, "techStack", techs)}
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
                          isCurrent={!!proj.isCurrent || proj.endDate?.toLowerCase() === "present"}
                          onStartDateChange={(val) => handleUpdateEntry(proj.id, "startDate", val)}
                          onEndDateChange={(val) => handleUpdateEntry(proj.id, "endDate", val)}
                          onIsCurrentChange={(isCurrent) => handleUpdateEntry(proj.id, "isCurrent", isCurrent)}
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
