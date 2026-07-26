"use client";

import { useMemo } from "react";
import { useTaskStore } from "@/lib/store/task-store";
import { useNow } from "@/lib/utils/use-now";
import { PageHeader } from "@/components/common/PageHeader";
import { TimelineDay } from "@/components/timeline/TimelineDay";
import { EmptyState } from "@/components/ui/EmptyState";
import { groupTasksByDate } from "@/lib/utils/metrics";
import { isSameDay } from "@/lib/utils/dates";

export default function TimelinePage() {
  const { tasks, getMember } = useTaskStore();
  const now = useNow();

  // One entry per date that has tasks, earliest first.
  const days = useMemo(() => {
    const tasksByDate = groupTasksByDate(tasks);
    return [...tasksByDate.keys()].sort().map((date) => ({
      date,
      tasks: tasksByDate.get(date) ?? [],
    }));
  }, [tasks]);

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="The sprint day by day — each day's tasks and progress, grouped by due date."
      />

      {days.length === 0 ? (
        <EmptyState
          title="No scheduled tasks yet"
          hint="Add tasks with due dates and they'll show up here, grouped by day."
        />
      ) : (
        <div className="mt-2">
          {days.map((day) => (
            <TimelineDay
              key={day.date}
              date={day.date}
              tasks={day.tasks}
              getMember={getMember}
              now={now}
              isToday={now ? isSameDay(day.date, now) : false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
