"use client";

import React from "react";
import { CVProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CVProvider>{children}</CVProvider>;
}
