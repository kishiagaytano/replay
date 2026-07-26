"use client";

import { isSupabaseEnabled } from "@/lib/data/repository-factory";
import { cn } from "@/lib/utils/cn";

/**
 * Tells the team at a glance whether they're on the shared cloud database or
 * just this browser's local storage — so "why didn't my teammate see it?" is
 * never a mystery.
 */
export function ConnectionBadge() {
  const cloud = isSupabaseEnabled;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        cloud
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25"
          : "bg-slate-100 text-slate-500 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-400/20",
      )}
      title={cloud ? "Connected to the shared database" : "Local only — changes stay in this browser"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cloud ? "bg-emerald-500" : "bg-slate-400")} />
      {cloud ? "Shared" : "Local only"}
    </span>
  );
}
