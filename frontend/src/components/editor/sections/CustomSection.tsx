"use client";

import React, { useState } from "react";
import { Layers, Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { useCV } from "@/lib/store";
import { CVSection, CVItem, getBulletTexts, createBulletPoints } from "@/types/cv";
import { RichBulletEditor } from "../RichBulletEditor";
import { DateRangePicker } from "../DateRangePicker";

interface CustomSectionProps {
  section: CVSection;
  onRefineBullet: (bulletText: string, onApply: (newText: string) => void) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CustomSection({
  section,
  onRefineBullet,
  isOpen,
  onToggle,
}: CustomSectionProps) {
  const { updateSectionItems, updateSectionTitle, removeSection } = useCV();
  const [internalOpen, setInternalOpen] = useState(true);
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  const items = section.items || [];

  const toggleEntryCollapse = (id: string) => {
    setCollapsedEntries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddEntry = () => {
    const newEntry: CVItem = {
      id: `item-${Date.now()}`,
      title: "",
      subtitle: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      orderIndex: items.length,
      bulletPoints: createBulletPoints([""]),
    };
    updateSectionItems(section.id, [...items, newEntry]);
    setCollapsedEntries((prev) => ({ ...prev, [newEntry.id]: false }));
  };

  const handleUpdateEntry = (id: string, field: string, value: any) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      if (field === "bulletPoints") {
        const bps = typeof value[0] === "string" ? createBulletPoints(value) : value;
        return { ...item, bulletPoints: bps };
      }
      return { ...item, [field]: value };
    });
    updateSectionItems(section.id, updated);
  };

  const handleRemoveEntry = (id: string) => {
    updateSectionItems(
      section.id,
      items.filter((item) => item.id !== id)
    );
  };

  return (
    <div
      id={`section-${section.id}`}
      className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 scroll-mt-24 transition-all"
    >
      {/* Section Header */}
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${
          isSectionOpen ? "pb-2.5 border-b border-slate-100 mb-4" : "mb-0"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
              isSectionOpen ? "" : "-rotate-90"
            }`}
          />
          <Layers className="w-4 h-4 text-sky-600 flex-shrink-0" />
          {isEditingTitle ? (
            <input
              type="text"
              value={section.title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              autoFocus
              className="text-sm sm:text-base font-semibold text-slate-800 bg-white border border-sky-400 rounded-md px-2 py-0.5 outline-none"
            />
          ) : (
            <div
              className="flex items-center gap-1.5 truncate group/title"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              title="Click to rename section"
            >
              <span className="text-sm sm:text-base font-semibold text-slate-800">
                {section.title || "Custom Section"}
              </span>
              <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-sky-600 transition-colors" />
              <span className="text-xs text-slate-400 font-normal">
                ({items.length})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddEntry();
              if (!isSectionOpen) toggleSection();
            }}
            title="Add Item"
            aria-label="Add Item"
            className="w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove the "${section.title}" section?`)) {
                removeSection(section.id);
              }
            }}
            title="Delete Section"
            aria-label="Delete Section"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSectionOpen && (
        items.length === 0 ? (
          <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              No items in this section yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => {
              const isCollapsed = !!collapsedEntries[item.id];

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border border-slate-200 bg-slate-50/50 relative group transition-all ${
                    isCollapsed ? "px-3.5 py-2.5 space-y-0" : "p-5 space-y-4"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between ${
                      !isCollapsed ? "pb-3 border-b border-slate-200/70" : "py-0.5"
                    }`}
                  >
                    <div
                      onClick={() => toggleEntryCollapse(item.id)}
                      className="flex items-center gap-2 cursor-pointer select-none group/title flex-1 min-w-0 pr-2"
                      title={isCollapsed ? "Click to edit" : "Click to collapse"}
                    >
                      <span className="text-sm font-medium text-slate-700 truncate group-hover/title:text-sky-600 transition-colors">
                        {item.title || `Entry #${index + 1}`}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs text-slate-400 truncate">
                          • {item.subtitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleEntryCollapse(item.id)}
                        className={`p-1.5 rounded-lg hover:bg-white transition-colors ${
                          !isCollapsed ? "text-sky-600" : "text-slate-400 hover:text-slate-700"
                        }`}
                        title={isCollapsed ? "Edit entry" : "Collapse entry"}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                        title="Remove entry"
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
                            Title / Position / Award
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateEntry(item.id, "title", e.target.value)}
                            placeholder="e.g. First Place / Volunteer Coordinator"
                            className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                            Organization / Issuer / Subtitle
                          </label>
                          <input
                            type="text"
                            value={item.subtitle || ""}
                            onChange={(e) => handleUpdateEntry(item.id, "subtitle", e.target.value)}
                            placeholder="e.g. IEEE / Red Cross"
                            className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-2">
                            Location / Link (Optional)
                          </label>
                          <input
                            type="text"
                            value={item.location || item.url || ""}
                            onChange={(e) => {
                              handleUpdateEntry(item.id, "location", e.target.value);
                              handleUpdateEntry(item.id, "url", e.target.value);
                            }}
                            placeholder="e.g. Remote or https://credential.net/..."
                            className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                          <DateRangePicker
                            startDate={item.startDate || ""}
                            endDate={item.endDate || ""}
                            isCurrent={item.isCurrent || item.endDate?.toLowerCase() === "present"}
                            onStartDateChange={(val) => handleUpdateEntry(item.id, "startDate", val)}
                            onEndDateChange={(val) => handleUpdateEntry(item.id, "endDate", val)}
                            onIsCurrentChange={(isCurrent) => {
                              handleUpdateEntry(item.id, "isCurrent", isCurrent);
                              handleUpdateEntry(item.id, "endDate", isCurrent ? "Present" : "");
                            }}
                            currentLabel="Ongoing / Present"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80">
                        <RichBulletEditor
                          label="Description / Key Highlights"
                          bullets={getBulletTexts(item.bulletPoints)}
                          onChange={(newBullets) => handleUpdateEntry(item.id, "bulletPoints", newBullets)}
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
