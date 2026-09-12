"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Github, 
  Linkedin, 
  Twitter, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";

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
              Empowering university students and graduates to author high-impact, ATS-optimized CVs that pass screeners and land interviews at top tech companies.
            </p>

            <div className="flex items-center space-x-4 pt-1">
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

          {/* Column 1: Studio & Templates */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              CV Studio
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/editor" className="hover:text-white transition-colors">
                  Author CV Studio
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
                <Link href="/editor" className="hover:text-white transition-colors">
                  Harvard Classic Template
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-white transition-colors">
                  Jake&apos;s Tech Template
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: ATS & AI Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              ATS &amp; Frameworks
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Google XYZ Metric Formula
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  STAR Bullet Method
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Job Description Matcher
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Parsability Auditing
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Brevity &amp; Page Balance
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ &amp; Knowledge Base
                </a>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Harvard Resume Guide
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Student Career Services
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Data &amp; Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Terms of Service
                </span>
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
