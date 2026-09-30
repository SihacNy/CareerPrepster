"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine, CheckCircle2, Download, Check } from "lucide-react";

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

  // Track steps that should play their checkmark animation right now
  const [animatingSteps, setAnimatingSteps] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const lastAnimated = sessionStorage.getItem("careerprepster_last_animated_stage");
        if (currentStage === 2 && lastAnimated !== "2") {
          return [1];
        }
        if (currentStage === 3 && lastAnimated !== "3") {
          return [2];
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }
    return [];
  });

  // Track whether the user has exported/downloaded the PDF in stage 3
  const [isStage3Downloaded, setIsStage3Downloaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setIsStage3Downloaded(
          sessionStorage.getItem("careerprepster_pdf_downloaded") === "true"
        );
      }
    } catch {
      // Ignore sessionStorage errors
    }

    const handlePdfDownloaded = () => {
      setIsStage3Downloaded(true);
      // Ensure animation cleanly retriggers if downloaded again
      setAnimatingSteps((prev) => prev.filter((id) => id !== 3));
      setTimeout(() => {
        setAnimatingSteps((prev) => (prev.includes(3) ? prev : [...prev, 3]));
      }, 20);
      const timer = setTimeout(() => {
        setAnimatingSteps((prev) => prev.filter((id) => id !== 3));
      }, 750);
      return () => clearTimeout(timer);
    };

    window.addEventListener("careerprepster:pdf-downloaded", handlePdfDownloaded);
    return () => {
      window.removeEventListener("careerprepster:pdf-downloaded", handlePdfDownloaded);
    };
  }, []);

  useEffect(() => {
    try {
      // Mark current stage as animated
      sessionStorage.setItem("careerprepster_last_animated_stage", currentStage.toString());

      // If user went back to an earlier stage (< 3), reset Stage 3 export state so it can animate again
      if (currentStage < 3) {
        sessionStorage.removeItem("careerprepster_pdf_downloaded");
        setIsStage3Downloaded(false);
      }

      // If user went back to Stage 1, clear last animated stage so Stage 2 and 3 animate again
      if (currentStage === 1) {
        sessionStorage.removeItem("careerprepster_last_animated_stage");
      }

      // If user went back to Stage 2, reset to "2" so moving to Stage 3 will animate Step 2 again
      if (currentStage === 2) {
        sessionStorage.setItem("careerprepster_last_animated_stage", "2");
      }

      const timer = setTimeout(() => {
        setAnimatingSteps((prev) => prev.filter((id) => id !== 1 && id !== 2));
      }, 750);

      return () => clearTimeout(timer);
    } catch {
      // Fallback if sessionStorage is not accessible
    }
  }, [currentStage]);

  return (
    <div className="relative z-20 w-full bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav aria-label="Progress" className="py-2.5 sm:py-3.5">
          <ol className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStage === step.id;
              const isCompleted = currentStage > step.id || (step.id === 3 && isStage3Downloaded);
              const shouldAnimate = animatingSteps.includes(step.id);

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
                        key={`circle-${step.id}-${shouldAnimate ? "anim" : "static"}`}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          isActive || isCompleted
                            ? "bg-sky-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        } ${shouldAnimate ? "animate-checkmark-pop" : ""}`}
                      >
                        {isCompleted ? (
                          <Check
                            key={`check-${step.id}-${shouldAnimate ? "anim" : "static"}`}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] ${
                              shouldAnimate ? "animate-checkmark-draw" : ""
                            }`}
                          />
                        ) : (
                          <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                        )}
                      </span>
                      <div className="text-left">
                        <div
                          className={`font-semibold text-xs sm:text-sm leading-tight whitespace-nowrap ${
                            isActive
                              ? "text-sky-700"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {step.name}
                        </div>
                        <div
                          className={`text-xs hidden md:block ${
                            isActive || isCompleted ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
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
