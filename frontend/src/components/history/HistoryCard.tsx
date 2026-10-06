"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Copy,
  Trash2,
  Check,
  Award,
  Layers,
  Pencil,
  X,
} from "lucide-react";
import { CVHistoryItem } from "@/types/cv";
import { getTemplateById } from "@/types/templates";

interface HistoryCardProps {
  item: CVHistoryItem;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
}

export function HistoryCard({ item, onDuplicate, onDelete, onRename }: HistoryCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync edited title with prop updates
  useEffect(() => {
    setEditedTitle(item.title);
  }, [item.title]);

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  const handleSaveTitle = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== item.title) {
      onRename?.(item.id, trimmed);
    } else {
      setEditedTitle(item.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditing = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setEditedTitle(item.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEditing();
    }
  };

  const handleOpenEditor = () => {
    router.push(`/editor?id=${item.id}`);
  };

  const handleOpenAts = () => {
    router.push(`/editor/ats?id=${item.id}`);
  };

  const handleDuplicate = () => {
    onDuplicate(item.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(item.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const formattedDate = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getStatusBadge = () => {
    switch (item.status) {
      case "exported":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700">
            Exported PDF
          </span>
        );
      case "audited":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700">
            ATS Audited
          </span>
        );
      case "draft":
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-sky-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getStatusBadge()}
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        {/* Resume Title (Editable) */}
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 mb-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => handleSaveTitle()}
              className="text-sm font-semibold text-slate-900 bg-white border border-sky-400 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              maxLength={60}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSaveTitle();
              }}
              className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
              title="Save name"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCancelEditing();
              }}
              className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 group/title mb-1">
            <h3
              onClick={handleStartEditing}
              className="text-base font-semibold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors line-clamp-1 cursor-pointer flex-1"
              title="Click to rename"
            >
              {item.title}
            </h3>
            <button
              type="button"
              onClick={handleStartEditing}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all shrink-0"
              title="Rename resume"
              aria-label="Rename resume"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Candidate & Target Role */}
        <div className="text-xs text-slate-600 mb-2.5 space-y-0.5">
          <p className="font-medium text-slate-800 truncate">
            {item.fullName || "Unnamed Candidate"}
          </p>
          <p className="text-slate-500 truncate">
            Role:{" "}
            <span className="font-medium text-slate-700">
              {item.targetRole && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.targetRole)
                ? item.targetRole
                : "General"}
            </span>
          </p>
        </div>

        {/* Middle ATS Score Display */}
        <div className="my-2.5 py-1.5 px-3 rounded-xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between group-hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Award
              className={`w-3.5 h-3.5 ${
                item.atsScore === undefined
                  ? "text-slate-400"
                  : item.atsScore >= 80
                  ? "text-emerald-600"
                  : item.atsScore >= 50
                  ? "text-amber-500"
                  : "text-rose-500"
              }`}
            />
            <span>ATS Score</span>
          </div>
          {item.atsScore !== undefined ? (
            <span
              className={`text-xs font-bold tracking-tight ${
                item.atsScore >= 80
                  ? "text-emerald-600"
                  : item.atsScore >= 50
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {item.atsScore}/100
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Not Audited
            </span>
          )}
        </div>

        {/* Metadata Specs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium mb-4">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 group-hover:border-slate-300/80 transition-colors">
            <Layers className="w-3 h-3 text-slate-400" />
            {getTemplateById(item.templateId).name}
          </span>
          {item.wordCount ? (
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 group-hover:border-slate-300/80 transition-colors">
              <FileText className="w-3 h-3 text-slate-400" />
              {item.wordCount} words
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Open Editor */}
          <button
            type="button"
            onClick={handleOpenEditor}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors"
          >
            Edit
          </button>

          {/* Open ATS */}
          <button
            type="button"
            onClick={handleOpenAts}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs transition-colors"
            title="Inspect ATS Score & Feedback"
          >
            Audit
          </button>
        </div>

        {/* Secondary Actions (Duplicate & Delete) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Duplicate draft"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              isDeleting
                ? "bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2"
                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            }`}
            title={isDeleting ? "Click again to confirm delete" : "Delete resume draft"}
          >
            {isDeleting ? "Confirm?" : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
