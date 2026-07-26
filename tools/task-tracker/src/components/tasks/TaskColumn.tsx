"use client";

import { useState, type DragEvent } from "react";
import type { Member, Task, TaskStatus } from "@/lib/schema/task.schema";
import { TaskCard } from "@/components/tasks/TaskCard";
import { STATUS_META } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

/** A single board column that accepts dropped cards to change their status. */
export function TaskColumn({
  status,
  tasks,
  now,
  getMember,
  onEdit,
  onStatusChange,
}: {
  status: TaskStatus;
  tasks: Task[];
  now: Date | null;
  getMember: (id: string) => Member | undefined;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const meta = STATUS_META[status];

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onStatusChange(id, status);
  };

  return (
    <div className="flex min-w-[15rem] flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
        <h3 className="text-sm font-semibold text-slate-700">{meta.label}</h3>
        <span className="rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        className={cn(
          "scroll-thin flex min-h-[8rem] flex-1 flex-col gap-2 rounded-xl border p-2 transition-colors",
          isOver ? "border-accent bg-indigo-50/50" : "border-slate-200 bg-slate-50/60",
        )}
      >
        {tasks.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">Drop tasks here</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={getMember(task.assigneeId)}
              now={now}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              draggable
            />
          ))
        )}
      </div>
    </div>
  );
}
