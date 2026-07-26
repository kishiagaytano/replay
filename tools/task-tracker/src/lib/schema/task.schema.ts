import { z } from "zod";

/**
 * Zod is the single source of truth for the tracker's data model (per
 * CLAUDE.md §4/§6: derive types from schemas, validate at the boundary).
 * Domain types are inferred from these schemas — never hand-written alongside
 * them, so schema and type can never drift.
 */

export const TASK_STATUSES = ["todo", "in-progress", "review", "done"] as const;
export const TASK_PRIORITIES = ["high", "medium", "low"] as const;
export const TASK_CATEGORIES = [
  "research",
  "proposal",
  "design",
  "frontend",
  "backend",
  "historical-cases",
  "testing",
  "pitch-video",
] as const;

export const TaskStatusSchema = z.enum(TASK_STATUSES);
export const TaskPrioritySchema = z.enum(TASK_PRIORITIES);
export const TaskCategorySchema = z.enum(TASK_CATEGORIES);

/** ISO calendar date, e.g. "2026-08-07". */
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
/** ISO datetime, e.g. "2026-07-26T09:00:00.000Z". */
const IsoDateTime = z.string().datetime();

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  assigneeId: z.string().min(1),
  category: TaskCategorySchema,
  priority: TaskPrioritySchema,
  status: TaskStatusSchema,
  dueDate: IsoDate,
  /**
   * Optional extension beyond the 7 core fields: a blocker note. The Dashboard
   * must answer "what is currently blocked?", but `status` has no "Blocked"
   * value — so a task is considered blocked iff this note is set. Optional, to
   * keep the core task shape minimal.
   */
  blocker: z.string().nullable().optional(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});

export const MemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string(),
  initials: z.string().min(1).max(2),
  /** Tailwind classes for the member's avatar chip (static, JIT-safe). */
  color: z.string().min(1),
});

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskCategory = z.infer<typeof TaskCategorySchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Member = z.infer<typeof MemberSchema>;

/** Fields a user may edit in the task dialog (the specified core fields). */
export const TaskDraftSchema = TaskSchema.pick({
  title: true,
  description: true,
  assigneeId: true,
  category: true,
  priority: true,
  status: true,
  dueDate: true,
  blocker: true,
});

export type TaskDraft = z.infer<typeof TaskDraftSchema>;
