"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, LogIn } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

interface HeaderProps {
  currentStage?: 1 | 2 | 3;
}

export function Header({ currentStage = 1 }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Auth Popover Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
