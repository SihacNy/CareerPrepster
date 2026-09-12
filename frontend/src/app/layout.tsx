import type { Metadata } from "next";
import { Kantumruy_Pro, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const kantumruy = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerPrepster - AI Career & CV Editor for Students",
  description:
    "Craft ATS-optimized resumes with university-validated templates, role starter bullets, and STAR/XYZ AI refinement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kantumruy.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
