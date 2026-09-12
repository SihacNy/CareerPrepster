"use client";

import React, { useState } from "react";
import { RoleAutocomplete } from "./RoleAutocomplete";
import { PersonalSection } from "./sections/PersonalSection";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { AIEnhanceModal } from "./AIEnhanceModal";
import { useCV } from "@/lib/store";

export function CVForm() {
  const { cvData } = useCV();

  // State for AI Refine modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeRefineText, setActiveRefineText] = useState("");
  const [activeApplyCallback, setActiveApplyCallback] = useState<((newText: string) => void) | null>(null);

  const handleOpenRefineModal = (text: string, onApply: (newText: string) => void) => {
    setActiveRefineText(text);
    setActiveApplyCallback(() => onApply);
    setAiModalOpen(true);
  };

  const handleApplyRefine = (refinedText: string) => {
    if (activeApplyCallback) {
      activeApplyCallback(refinedText);
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Target Role & Autocomplete */}
      <RoleAutocomplete />

      {/* Form Sections */}
      <PersonalSection />
      <EducationSection onRefineBullet={handleOpenRefineModal} />
      <ExperienceSection onRefineBullet={handleOpenRefineModal} />
      <ProjectsSection onRefineBullet={handleOpenRefineModal} />
      <SkillsSection />

      {/* AI Refine Modal */}
      <AIEnhanceModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        originalText={activeRefineText}
        targetRole={cvData.targetRole}
        onApply={handleApplyRefine}
      />
    </div>
  );
}
