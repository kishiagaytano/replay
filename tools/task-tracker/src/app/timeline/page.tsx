"use client";

import { useMemo } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import { useNow } from "@/lib/utils/use-now";
import { PageHeader } from "@/components/common/PageHeader";
import { TimelineDay } from "@/components/timeline/TimelineDay";
import { groupTasksByDate } from "@/lib/utils/metrics";
import { isSameDay } from "@/lib/utils/dates";

export default function TimelinePage() {
  const { tasks, dayGoals, getMember } = useTaskStore();
  const now = useNow();

  // Build one entry per date that has either a scheduled task or a stated goal.
  const days = useMemo(() => {
    const tasksByDate = groupTasksByDate(tasks);
    const goalByDate = new Map(dayGoals.map((g) => [g.date, g.goal]));
    const dates = new Set<string>([...tasksByDate.keys(), ...goalByDate.keys()]);

    return [...dates]
      .sort()
      .map((date) => ({
        date,
        goal: goalByDate.get(date),
        tasks: tasksByDate.get(date) ?? [],
      }));
  }, [tasks, dayGoals]);

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="The sprint day by day — each day's goal, its tasks, and progress toward Aug 7."
      />

      <div className="mt-2">
        {days.map((day) => (
          <TimelineDay
            key={day.date}
            date={day.date}
            goal={day.goal}
            tasks={day.tasks}
            getMember={getMember}
            now={now}
            isToday={now ? isSameDay(day.date, now) : false}
          />
        ))}
      </div>
    </div>
  );
}
