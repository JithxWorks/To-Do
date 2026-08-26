import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfDay,
  format,
  isThisYear,
  isToday,
  isTomorrow,
  isYesterday,
  parse,
} from 'date-fns';
import type { Task } from '../types';

/** Local Date -> 'yyyy-MM-dd' key. */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** 'yyyy-MM-dd' -> local Date at midnight. */
export function fromDateKey(key: string): Date {
  return parse(key, 'yyyy-MM-dd', new Date());
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/**
 * The moment a task is "due". Combines dueDate + dueTime.
 * When no time is set we treat the deadline as end of day so a task
 * isn't considered overdue earlier in the same day.
 */
export function getDueDateTime(task: Pick<Task, 'dueDate' | 'dueTime'>): Date | null {
  if (!task.dueDate) return null;
  const base = fromDateKey(task.dueDate);
  if (task.dueTime) {
    const [h, m] = task.dueTime.split(':').map(Number);
    base.setHours(h || 0, m || 0, 0, 0);
    return base;
  }
  return endOfDay(base);
}

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.completed || !task.dueDate) return false;
  const due = getDueDateTime(task);
  return due != null && due.getTime() < now.getTime();
}

export function isDueToday(task: Task): boolean {
  return task.dueDate != null && isToday(fromDateKey(task.dueDate));
}

export function isUpcoming(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  const d = fromDateKey(task.dueDate);
  return differenceInCalendarDays(d, now) > 0;
}

/** Compact due label for cards, e.g. "Today · 7:00 PM", "Tomorrow", "Aug 30". */
export function dueLabel(task: Pick<Task, 'dueDate' | 'dueTime'>): string | null {
  if (!task.dueDate) return null;
  const d = fromDateKey(task.dueDate);
  let day: string;
  if (isToday(d)) day = 'Today';
  else if (isTomorrow(d)) day = 'Tomorrow';
  else if (isYesterday(d)) day = 'Yesterday';
  else if (isThisYear(d)) day = format(d, 'EEE, MMM d');
  else day = format(d, 'MMM d, yyyy');

  if (task.dueTime) {
    return `${day} · ${formatTimeLabel(task.dueTime)}`;
  }
  return day;
}

export function formatTimeLabel(time: string): string {
  const parsed = parse(time, 'HH:mm', new Date());
  return format(parsed, 'h:mm a');
}

export function formatDateLong(dateOrKey: string | Date): string {
  const d = typeof dateOrKey === 'string' ? fromDateKey(dateOrKey) : dateOrKey;
  return format(d, 'EEEE, MMMM d, yyyy');
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

/** Header date, e.g. "Monday, August 25". */
export function headerDate(date: Date = new Date()): string {
  return format(date, 'EEEE, MMMM d');
}

export { addDays, addMonths, addWeeks, isToday, isTomorrow, format };
