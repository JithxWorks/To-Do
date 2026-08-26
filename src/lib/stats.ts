import type { Task } from '../types';
import { isDueToday, isOverdue, todayKey } from './date';

export interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completedToday: number;
  dueToday: number;
  completionRate: number; // 0..100
}

export function computeStats(tasks: Task[]): Stats {
  const now = new Date();
  const tKey = todayKey();
  let completed = 0;
  let overdue = 0;
  let completedToday = 0;
  let dueToday = 0;

  for (const t of tasks) {
    if (t.completed) {
      completed += 1;
      if (t.completedAt && t.completedAt.slice(0, 10) === tKey) completedToday += 1;
    } else {
      if (isOverdue(t, now)) overdue += 1;
      if (isDueToday(t)) dueToday += 1;
    }
  }

  const total = tasks.length;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, pending, overdue, completedToday, dueToday, completionRate };
}
