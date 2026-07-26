"use client";

import type { Member, TaskCategory, TaskPriority } from "@/lib/schema/task.schema";
import { Select, TextInput } from "@/components/ui/Field";
import { CATEGORY_LIST, PRIORITY_LIST } from "@/lib/utils/constants";

export interface TaskFilters {
  search: string;
  assigneeId: string | "all";
  category: TaskCategory | "all";
  priority: TaskPriority | "all";
}

export const EMPTY_FILTERS: TaskFilters = {
  search: "",
  assigneeId: "all",
  category: "all",
  priority: "all",
};

export function TaskToolbar({
  filters,
  members,
  onChange,
}: {
  filters: TaskFilters;
  members: Member[];
  onChange: (next: TaskFilters) => void;
}) {
  const set = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[16rem]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
        </span>
        <TextInput
          aria-label="Search tasks"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select aria-label="Filter by assignee" value={filters.assigneeId} onChange={(e) => set("assigneeId", e.target.value as TaskFilters["assigneeId"])} className="sm:w-40">
        <option value="all">All assignees</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>

      <Select aria-label="Filter by category" value={filters.category} onChange={(e) => set("category", e.target.value as TaskFilters["category"])} className="sm:w-44">
        <option value="all">All categories</option>
        {CATEGORY_LIST.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </Select>

      <Select aria-label="Filter by priority" value={filters.priority} onChange={(e) => set("priority", e.target.value as TaskFilters["priority"])} className="sm:w-36">
        <option value="all">All priorities</option>
        {PRIORITY_LIST.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** Pure filter predicate, reused by the board. */
export function matchesFilters(
  task: { title: string; description: string; assigneeId: string; category: string; priority: string },
  filters: TaskFilters,
): boolean {
  if (filters.assigneeId !== "all" && task.assigneeId !== filters.assigneeId) return false;
  if (filters.category !== "all" && task.category !== filters.category) return false;
  if (filters.priority !== "all" && task.priority !== filters.priority) return false;
  const q = filters.search.trim().toLowerCase();
  if (q && !(`${task.title} ${task.description}`.toLowerCase().includes(q))) return false;
  return true;
}
