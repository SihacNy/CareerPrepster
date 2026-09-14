"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, BookOpen, Check, Copy, Loader2, Info } from "lucide-react";
import { useCV } from "@/lib/store";
import { jobRoleApi, StarterBullet } from "@/lib/api";

interface TemplateBulletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBullet: (bulletText: string) => void;
}

interface DisplayBullet {
  id: string;
  category: string;
  text: string;
}

export function TemplateBulletDrawer({
  isOpen,
  onClose,
  onInsertBullet,
}: TemplateBulletDrawerProps) {
  const { cvData } = useCV();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bullets, setBullets] = useState<DisplayBullet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadBullets = async () => {
      let roleId = cvData.targetRoleId;

      // If roleId not directly set, attempt lookup by targetRole title
      if (!roleId && cvData.targetRole) {
        try {
          const matchedRoles = await jobRoleApi.search(cvData.targetRole);
          if (matchedRoles && matchedRoles.length > 0) {
            roleId = matchedRoles[0].id;
          }
        } catch {
          // Ignore search error
        }
      }

      if (roleId) {
        setIsLoading(true);
        try {
          const apiBullets = await jobRoleApi.getBullets(roleId);
          if (isMounted && Array.isArray(apiBullets)) {
            setBullets(
              apiBullets.map((b: StarterBullet) => ({
                id: b.id,
                category: b.skillCategory || "Technical Implementation",
                text: b.bulletText,
              }))
            );
            return;
          }
        } catch (err) {
          console.warn("Could not load role bullets from backend API:", err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      if (isMounted) {
        setBullets([]);
      }
    };

    loadBullets();
    return () => {
      isMounted = false;
    };
  }, [isOpen, cvData.targetRoleId, cvData.targetRole]);

  if (!isOpen) return null;

  const categories = [
    "All",
    "Technical Implementation",
    "System Performance",
    "Collaboration & Delivery",
    "Problem Solving",
  ];

  const filteredBullets = bullets.filter((bullet) => {
    if (selectedCategory === "All") return true;
    return bullet.category === selectedCategory;
  });

  const handleInsert = (id: string, text: string) => {
    onInsertBullet(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-card flex flex-col">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Curated Starter Bullets
                </h2>
                <p className="text-[11px] text-slate-500">
                  Target Role: <span className="font-semibold text-slate-700">{cvData.targetRole || "General"}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bullets List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600 mb-2" />
                <span className="text-xs font-medium">Fetching curated role bullets...</span>
              </div>
            ) : filteredBullets.length === 0 ? (
              <div className="text-center py-12 px-6 text-slate-500 text-xs flex flex-col items-center">
                <Info className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">
                  {!cvData.targetRole
                    ? "Target Role Not Selected"
                    : "No Bullets Found"}
                </p>
                <p className="mt-1 text-slate-500 max-w-xs">
                  {!cvData.targetRole
                    ? "Please select or type a target job role in the editor to load pre-curated achievements from the database."
                    : "No starter bullets found in the database catalog for this category."}
                </p>
              </div>
            ) : (
              filteredBullets.map((bullet) => {
              const isAdded = copiedId === bullet.id;
              return (
                <div
                  key={bullet.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all text-left flex flex-col justify-between group"
                >
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase tracking-wider">
                      {bullet.category}
                    </span>
                    <p className="text-sm text-slate-800 mt-2 leading-relaxed">
                      {bullet.text}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleInsert(bullet.id, bullet.text)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                        isAdded
                          ? "bg-sky-600 text-white animate-checkmark-pop shadow-md shadow-sky-500/30"
                          : "bg-white text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 hover:border-sky-600"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <svg
                            className="w-3.5 h-3.5 mr-1.5 text-white animate-checkmark-draw"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added to Active Entry</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          <span>Add to CV</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[11px] text-slate-500">
              Clicking &ldquo;Add to CV&rdquo; appends the bullet point into your active section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
