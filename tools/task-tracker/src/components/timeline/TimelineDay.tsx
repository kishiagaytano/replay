import type { Member, Task } from "@/lib/schema/task.schema";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskRow } from "@/components/tasks/TaskRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { computeProgress } from "@/lib/utils/metrics";
import { formatShortDate, relativeDueLabel } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

/** One day in the timeline: date, goal, its tasks, and that day's progress. */
export function TimelineDay({
  date,
  goal,
  tasks,
  getMember,
  now,
  isToday,
}: {
  date: string;
  goal?: string;
  tasks: Task[];
  getMember: (id: string) => Member | undefined;
  now: Date | null;
  isToday: boolean;
}) {
  const progress = computeProgress(tasks);

  return (
    <div className="relative pl-8">
      {/* Timeline rail + node */}
      <span className="absolute left-[7px] top-2 h-full w-px bg-slate-200" aria-hidden />
      <span
        className={cn(
          "absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full ring-4 ring-slate-50",
          isToday ? "bg-accent" : progress.percent === 100 && tasks.length > 0 ? "bg-emerald-500" : "bg-slate-300",
        )}
        aria-hidden
      />

      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2 className="text-sm font-semibold text-slate-900">{formatShortDate(date)}</h2>
        {now ? <span className="text-xs text-slate-400">· {relativeDueLabel(date, now)}</span> : null}
        {isToday ? (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">TODAY</span>
        ) : null}
      </div>

      <Card className={cn("mb-6", isToday && "ring-1 ring-accent/30")}>
        <CardBody className="space-y-3">
          {goal ? (
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">Goal:</span> {goal}
            </p>
          ) : null}

          {tasks.length > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <ProgressBar percent={progress.percent} label={`Progress for ${date}`} />
                <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <ul className="divide-y divide-slate-50">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <TaskRow task={task} assignee={getMember(task.assigneeId)} now={now} showStatus />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState title="No tasks scheduled" hint="A planning / buffer day." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
