"use client";

import React from "react";
import { CVData } from "@/types/cv";
import { ClassicAts } from "./templates/ClassicAts";
import { ModernCompact } from "./templates/ModernCompact";
import { ExecutiveAccent } from "./templates/ExecutiveAccent";
import { ModernPhoto } from "./templates/ModernPhoto";

interface CVTemplateRendererProps {
  data: CVData;
}

export function CVTemplateRenderer({ data }: CVTemplateRendererProps) {
  switch (data.templateId) {
    case "executive-accent":
      return <ExecutiveAccent data={data} />;
    case "modern-photo":
      return <ModernPhoto data={data} />;
    case "modern":
      return <ModernCompact data={data} />;
    case "classic":
    default:
      return <ClassicAts data={data} />;
  }
}
