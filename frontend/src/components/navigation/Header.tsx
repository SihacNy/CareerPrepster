"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronDown, Clock, Sparkles, FileText, LayoutGrid, Info, Workflow, LayoutTemplate } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  currentStage?: 1 | 2 | 3;
}

export function Header({ }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isTemplatesActive = pathname?.startsWith("/editor/templates");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setIsFeaturesOpen(false);
      }
    }
    if (isDropdownOpen || isFeaturesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div>
              <span className="font-semibold text-2xl text-slate-900 tracking-tight">
                CareerPrepster
              </span>
            </div>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/editor/templates"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                isTemplatesActive
                  ? "bg-sky-500/10 text-sky-600"
                  : "text-slate-600 hover:text-sky-600 hover:bg-sky-500/10"
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Templates</span>
            </Link>

            <div className="relative" ref={featuresRef}>
              <button
                type="button"
                onClick={() => setIsFeaturesOpen((prev) => !prev)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  isFeaturesOpen
                    ? "bg-sky-500/10 text-sky-600"
                    : "text-slate-600 hover:text-sky-600 hover:bg-sky-500/10"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Features</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isFeaturesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFeaturesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/editor/templates"
                    onClick={() => setIsFeaturesOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      pathname?.startsWith("/editor")
                        ? "bg-sky-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <FileText className={`w-4 h-4 transition-colors ${
                      pathname?.startsWith("/editor")
                        ? "text-sky-600"
                        : "text-slate-400 group-hover:text-sky-600"
                    }`} />
                    <p className={`text-sm font-semibold ${
                      pathname?.startsWith("/editor") ? "text-sky-700" : "text-slate-800"
                    }`}>
                      CV Editor
                    </p>
                  </Link>

                  <Link
                    href="/interview"
                    onClick={() => setIsFeaturesOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      pathname?.startsWith("/interview")
                        ? "bg-sky-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 transition-colors ${
                      pathname?.startsWith("/interview")
                        ? "text-sky-600"
                        : "text-slate-400 group-hover:text-sky-600"
                    }`} />
                    <p className={`text-sm font-semibold ${
                      pathname?.startsWith("/interview") ? "text-sky-700" : "text-slate-800"
                    }`}>
                      Interview Coach
                    </p>
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/#how-it-works"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-500/10 transition-colors"
            >
              <Workflow className="w-4 h-4" />
              <span>How It Works</span>
            </Link>
            <Link
              href="/about"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                pathname === "/about"
                  ? "text-sky-600 bg-sky-500/10"
                  : "text-slate-600 hover:text-sky-600 hover:bg-sky-500/10"
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About Us</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {mounted && user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Profile Header */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold uppercase">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Menu Items */}
                    <div className="py-2 border-b border-slate-100">
                      <Link
                        href="/history"
                        onClick={() => setIsDropdownOpen(false)}
                        className="group flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                        <span>Resume & Audit History</span>
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Popover Modal for Unauthenticated Users */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
