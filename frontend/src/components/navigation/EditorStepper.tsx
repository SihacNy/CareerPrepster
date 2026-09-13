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
    <div className="relative z-20 w-full bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav aria-label="Progress" className="py-2.5 sm:py-3.5">
          <ol className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStage === step.id;
              const isCompleted = currentStage > step.id;

              return (
                <React.Fragment key={step.id}>
                  {index > 0 && (
                    <div
                      className={`flex-1 h-0.5 mx-1.5 sm:mx-4 transition-colors ${
                        currentStage >= step.id ? "bg-sky-600" : "bg-slate-200"
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  <li className="flex items-center flex-shrink-0">
                    <Link
                      href={step.href}
                      className={`flex items-center space-x-1.5 sm:space-x-2.5 text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? "text-sky-700"
                          : isCompleted
                          ? "text-slate-800 hover:text-sky-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          isActive
                            ? "bg-sky-600 text-white shadow-xs"
                            : isCompleted
                            ? "bg-sky-100 text-sky-700 border border-sky-300"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-xs sm:text-sm leading-tight whitespace-nowrap">
                          {step.name}
                        </div>
                        <div className="text-xs text-slate-500 hidden md:block">
                          {step.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
