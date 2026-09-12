export interface AISuggestion {
  id: string;
  type: "Action-Oriented" | "Quantified Metrics (XYZ)" | "STAR Framework";
  text: string;
  explanation: string;
}

export async function generateMockBulletEnhancements(
  bulletText: string,
  targetRole: string = "Software Engineer"
): Promise<AISuggestion[]> {
  // Simulate network latency (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cleanInput = bulletText.trim() || "Worked on web application development.";

  return [
    {
      id: "sug-1",
      type: "Action-Oriented",
      text: `Spearheaded end-to-end development of ${cleanInput.replace(/^worked on\s+/i, "")}, ensuring high code quality and test coverage.`,
      explanation: "Replaces passive phrasing with active leadership verb 'Spearheaded' and reinforces quality delivery.",
    },
    {
      id: "sug-2",
      type: "Quantified Metrics (XYZ)",
      text: `Engineered feature optimizations for ${cleanInput.replace(/^worked on\s+/i, "")}, improving response throughput by 35% and enhancing client experience.`,
      explanation: "Applies Google's XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].",
    },
    {
      id: "sug-3",
      type: "STAR Framework",
      text: `Identified architectural performance bottlenecks in ${cleanInput.replace(/^worked on\s+/i, "")}; re-architected asynchronous data pipelines, reducing processing duration by 40%.`,
      explanation: "Explicitly details Situation, Task, Action taken, and quantifiable Result.",
    },
  ];
}
