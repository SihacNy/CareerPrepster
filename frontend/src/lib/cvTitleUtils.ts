/**
 * Utility functions for CV title duplication, renaming, and uniqueness.
 */

/**
 * Extracts the root base title by stripping trailing copies or number suffixes.
 * Examples:
 *   "Untitled Resume" -> "Untitled Resume"
 *   "Untitled Resume (Copy)" -> "Untitled Resume"
 *   "Untitled Resume - copy" -> "Untitled Resume"
 *   "Untitled Resume (1)" -> "Untitled Resume"
 *   "Untitled Resume (42)" -> "Untitled Resume"
 */
export function getRootTitle(title: string): string {
  if (!title) return "Untitled Resume";
  const trimmed = title.trim();
  const root = trimmed
    .replace(/\s*\(copy\)$/i, "")
    .replace(/\s*-\s*copy$/i, "")
    .replace(/\s*\(\d+\)$/, "")
    .trim();
  return root || "Untitled Resume";
}

/**
 * Generates the next numbered title for a duplicate resume.
 * Instead of "- copy" or "(Copy)", if "Untitled Resume" exists,
 * the next copy is "Untitled Resume (1)", then "(2)", etc.
 */
export function generateDuplicateTitle(baseTitle: string, existingTitles: string[]): string {
  const root = getRootTitle(baseTitle);
  const existingSet = new Set(existingTitles.map((t) => t.trim().toLowerCase()));

  // Start with (1), increment until an unused slot is found
  let counter = 1;
  while (existingSet.has(`${root} (${counter})`.toLowerCase())) {
    counter++;
  }

  return `${root} (${counter})`;
}

/**
 * Ensures a title is unique when the user renames or creates a CV.
 * If the chosen title already exists among OTHER CVs, append the next (1), (2), etc.
 */
export function ensureUniqueTitle(targetTitle: string, otherTitles: string[]): string {
  const clean = targetTitle.trim() || "Untitled Resume";
  const existingSet = new Set(otherTitles.map((t) => t.trim().toLowerCase()));

  // If the target title does NOT collide with any other CV, use it directly
  if (!existingSet.has(clean.toLowerCase())) {
    return clean;
  }

  // It collides with an existing title! Generate next available (1), (2), etc.
  return generateDuplicateTitle(clean, otherTitles);
}
