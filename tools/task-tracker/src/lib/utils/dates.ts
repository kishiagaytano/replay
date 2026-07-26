import { DEADLINE_ISO } from "@/lib/utils/constants";

/** Parse a "YYYY-MM-DD" string into a local Date at midnight. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Normalize any Date to local midnight (drops the time component). */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Today's date as "YYYY-MM-DD" (local). */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days between two dates (b - a), ignoring time. */
export function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 86_400_000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
}

/** Days remaining until the Aug 7 deadline (0 if today, negative if past). */
export function daysUntilDeadline(now: Date = new Date()): number {
  return daysBetween(now, parseIsoDate(DEADLINE_ISO));
}

export function isSameDay(iso: string, now: Date = new Date()): boolean {
  return iso === todayIso(now);
}

/** True if `iso` is in the past and the task isn't done. */
export function isOverdue(iso: string, now: Date = new Date()): boolean {
  return daysBetween(now, parseIsoDate(iso)) < 0;
}

/** True if `iso` falls within the next `days` days (inclusive of today). */
export function isWithinNextDays(iso: string, days: number, now: Date = new Date()): boolean {
  const delta = daysBetween(now, parseIsoDate(iso));
  return delta >= 0 && delta <= days;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Fri, Aug 7" */
export function formatShortDate(iso: string): string {
  const d = parseIsoDate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Aug 7" */
export function formatCompactDate(iso: string): string {
  const d = parseIsoDate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Human relative label for a due date, e.g. "Today", "Tomorrow", "in 3 days", "2 days ago". */
export function relativeDueLabel(iso: string, now: Date = new Date()): string {
  const delta = daysBetween(now, parseIsoDate(iso));
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta === -1) return "Yesterday";
  if (delta < 0) return `${Math.abs(delta)} days ago`;
  return `in ${delta} days`;
}
