import { z } from "zod";
import { MemberSchema, TaskSchema, type DayGoal, type Member, type Task } from "@/lib/schema/task.schema";
import type { TaskRepository } from "@/lib/data/repository";
import { DAY_GOALS, SEED_TASKS, TEAM_MEMBERS } from "@/lib/data/seed";

const TASKS_KEY = "replay-tracker:tasks:v1";
const MEMBERS_KEY = "replay-tracker:members:v1";

/**
 * localStorage-backed implementation of {@link TaskRepository}. Used when
 * Supabase isn't configured. Persistence is per-browser (not shared) — good for
 * local dev, offline, and as a safe fallback. Cross-tab changes are broadcast
 * via the `storage` event through {@link subscribe}.
 */
export class LocalTaskRepository implements TaskRepository {
  private get canPersist(): boolean {
    return typeof window !== "undefined";
  }

  async listTasks(): Promise<Task[]> {
    return this.readCollection(TASKS_KEY, TaskSchema, SEED_TASKS);
  }

  async createTask(task: Task): Promise<void> {
    const tasks = await this.listTasks();
    this.write(TASKS_KEY, [task, ...tasks]);
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<void> {
    const tasks = await this.listTasks();
    this.write(
      TASKS_KEY,
      tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.listTasks();
    this.write(
      TASKS_KEY,
      tasks.filter((t) => t.id !== id),
    );
  }

  async deleteAllTasks(): Promise<void> {
    this.write(TASKS_KEY, []);
  }

  async listMembers(): Promise<Member[]> {
    return this.readCollection(MEMBERS_KEY, MemberSchema, TEAM_MEMBERS);
  }

  async updateMember(id: string, patch: Partial<Member>): Promise<void> {
    const members = await this.listMembers();
    this.write(
      MEMBERS_KEY,
      members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }

  async listDayGoals(): Promise<DayGoal[]> {
    return DAY_GOALS;
  }

  subscribe(onChange: () => void): () => void {
    if (!this.canPersist) return () => {};
    const handler = (e: StorageEvent) => {
      if (e.key === TASKS_KEY || e.key === MEMBERS_KEY) onChange();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  // --- helpers ---------------------------------------------------------------

  private readCollection<T>(key: string, schema: z.ZodType<T>, seed: T[]): T[] {
    if (!this.canPersist) return seed;
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      this.write(key, seed);
      return seed;
    }
    const parsed = z.array(schema).safeParse(safeJsonParse(raw));
    if (!parsed.success) {
      this.write(key, seed);
      return seed;
    }
    return parsed.data;
  }

  private write<T>(key: string, value: T[]): void {
    if (!this.canPersist) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
