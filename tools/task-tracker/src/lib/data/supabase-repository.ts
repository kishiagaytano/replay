import type { SupabaseClient } from "@supabase/supabase-js";
import { MemberSchema, TaskSchema, type Member, type Task } from "@/lib/schema/task.schema";
import type { TaskRepository } from "@/lib/data/repository";

/**
 * Shared Postgres implementation of {@link TaskRepository}. All four teammates
 * read/write the same `tasks` and `members` tables, and Supabase Realtime keeps
 * everyone's board in sync.
 *
 * DB columns are snake_case; we map to/from the camelCase domain model here so
 * that mapping is the ONLY place that knows about the database shape.
 */
export class SupabaseTaskRepository implements TaskRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listTasks(): Promise<Task[]> {
    const { data, error } = await this.client.from("tasks").select("*");
    if (error) throw error;
    return (data ?? []).map(rowToTask);
  }

  async createTask(task: Task): Promise<void> {
    const { error } = await this.client.from("tasks").insert(taskToRow(task));
    if (error) throw error;
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<void> {
    const { error } = await this.client.from("tasks").update(taskPatchToRow(patch)).eq("id", id);
    if (error) throw error;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.client.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }

  async deleteAllTasks(): Promise<void> {
    // PostgREST requires a filter on delete; `id <> ''` matches every row.
    const { error } = await this.client.from("tasks").delete().neq("id", "");
    if (error) throw error;
  }

  async listMembers(): Promise<Member[]> {
    const { data, error } = await this.client.from("members").select("*");
    if (error) throw error;
    return (data ?? []).map(rowToMember);
  }

  async updateMember(id: string, patch: Partial<Member>): Promise<void> {
    const { error } = await this.client.from("members").update(memberPatchToRow(patch)).eq("id", id);
    if (error) throw error;
  }

  subscribe(onChange: () => void): () => void {
    const channel = this.client
      .channel("tracker-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, onChange)
      .subscribe();
    return () => {
      void this.client.removeChannel(channel);
    };
  }
}

// --- mapping (DB row <-> domain model) ---------------------------------------

type Row = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

/** Normalize a Postgres timestamptz to a strict ISO-8601 (Z) string. */
function toIso(v: unknown): string {
  const d = new Date(str(v));
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function rowToTask(row: Row): Task {
  return TaskSchema.parse({
    id: str(row.id),
    title: str(row.title),
    description: str(row.description ?? ""),
    assigneeId: str(row.assignee_id),
    category: str(row.category),
    priority: str(row.priority),
    status: str(row.status),
    dueDate: str(row.due_date),
    blocker: row.blocker == null ? null : str(row.blocker),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  });
}

function taskToRow(task: Task): Row {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    assignee_id: task.assigneeId,
    category: task.category,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate,
    blocker: task.blocker ?? null,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

function taskPatchToRow(patch: Partial<Task>): Row {
  const row: Row = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
  if (patch.blocker !== undefined) row.blocker = patch.blocker ?? null;
  if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;
  return row;
}

function rowToMember(row: Row): Member {
  return MemberSchema.parse({
    id: str(row.id),
    name: str(row.name),
    role: str(row.role ?? ""),
    initials: str(row.initials),
    color: str(row.color),
  });
}

function memberPatchToRow(patch: Partial<Member>): Row {
  const row: Row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.initials !== undefined) row.initials = patch.initials;
  if (patch.color !== undefined) row.color = patch.color;
  return row;
}
