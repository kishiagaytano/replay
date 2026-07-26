"use client";

import type { ReactNode } from "react";
import { useTaskStore } from "@/lib/store/task-store";

/**
 * Holds page content back until the first data load finishes, so we never flash
 * an empty board. Server + first client render both show the loader (identical
 * output → no hydration mismatch); the real content appears once loaded.
 */
export function ContentGate({ children }: { children: ReactNode }) {
  const { hydrated } = useTaskStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-accent dark:border-slate-700 dark:border-t-accent" />
          <span className="text-sm">Loading tracker…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
