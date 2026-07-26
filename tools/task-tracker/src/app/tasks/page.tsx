"use client";

import { useMemo, useState } from "react";
import type { Task, TaskDraft, TaskStatus } from "@/lib/schema/task.schema";
import { useTaskStore } from "@/lib/store/task-store";
import { useNow } from "@/lib/utils/use-now";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { EMPTY_FILTERS, TaskToolbar, matchesFilters, type TaskFilters } from "@/components/tasks/TaskToolbar";
import { STATUS_ORDER } from "@/lib/utils/constants";
import { byUrgency } from "@/lib/utils/metrics";

export default function TasksPage() {
  const { tasks, members, getMember, addTask, updateTask, moveTask, deleteTask } = useTaskStore();
  const now = useNow();

  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const filtered = useMemo(
    () => tasks.filter((t) => matchesFilters(t, filters)).sort(byUrgency),
    [tasks, filters],
  );

  const columns = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], "in-progress": [], review: [], done: [] };
    for (const task of filtered) map[task.status].push(task);
    return map;
  }, [filtered]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };
  const handleSubmit = (id: string | null, draft: TaskDraft) => {
    if (id) updateTask(id, draft);
    else addTask(draft);
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Drag a card between columns to change its status, or use the status menu on each card."
        action={
          <Button variant="primary" onClick={openCreate}>
            <span aria-hidden>+</span> New task
          </Button>
        }
      />

      <TaskToolbar filters={filters} members={members} onChange={setFilters} />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUS_ORDER.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={columns[status]}
            now={now}
            getMember={getMember}
            onEdit={openEdit}
            onStatusChange={moveTask}
          />
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        task={editing}
        members={members}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        onDelete={deleteTask}
      />
    </div>
  );
}
