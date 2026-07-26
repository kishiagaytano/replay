"use client";

import { useNow } from "@/lib/utils/use-now";
import { daysUntilDeadline } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

/** Compact countdown shown in the top bar. */
export function DeadlinePill() {
  const now = useNow();
  const days = now ? daysUntilDeadline(now) : null;

  const tone =
    days === null
      ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      : days <= 2
        ? "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/25"
        : days <= 5
          ? "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25"
          : "bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", tone)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {days === null ? "Aug 7 deadline" : days === 0 ? "Due today" : days < 0 ? "Past deadline" : `${days} days to Aug 7`}
    </span>
  );
}
