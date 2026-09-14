"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Briefcase, ChevronDown, Loader2 } from "lucide-react";
import { useCV } from "@/lib/store";
import { jobRoleApi } from "@/lib/api";

export function RoleAutocomplete({
  isOpen,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
} = {}) {
  const { cvData, setTargetRole } = useCV();
  const [query, setQuery] = useState(cvData.targetRole || "");
  const [isOpenAutocomplete, setIsOpenAutocomplete] = useState(false);
  const [internalOpen, setInternalOpen] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rolesCatalog, setRolesCatalog] = useState<Array<{ id: string; name: string; category?: string }>>([]);
  const isSectionOpen = isOpen !== undefined ? isOpen : internalOpen;
  const toggleSection = onToggle || (() => setInternalOpen(!internalOpen));

  // Fetch roles exclusively from backend API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRoles(true);

    jobRoleApi
      .search()
      .then((roles) => {
        if (isMounted && Array.isArray(roles)) {
          setRolesCatalog(
            roles.map((r) => ({
              id: r.id,
              name: r.title,
              category: r.industry || "General",
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Could not load roles catalog from backend:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRoles(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRoles = rolesCatalog.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setQuery(cvData.targetRole || "");
  }, [cvData.targetRole]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpenAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRole = (role: { id?: string; name: string }) => {
    setQuery(role.name);
    setTargetRole(role.name, role.id);
    setIsOpenAutocomplete(false);
  };

  return (
    <div id="section-role" className="w-full bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-2xs scroll-mt-24 transition-all">
      <div
        onClick={toggleSection}
        className={`flex items-center justify-between cursor-pointer select-none ${isSectionOpen ? "mb-2.5" : "mb-0"}`}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSectionOpen ? "" : "-rotate-90"
              }`}
          />
          <label className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2 cursor-pointer">
            <Briefcase className="w-4 h-4 text-sky-600" />
            Target Job Title / Career Track
          </label>
        </div>

        {!isSectionOpen && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 truncate max-w-[220px]">
            {query || "Not specified"}
          </span>
        )}
      </div>

      {isSectionOpen && (
        <div className="relative mt-2" ref={containerRef}>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onFocus={() => setIsOpenAutocomplete(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setTargetRole(e.target.value);
                setIsOpenAutocomplete(true);
              }}
              placeholder="e.g. Software Engineer, Data Analyst, Frontend Developer..."
              className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors shadow-2xs"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Dropdown list */}
          {isOpenAutocomplete && filteredRoles.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-dropdown max-h-56 overflow-y-auto z-30 py-1.5">
              {filteredRoles.map((role) => {
                const isSelected = cvData.targetRole === role.name;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`px-3.5 py-2.5 text-xs sm:text-sm cursor-pointer flex items-center justify-between hover:bg-sky-50 ${isSelected ? "bg-sky-50/70 text-sky-800 font-semibold" : "text-slate-700"
                      }`}
                  >
                    <span>{role.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {(role as any).category || (role as any).track || "General"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
