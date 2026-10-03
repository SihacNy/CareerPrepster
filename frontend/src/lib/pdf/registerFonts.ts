"use client";

import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

export function registerPdfFonts() {
  if (fontsRegistered) return;

  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    Font.register({
      family: "Plus Jakarta Sans",
      fonts: [
        {
          src: `${origin}/fonts/PlusJakartaSans-Regular.ttf`,
          fontWeight: 400,
          fontStyle: "normal",
        },
        {
          src: `${origin}/fonts/PlusJakartaSans-Italic.ttf`,
          fontWeight: 400,
          fontStyle: "italic",
        },
        {
          src: `${origin}/fonts/PlusJakartaSans-Medium.ttf`,
          fontWeight: 500,
          fontStyle: "normal",
        },
        {
          src: `${origin}/fonts/PlusJakartaSans-SemiBold.ttf`,
          fontWeight: 600,
          fontStyle: "normal",
        },
        {
          src: `${origin}/fonts/PlusJakartaSans-Bold.ttf`,
          fontWeight: 700,
          fontStyle: "normal",
        },
        {
          src: `${origin}/fonts/PlusJakartaSans-BoldItalic.ttf`,
          fontWeight: 700,
          fontStyle: "italic",
        },
        {
          src: `${origin}/fonts/PlusJakartaSans-ExtraBold.ttf`,
          fontWeight: 800,
          fontStyle: "normal",
        },
      ],
    });

    fontsRegistered = true;
  } catch (err) {
    console.warn("Failed to register Plus Jakarta Sans with @react-pdf/renderer:", err);
  }
}
