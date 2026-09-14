"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, CheckSquare, Square, ChevronDown } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onIsCurrentChange?: (isCurrent: boolean) => void;
  startLabel?: string;
  endLabel?: string;
  currentLabel?: string;
  showCurrentCheckbox?: boolean;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Generate years from +6 years in the future down to 35 years in the past
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 42 }, (_, i) => String(currentYear + 6 - i));

function parseDateString(str: string): { month: string; year: string } {
  if (!str) return { month: "", year: "" };
  const trimmed = str.trim();
  if (trimmed.toLowerCase() === "present") {
    return { month: "", year: "" };
  }

  const parts = trimmed.split(/[\s,/-]+/);
  if (parts.length === 2) {
    const matchedMonth = MONTHS.find(
      (m) => m.toLowerCase() === parts[0].toLowerCase() || parts[0].toLowerCase().startsWith(m.toLowerCase())
    );
    const matchedYear = YEARS.find((y) => y === parts[1]);
    if (matchedMonth && matchedYear) {
      return { month: matchedMonth, year: matchedYear };
    }
  }

  if (parts.length === 1 && YEARS.includes(parts[0])) {
    return { month: "", year: parts[0] };
  }

  const matchedMonth = MONTHS.find((m) =>
    parts.some((p) => m.toLowerCase() === p.toLowerCase() || p.toLowerCase().startsWith(m.toLowerCase()))
  );
  const matchedYear = YEARS.find((y) => parts.includes(y));

  return { month: matchedMonth || "", year: matchedYear || "" };
}

interface CustomDropdownProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
}

function CustomDropdown({ value, options, placeholder, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-[42px] flex items-center justify-between text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 outline-none hover:border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-colors"
        aria-expanded={isOpen}
      >
        <span className={value ? "font-medium text-slate-900 truncate" : "text-slate-400 truncate"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-150 ml-1 ${
            isOpen ? "rotate-180 text-sky-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto z-50 py-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          <div
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="px-3.5 py-2 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer italic"
          >
            Clear
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`px-3.5 py-2 text-sm cursor-pointer hover:bg-sky-50 hover:text-sky-700 transition-colors ${
                opt === value ? "bg-sky-50 text-sky-700 font-semibold" : "text-slate-700"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DateRangePicker({
  startDate,
  endDate,
  isCurrent = false,
  onStartDateChange,
  onEndDateChange,
  onIsCurrentChange,
  startLabel = "Start Date",
  endLabel = "End Date",
  currentLabel = "I currently work here",
  showCurrentCheckbox = true,
}: DateRangePickerProps) {
  const parsedStart = parseDateString(startDate);
  const parsedEnd = parseDateString(endDate);

  const handleStartMonthChange = (newMonth: string) => {
    const y = parsedStart.year || String(currentYear);
    onStartDateChange(newMonth ? `${newMonth} ${y}` : y);
  };

  const handleStartYearChange = (newYear: string) => {
    const m = parsedStart.month;
    onStartDateChange(m ? `${m} ${newYear}` : newYear);
  };

  const handleEndMonthChange = (newMonth: string) => {
    const y = parsedEnd.year || String(currentYear);
    onEndDateChange(newMonth ? `${newMonth} ${y}` : y);
  };

  const handleEndYearChange = (newYear: string) => {
    const m = parsedEnd.month;
    onEndDateChange(m ? `${m} ${newYear}` : newYear);
  };

  const handleToggleCurrent = () => {
    if (!onIsCurrentChange) return;
    const nextCurrent = !isCurrent;
    onIsCurrentChange(nextCurrent);
    if (nextCurrent) {
      onEndDateChange("Present");
    } else {
      onEndDateChange(`${MONTHS[new Date().getMonth()]} ${currentYear}`);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date UI */}
        <div className="flex flex-col">
          <label className="text-xs sm:text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{startLabel}</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <CustomDropdown
              value={parsedStart.month}
              options={MONTHS}
              placeholder="Month"
              onChange={handleStartMonthChange}
            />
            <CustomDropdown
              value={parsedStart.year}
              options={YEARS}
              placeholder="Year"
              onChange={handleStartYearChange}
            />
          </div>
        </div>

        {/* End Date UI */}
        <div className="flex flex-col">
          <label className="text-xs sm:text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{endLabel}</span>
          </label>

          {isCurrent ? (
            <div className="w-full h-[42px] text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3.5 flex items-center shadow-2xs">
              <span>Present (Ongoing)</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <CustomDropdown
                value={parsedEnd.month}
                options={MONTHS}
                placeholder="Month"
                onChange={handleEndMonthChange}
              />
              <CustomDropdown
                value={parsedEnd.year}
                options={YEARS}
                placeholder="Year"
                onChange={handleEndYearChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* "I currently work here / Currently enrolled" Checkbox */}
      {showCurrentCheckbox && onIsCurrentChange && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleToggleCurrent}
            className="flex items-center space-x-2 text-xs sm:text-[13px] font-medium text-slate-700 hover:text-slate-900 transition-colors select-none focus:outline-none cursor-pointer"
          >
            {isCurrent ? (
              <CheckSquare className="w-4 h-4 text-sky-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{currentLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
