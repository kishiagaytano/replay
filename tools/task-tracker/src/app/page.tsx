"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTaskStore } from "@/lib/store/task-store";
import { useNow } from "@/lib/utils/use-now";
import { daysUntilDeadline, formatShortDate } from "@/lib/utils/dates";
import { DEADLINE_ISO } from "@/lib/utils/constants";
import {
  blockedTasks,
  computeProgress,
  overdueTasks,
  tasksForToday,
  upcomingDeadlines,
} from "@/lib/utils/metrics";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatTile } from "@/components/dashboard/StatTile";
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown";
import { TaskListCard } from "@/components/dashboard/TaskListCard";

const DASH = "—";

export default function DashboardPage() {
  const { tasks, getMember } = useTaskStore();
  const now = useNow();

  const progress = useMemo(() => computeProgress(tasks), [tasks]);
  const today = useMemo(() => (now ? tasksForToday(tasks, now) : []), [tasks, now]);
  const upcoming = useMemo(() => (now ? upcomingDeadlines(tasks, 3, now) : []), [tasks, now]);
  const blockers = useMemo(() => blockedTasks(tasks), [tasks]);
  const overdue = useMemo(() => (now ? overdueTasks(tasks, now) : []), [tasks, now]);

  const days = now ? daysUntilDeadline(now) : null;
  const onTrack = days !== null && progress.total > 0 ? isOnSchedule(progress.percent, days) : null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="What to do today, who's on it, what's blocked, and whether we'll make Aug 7."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Days to Aug 7"
          value={days === null ? DASH : days < 0 ? "Past" : days}
          hint={`Deadline · ${formatShortDate(DEADLINE_ISO)}`}
          tone={days === null ? "default" : days <= 2 ? "danger" : days <= 5 ? "warn" : "good"}
        />
        <StatTile label="Overall progress" value={`${progress.percent}%`} hint={`${progress.done}/${progress.total} done`} />
        <StatTile
          label="Blocked"
          value={blockers.length}
          hint={blockers.length ? "Needs attention" : "Nothing blocked"}
          tone={blockers.length ? "danger" : "good"}
        />
        <StatTile
          label="On schedule?"
          value={onTrack === null ? DASH : onTrack ? "Yes" : "At risk"}
          hint={onTrack === null ? "" : onTrack ? "Pace looks healthy" : "Behind expected pace"}
          tone={onTrack === null ? "default" : onTrack ? "good" : "warn"}
        />
      </div>

      {/* Progress + today */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Overall progress" subtitle="Across all tracked tasks" />
          <CardBody>
            <StatusBreakdown progress={progress} />
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          <TaskListCard
            title="Today's tasks"
            subtitle="Due today or in progress"
            tasks={today}
            getMember={getMember}
            now={now}
            emptyTitle="Nothing scheduled for today"
            emptyHint="Enjoy the breathing room — or pull a task forward."
            showStatus
          />
        </div>
      </div>

      {/* Blockers + upcoming */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Current blockers"
            subtitle="Active tasks with something in the way"
            action={<span className="text-xs font-medium text-slate-400">{blockers.length}</span>}
          />
          <CardBody className="p-2">
            {blockers.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-400">No blockers right now. 🎉</p>
            ) : (
              <ul className="space-y-2 p-1">
                {blockers.map((task) => {
                  const member = getMember(task.assigneeId);
                  return (
                    <li key={task.id} className="rounded-lg border border-red-100 bg-red-50/60 p-3">
                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      <p className="mt-1 text-xs text-red-700">{task.blocker}</p>
                      <p className="mt-1.5 text-[11px] text-slate-400">{member ? member.name : "Unassigned"}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <TaskListCard
          title="Upcoming deadlines"
          subtitle="Due within the next 3 days"
          tasks={upcoming}
          getMember={getMember}
          now={now}
          emptyTitle="No deadlines in the next 3 days"
          showStatus
        />
      </div>

      {/* Overdue warning (only if any) */}
      {overdue.length > 0 ? (
        <div className="mt-4">
          <TaskListCard
            title="Overdue"
            subtitle="Past due and not finished — reschedule or close out"
            tasks={overdue}
            getMember={getMember}
            now={now}
            emptyTitle=""
            showStatus
          />
        </div>
      ) : null}

      <p className="mt-6 text-center text-xs text-slate-400">
        Managing the plan?{" "}
        <Link href="/tasks" className="font-medium text-accent hover:underline">
          Open the task board →
        </Link>
      </p>
    </div>
  );
}

/**
 * Rough "on schedule" heuristic for the sprint (Jul 26 → Aug 7 ≈ 12 days). We
 * should be ~ (elapsed / total) percent done. If actual progress keeps pace
 * with time elapsed (with a small grace margin), we're on track.
 */
function isOnSchedule(percentDone: number, daysRemaining: number): boolean {
  const TOTAL_DAYS = 12;
  const elapsed = Math.max(0, TOTAL_DAYS - daysRemaining);
  const expectedPercent = (elapsed / TOTAL_DAYS) * 100;
  return percentDone >= expectedPercent - 15; // 15-point grace margin
}
