import type { Task, TaskStatus } from "@/lib/schema/task.schema";
import { PRIORITY_META, STATUS_ORDER } from "@/lib/utils/constants";
import { isOverdue, isSameDay, isWithinNextDays, parseIsoDate } from "@/lib/utils/dates";

/**
 * Pure derivations over the task list. Nothing here is stored — the dashboard,
 * team, and timeline views all compute from these so there's one definition of
 * "today's tasks", "progress", "blocked", etc.
 */

export interface ProgressSummary {
  total: number;
  done: number;
  /** 0–100, rounded. */
  percent: number;
  byStatus: Record<TaskStatus, number>;
}

export function computeProgress(tasks: Task[]): ProgressSummary {
  const byStatus: Record<TaskStatus, number> = {
    todo: 0,
    "in-progress": 0,
    review: 0,
    done: 0,
  };
  for (const task of tasks) byStatus[task.status] += 1;

  const total = tasks.length;
  const done = byStatus.done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent, byStatus };
}

const isActive = (task: Task): boolean => task.status !== "done";

/** Tasks due today that aren't finished, plus anything already in progress. */
export function tasksForToday(tasks: Task[], now: Date = new Date()): Task[] {
  return tasks
    .filter((t) => isActive(t) && (isSameDay(t.dueDate, now) || t.status === "in-progress"))
    .sort(byUrgency);
}

/** Unfinished tasks due within the next `days` days (default 3), soonest first. */
export function upcomingDeadlines(tasks: Task[], days = 3, now: Date = new Date()): Task[] {
  return tasks
    .filter((t) => isActive(t) && isWithinNextDays(t.dueDate, days, now))
    .sort(byDueDate);
}

/** Active tasks with a blocker note set. */
export function blockedTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => isActive(t) && !!t.blocker?.trim());
}

/** Active tasks whose due date has already passed. */
export function overdueTasks(tasks: Task[], now: Date = new Date()): Task[] {
  return tasks.filter((t) => isActive(t) && isOverdue(t.dueDate, now)).sort(byDueDate);
}

export interface MemberWorkload {
  memberId: string;
  assigned: Task[];
  active: Task[];
  completed: Task[];
  /** 0–100 completion rate for this member. */
  completionPercent: number;
  byStatus: Record<TaskStatus, number>;
}

export function memberWorkload(tasks: Task[], memberId: string): MemberWorkload {
  const assigned = tasks.filter((t) => t.assigneeId === memberId);
  const completed = assigned.filter((t) => t.status === "done");
  const active = assigned.filter(isActive);

  const byStatus: Record<TaskStatus, number> = {
    todo: 0,
    "in-progress": 0,
    review: 0,
    done: 0,
  };
  for (const t of assigned) byStatus[t.status] += 1;

  const completionPercent =
    assigned.length === 0 ? 0 : Math.round((completed.length / assigned.length) * 100);

  return { memberId, assigned, active, completed, completionPercent, byStatus };
}

/** Group tasks by their due date (ISO), keyed for the Timeline. */
export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = map.get(task.dueDate) ?? [];
    list.push(task);
    map.set(task.dueDate, list);
  }
  for (const list of map.values()) list.sort(byUrgency);
  return map;
}

/** Sort by due date ascending. */
export function byDueDate(a: Task, b: Task): number {
  return parseIsoDate(a.dueDate).getTime() - parseIsoDate(b.dueDate).getTime();
}

/** Sort by priority (high → low), then due date. */
export function byUrgency(a: Task, b: Task): number {
  const p = PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
  return p !== 0 ? p : byDueDate(a, b);
}

/** Sort statuses by pipeline order. */
export function byStatusOrder(a: TaskStatus, b: TaskStatus): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
}
