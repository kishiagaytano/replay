"use client";

import type { Member, Task } from "@/lib/schema/task.schema";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/tasks/TaskBadges";
import { formatShortDate, relativeDueLabel } from "@/lib/utils/dates";

/**
 * Read-only detail view shown when a task is clicked. The whole description is
 * rendered as flowing text (whitespace preserved, wrapping) so long specs are
 * fully readable — no cramped, internally-scrolling textarea. Editing is a
 * deliberate step via the Edit button.
 */
export function TaskDetailDialog({
  open,
  task,
  assignee,
  now,
  onClose,
  onEdit,
}: {
  open: boolean;
  task: Task | null;
  assignee?: Member;
  now: Date | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}) {
  if (!task) return null;

  const blocked = !!task.blocker?.trim() && task.status !== "done";

  return (
    <Modal open={open} onClose={onClose} title={task.title}>
      <div className="space-y-4">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
        </div>

        {/* Assignee + due */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">Assignee</span>
            {assignee ? (
              <span className="flex items-center gap-1.5">
                <Avatar member={assignee} size="sm" />
                <span className="text-slate-700 dark:text-slate-200">{assignee.name}</span>
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">Unassigned</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">Due</span>
            <span className="text-slate-700 dark:text-slate-200">
              {formatShortDate(task.dueDate)}
              {now ? <span className="text-slate-400 dark:text-slate-500"> · {relativeDueLabel(task.dueDate, now)}</span> : null}
            </span>
          </div>
        </div>

        {/* Blocker */}
        {blocked ? (
          <div className="rounded-lg border border-red-100 bg-red-50/60 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-xs font-medium text-red-700 dark:text-red-300">Blocked</p>
            <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{task.blocker}</p>
          </div>
        ) : null}

        {/* Full description — the whole point of this view */}
        <div>
          <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">Description</p>
          {task.description.trim() ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {task.description}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400 dark:text-slate-500">No description.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => onEdit(task)}>
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
