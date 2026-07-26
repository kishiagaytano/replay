import type { Member, Task } from "@/lib/schema/task.schema";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/tasks/TaskBadges";
import { isOverdue, relativeDueLabel } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

/** Compact, display-only task line for lists (dashboard, timeline). */
export function TaskRow({
  task,
  assignee,
  now,
  showStatus = false,
}: {
  task: Task;
  assignee?: Member;
  now: Date | null;
  showStatus?: boolean;
}) {
  const overdue = now ? isOverdue(task.dueDate, now) && task.status !== "done" : false;

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
      {assignee ? <Avatar member={assignee} size="sm" /> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={task.category} />
          <PriorityBadge priority={task.priority} />
          {showStatus ? <StatusBadge status={task.status} /> : null}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-xs",
          overdue ? "font-medium text-red-600 dark:text-red-400" : "text-slate-400 dark:text-slate-500",
        )}
      >
        {now ? relativeDueLabel(task.dueDate, now) : ""}
      </span>
    </div>
  );
}
