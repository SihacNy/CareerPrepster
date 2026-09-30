"use client";

import { useEffect, useRef } from "react";

// Small inline validation hint rendered directly under a form field — or,
// with `inline`, right next to the field's label.
export function FieldError({ message, inline }: { message?: string; inline?: boolean }) {
  if (!message) return null;
  if (inline) {
    return (
      <span className="ml-1.5 text-[11px] sm:text-xs font-medium text-rose-600">
        {message}
      </span>
    );
  }
  return (
    <p className="mt-1.5 text-[11px] sm:text-xs font-medium text-rose-600">
      {message}
    </p>
  );
}

// Inline style applied to an input while it has a validation error.
export const fieldErrorInputClass =
  "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500";

// Re-opens collapsed entries that still carry validation errors whenever a new
// validate run happens (i.e. when the user hits Continue). Entries stay
// manually collapsible in between; only the act of retrying re-expands them so
// the auto-scroll/focus in CVForm can land on the offending input.
export function useReopenErroredEntries(
  erroredIds: string[],
  validationRunId: number | undefined,
  setCollapsedEntries: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) {
  const lastRunRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (erroredIds.length === 0) return;
    if (validationRunId === undefined || validationRunId === lastRunRef.current) return;
    lastRunRef.current = validationRunId;
    setCollapsedEntries((prev) => {
      const next = { ...prev };
      erroredIds.forEach((id) => (next[id] = false));
      return next;
    });
  }, [validationRunId, erroredIds, setCollapsedEntries]);
}