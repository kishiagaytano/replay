"use client";

import { useEffect, useState } from "react";
import type { Member, Task, TaskDraft } from "@/lib/schema/task.schema";
import { TaskDraftSchema } from "@/lib/schema/task.schema";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AutoGrowTextArea, Label, Select, TextInput } from "@/components/ui/Field";
import { CATEGORY_LIST, PRIORITY_LIST, STATUS_LIST } from "@/lib/utils/constants";
import { todayIso } from "@/lib/utils/dates";

/** Create or edit a task. `task === null` means "create". */
export function TaskDialog({
  open,
  task,
  members,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  task: Task | null;
  members: Member[];
  onClose: () => void;
  onSubmit: (id: string | null, draft: TaskDraft) => void;
  onDelete?: (id: string) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => emptyDraft(members));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDraft(task ? toDraft(task) : emptyDraft(members));
  }, [open, task, members]);

  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = () => {
    const normalized: TaskDraft = { ...draft, blocker: draft.blocker?.trim() ? draft.blocker.trim() : null };
    const result = TaskDraftSchema.safeParse(normalized);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    onSubmit(task?.id ?? null, result.data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="title">Title</Label>
          <TextInput
            id="title"
            autoFocus
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Author The Flood Was Real case content"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <AutoGrowTextArea
            id="description"
            minRows={3}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short context — what does 'done' look like?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select id="assignee" value={draft.assigneeId} onChange={(e) => set("assigneeId", e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="due">Due date</Label>
            <TextInput id="due" type="date" value={draft.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={draft.category} onChange={(e) => set("category", e.target.value as TaskDraft["category"])}>
              {CATEGORY_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" value={draft.priority} onChange={(e) => set("priority", e.target.value as TaskDraft["priority"])}>
              {PRIORITY_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={draft.status} onChange={(e) => set("status", e.target.value as TaskDraft["status"])}>
              {STATUS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="blocker">Blocker (optional)</Label>
          <TextInput
            id="blocker"
            value={draft.blocker ?? ""}
            onChange={(e) => set("blocker", e.target.value)}
            placeholder="What's stopping this? Leave empty if not blocked."
          />
        </div>

        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            {task && onDelete ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function toDraft(task: Task): TaskDraft {
  return {
    title: task.title,
    description: task.description,
    assigneeId: task.assigneeId,
    category: task.category,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    blocker: task.blocker ?? null,
  };
}

function emptyDraft(members: Member[]): TaskDraft {
  return {
    title: "",
    description: "",
    assigneeId: members[0]?.id ?? "",
    category: "frontend",
    priority: "medium",
    status: "todo",
    dueDate: todayIso(),
    blocker: null,
  };
}
