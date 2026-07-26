"use client";

import type { DragEvent } from "react";
import type { Member, Task, TaskStatus } from "@/lib/schema/task.schema";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge, PriorityBadge } from "@/components/tasks/TaskBadges";
import { PRIORITY_META, STATUS_LIST } from "@/lib/utils/constants";
import { isOverdue, relativeDueLabel } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

/**
 * A task card. Two ways to change status, on purpose:
 *  - drag-and-drop (desktop pointer enhancement), and
 *  - a native <select> (keyboard + touch accessible fallback, CLAUDE.md §8).
 */
export function TaskCard({
  task,
  assignee,
  now,
  onOpen,
  onStatusChange,
  draggable = false,
}: {
  task: Task;
  assignee?: Member;
  now: Date | null;
  onOpen?: (task: Task) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  draggable?: boolean;
}) {
  const overdue = now ? isOverdue(task.dueDate, now) && task.status !== "done" : false;
  const blocked = !!task.blocker?.trim() && task.status !== "done";

  const handleDragStart = (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <article
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      className={cn(
        "group rounded-lg border border-slate-200 border-l-[3px] bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
        PRIORITY_META[task.priority].accent,
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onOpen?.(task)}
          className="text-left text-sm font-medium leading-snug text-slate-900 hover:text-accent dark:text-slate-100 dark:hover:text-indigo-400"
        >
          {task.title}
        </button>
      </div>

      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
      ) : null}

      {blocked ? (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <span aria-hidden>⚠</span>
          <span className="line-clamp-2">{task.blocker}</span>
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <CategoryBadge category={task.category} />
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {assignee ? <Avatar member={assignee} size="sm" /> : null}
          <span
            className={cn(
              "text-[11px]",
              overdue ? "font-medium text-red-600 dark:text-red-400" : "text-slate-400 dark:text-slate-500",
            )}
          >
            {now ? relativeDueLabel(task.dueDate, now) : ""}
          </span>
        </div>

        {onStatusChange ? (
          <label className="sr-only" htmlFor={`status-${task.id}`}>
            Change status for {task.title}
          </label>
        ) : null}
        {onStatusChange ? (
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {STATUS_LIST.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </article>
  );
}
