import type { DayGoal, Member, Task, TaskDraft } from "@/lib/schema/task.schema";

/**
 * The data-access boundary (CLAUDE.md §7): the store and UI depend ONLY on this
 * interface, never on where the data lives.
 *
 * Two implementations exist:
 *  - `LocalTaskRepository`     — seed + localStorage (default when Supabase env
 *    vars are absent; great for local dev and offline).
 *  - `SupabaseTaskRepository`  — shared Postgres, so all four teammates see the
 *    same data on the deployed app.
 *
 * The interface is async and per-operation (not "save the whole array") so it
 * maps cleanly onto a real database.
 */
export interface TaskRepository {
  listTasks(): Promise<Task[]>;
  createTask(task: Task): Promise<void>;
  /** Patch only the provided fields of a task. */
  updateTask(id: string, patch: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<void>;

  listMembers(): Promise<Member[]>;
  /** Patch only the provided fields of a member (e.g. name / role). */
  updateMember(id: string, patch: Partial<Member>): Promise<void>;

  listDayGoals(): Promise<DayGoal[]>;

  /**
   * Optional live updates. Calls `onChange` whenever tasks/members change
   * elsewhere; returns an unsubscribe function. Backends without realtime
   * simply omit this.
   */
  subscribe?(onChange: () => void): () => void;
}

/** Build a full Task from an edited draft (adds id + timestamps). */
export function createTaskFromDraft(draft: TaskDraft): Task {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: `t-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
}
