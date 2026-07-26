import type {
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@/lib/schema/task.schema";

/**
 * Presentation metadata for enums. Color values are FULL, STATIC Tailwind class
 * strings so the JIT compiler can see them — never assemble class names from
 * fragments at runtime.
 */

export interface StatusMeta {
  id: TaskStatus;
  label: string;
  /** Badge / column-accent classes. */
  badge: string;
  dot: string;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  todo: {
    id: "todo",
    label: "To Do",
    badge: "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-400/20",
    dot: "bg-slate-400",
  },
  "in-progress": {
    id: "in-progress",
    label: "In Progress",
    badge: "bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/25",
    dot: "bg-blue-500",
  },
  review: {
    id: "review",
    label: "Review",
    badge: "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
    dot: "bg-amber-500",
  },
  done: {
    id: "done",
    label: "Done",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25",
    dot: "bg-emerald-500",
  },
};

/** Left-to-right order for the board columns and status pipeline. */
export const STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "review", "done"];

export interface PriorityMeta {
  id: TaskPriority;
  label: string;
  badge: string;
  /** Left border accent for cards. */
  accent: string;
  weight: number;
}

export const PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  high: {
    id: "high",
    label: "High",
    badge: "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/25",
    accent: "border-l-red-500",
    weight: 3,
  },
  medium: {
    id: "medium",
    label: "Medium",
    badge: "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
    accent: "border-l-amber-400",
    weight: 2,
  },
  low: {
    id: "low",
    label: "Low",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-400/20",
    accent: "border-l-slate-300 dark:border-l-slate-600",
    weight: 1,
  },
};

export interface CategoryMeta {
  id: TaskCategory;
  label: string;
  badge: string;
}

export const CATEGORY_META: Record<TaskCategory, CategoryMeta> = {
  research: {
    id: "research",
    label: "Research",
    badge: "bg-cyan-100 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-400/25",
  },
  proposal: {
    id: "proposal",
    label: "Proposal",
    badge: "bg-violet-100 text-violet-700 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/25",
  },
  design: {
    id: "design",
    label: "Design",
    badge: "bg-pink-100 text-pink-700 ring-pink-600/20 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-400/25",
  },
  frontend: {
    id: "frontend",
    label: "Frontend",
    badge: "bg-indigo-100 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/25",
  },
  backend: {
    id: "backend",
    label: "Backend",
    badge: "bg-sky-100 text-sky-700 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25",
  },
  "historical-cases": {
    id: "historical-cases",
    label: "Historical Cases",
    badge: "bg-teal-100 text-teal-700 ring-teal-600/20 dark:bg-teal-500/15 dark:text-teal-300 dark:ring-teal-400/25",
  },
  testing: {
    id: "testing",
    label: "Testing",
    badge: "bg-orange-100 text-orange-700 ring-orange-600/20 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/25",
  },
  "pitch-video": {
    id: "pitch-video",
    label: "Pitch Video",
    badge: "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-600/20 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:ring-fuchsia-400/25",
  },
};

/** Ordered lists for select inputs / filter chips. */
export const STATUS_LIST = STATUS_ORDER.map((s) => STATUS_META[s]);
export const PRIORITY_LIST = (["high", "medium", "low"] as const).map((p) => PRIORITY_META[p]);
export const CATEGORY_LIST = (
  [
    "research",
    "proposal",
    "design",
    "frontend",
    "backend",
    "historical-cases",
    "testing",
    "pitch-video",
  ] as const
).map((c) => CATEGORY_META[c]);

/** The immovable hackathon deadline. */
export const DEADLINE_ISO = "2026-08-07";
