"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CVProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "315289138109-sq41e07a4a9ts4c5513gi99godekgoa7.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CVProvider>{children}</CVProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
