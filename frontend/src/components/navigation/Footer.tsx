"use client";

import React from "react";
import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs relative overflow-hidden">
      {/* Top Footer Links & Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission Column (Span 2 on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <span className="font-bold text-xl text-white tracking-tight group-hover:text-sky-400 transition-colors">
                CareerPrepster
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering university students and graduates to author high-impact, ATS-optimized CVs and practice technical &amp; behavioral interviews with AI.
            </p>

            {/* Social Links (links to be provided) */}
            <div className="flex items-center space-x-3 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CareerPrepster on GitHub"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 hover:text-white flex items-center justify-center transition-colors text-slate-400"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CareerPrepster on LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 hover:text-white flex items-center justify-center transition-colors text-slate-400"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CareerPrepster on Twitter"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 hover:text-white flex items-center justify-center transition-colors text-slate-400"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: CV Studio */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              CV Studio
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/editor/templates" className="hover:text-white transition-colors">
                  Choose a Template
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-white transition-colors">
                  Interactive CV Editor
                </Link>
              </li>
              <li>
                <Link href="/editor/ats" className="hover:text-white transition-colors">
                  4-Pillar ATS Diagnostic
                </Link>
              </li>
              <li>
                <Link href="/editor/export" className="hover:text-white transition-colors">
                  Vector PDF Export
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white transition-colors">
                  Resume &amp; Audit History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: AI Interview Coach */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              AI Interview Coach
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/interview" className="hover:text-white transition-colors">
                  Mock Interview Studio
                </Link>
              </li>
              <li>
                <Link href="/interview" className="hover:text-white transition-colors">
                  STAR Method Practice
                </Link>
              </li>
              <li>
                <Link href="/interview" className="hover:text-white transition-colors">
                  Real-time Audio Feedback
                </Link>
              </li>
              <li>
                <Link href="/interview" className="hover:text-white transition-colors">
                  Performance Scorecards
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About & Explore */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              About &amp; Explore
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Team &amp; Mission
                </Link>
              </li>
              <li>
                <Link href="/about#team" className="hover:text-white transition-colors">
                  Meet the Builders
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear} CareerPrepster. Built with care for university students.
          </p>
        </div>
      </div>
    </footer>
  );
}
