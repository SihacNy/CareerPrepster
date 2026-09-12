"use client";

import React from "react";
import Link from "next/link";
import { PenLine, CheckCircle2, Download } from "lucide-react";

interface EditorStepperProps {
  currentStage: 1 | 2 | 3;
}

export function EditorStepper({ currentStage }: EditorStepperProps) {
  const steps = [
    {
      id: 1,
      name: "Author CV",
      href: "/editor",
      icon: PenLine,
      description: "Sections & Templates",
    },
    {
      id: 2,
      name: "ATS Review",
      href: "/editor/ats",
      icon: CheckCircle2,
      description: "4 Pillars & Score",
    },
    {
      id: 3,
      name: "Export PDF",
      href: "/editor/export",
      icon: Download,
      description: "Download Deliverable",
    },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Progress" className="py-3">
          <ol className="flex items-center justify-between sm:justify-center sm:space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStage === step.id;
              const isCompleted = currentStage > step.id;

              return (
                <li key={step.id} className="flex items-center">
                  {index > 0 && (
                    <div
                      className={`hidden sm:block w-12 h-0.5 mr-8 transition-colors ${
                        currentStage >= step.id ? "bg-sky-600" : "bg-slate-200"
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  <Link
                    href={step.href}
                    className={`flex items-center space-x-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "text-sky-700"
                        : isCompleted
                        ? "text-slate-800 hover:text-sky-600"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-sky-600 text-white"
                          : isCompleted
                          ? "bg-sky-100 text-sky-700 border border-sky-300"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="text-left">
                      <div className="font-semibold">{step.name}</div>
                      <div className="text-[10px] text-slate-500 hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
