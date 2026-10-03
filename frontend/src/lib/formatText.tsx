import React from "react";

/**
 * Parses markdown-style bold (**text**), italic (*text*), and strikethrough (~~text~~)
 * into formatted React JSX elements.
 */
export function FormattedText({ text }: { text: string }) {
  if (!text) return null;

  // Regex to match **bold**, *italic*, ~~strikethrough~~, and <u>underline</u>
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|<u>[^<]+<\/u>)/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("<u>") && part.endsWith("</u>")) {
          return (
            <u key={index} className="underline text-slate-900">
              {part.slice(3, -4)}
            </u>
          );
        }
        if (part.startsWith("~~") && part.endsWith("~~")) {
          return (
            <span key={index} className="line-through text-slate-500">
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={index} className="italic text-slate-800">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

/**
 * Normalizes unicode characters (narrow no-break spaces, non-breaking hyphens, etc.)
 * that cause glyph truncation glitches in PDF renderers (e.g. \u202F truncating to '/' 0x2F).
 */
export function sanitizePdfText(text: string): string {
  if (!text) return "";
  return text
    // Replace narrow no-break space (U+202F), non-breaking space (U+00A0), en-quad, em-space, etc. with standard space
    .replace(/[\u202F\u00A0\u2000-\u200A\u2028\u2029]/g, " ")
    // Remove zero-width spaces
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Replace non-breaking hyphen (U+2011) and figure dash (U+2012) with standard hyphen
    .replace(/[\u2010\u2011\u2012]/g, "-");
}

/**
 * Strips formatting tokens for plain text environments like PDF or ATS scanners
 */
export function stripMarkdown(text: string): string {
  if (!text) return "";
  return sanitizePdfText(
    text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/~~([^~]+)~~/g, "$1")
      .replace(/<u>([^<]+)<\/u>/g, "$1")
  );
}


