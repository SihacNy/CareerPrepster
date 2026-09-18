"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Copy,
  Trash2,
  Check,
  Award,
  Layers,
} from "lucide-react";
import { CVHistoryItem } from "@/types/cv";

interface HistoryCardProps {
  item: CVHistoryItem;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryCard({ item, onDuplicate, onDelete }: HistoryCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 80) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Award className="w-3 h-3 text-emerald-600" />
          <span>ATS: {score}/100</span>
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Award className="w-3 h-3 text-amber-600" />
          <span>ATS: {score}/100</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <Award className="w-3 h-3 text-rose-600" />
        <span>ATS: {score}/100</span>
      </span>
    );
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case "exported":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Exported PDF
          </span>
        );
      case "audited":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            ATS Audited
          </span>
        );
      case "draft":
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
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
            {getScoreBadge(item.atsScore)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        {/* Resume Title */}
        <h3 className="text-base font-semibold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors line-clamp-1 mb-1">
          {item.title}
        </h3>

        {/* Candidate & Target Role */}
        <div className="text-xs text-slate-600 mb-3 space-y-0.5">
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

        {/* Metadata Specs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium mb-4">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 group-hover:border-slate-300/80 transition-colors">
            <Layers className="w-3 h-3 text-slate-400" />
            {item.templateId === "modern" ? "Jake's Tech" : "Harvard Classic"}
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
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 shadow-2xs transition-colors"
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
