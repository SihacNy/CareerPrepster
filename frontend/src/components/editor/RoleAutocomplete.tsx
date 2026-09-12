"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Briefcase, ChevronDown } from "lucide-react";
import { MOCK_JOB_ROLES } from "@/lib/mockData";
import { useCV } from "@/lib/store";

export function RoleAutocomplete() {
  const { cvData, setTargetRole } = useCV();
  const [query, setQuery] = useState(cvData.targetRole || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredRoles = MOCK_JOB_ROLES.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setQuery(cvData.targetRole || "");
  }, [cvData.targetRole]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRole = (roleName: string) => {
    setQuery(roleName);
    setTargetRole(roleName);
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-slate-200 mb-5 shadow-2xs">
      <div className="relative" ref={containerRef}>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-sky-600" />
          Target Job Title / Career Track
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setTargetRole(e.target.value);
              setIsOpen(true);
            }}
            placeholder="e.g. Software Engineer, Data Analyst, Frontend Developer..."
            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Dropdown list */}
        {isOpen && filteredRoles.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-dropdown max-h-56 overflow-y-auto z-30 py-1">
            {filteredRoles.map((role) => {
              const isSelected = cvData.targetRole === role.name;
              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role.name)}
                  className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-sky-50 ${
                    isSelected ? "bg-sky-50/70 text-sky-800 font-semibold" : "text-slate-700"
                  }`}
                >
                  <span>{role.name}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {role.track}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
