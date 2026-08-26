import type { Category, FilterKind, SortKind, Task } from '../types';
import { PRIORITIES } from './constants';
import { getDueDateTime, isDueToday, isOverdue, isUpcoming } from './date';

export interface SelectOptions {
  filter: FilterKind;
  categoryId: string | null;
  sort: SortKind;
  query: string;
}

export function categoryName(categoryId: string, categories: Category[]): string {
  return categories.find((c) => c.id === categoryId)?.name ?? 'Other';
}

export function matchesQuery(task: Task, query: string, categories: Category[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const cat = categoryName(task.category, categories).toLowerCase();
  return (
    task.title.toLowerCase().includes(q) ||
    (task.description ?? '').toLowerCase().includes(q) ||
    (task.notes ?? '').toLowerCase().includes(q) ||
    cat.includes(q)
  );
}

export function matchesFilter(task: Task, filter: FilterKind, now: Date): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'active':
      return !task.completed;
    case 'completed':
      return task.completed;
    case 'today':
      return !task.completed && isDueToday(task);
    case 'upcoming':
      return !task.completed && isUpcoming(task, now);
    case 'overdue':
      return isOverdue(task, now);
    case 'high':
      return !task.completed && task.priority === 'high';
    default:
      return true;
  }
}

const NO_DUE = Number.POSITIVE_INFINITY;

function dueValue(task: Task): number {
  const d = getDueDateTime(task);
  return d ? d.getTime() : NO_DUE;
}

export function sortTasks(tasks: Task[], sort: SortKind): Task[] {
  const arr = [...tasks];
  switch (sort) {
    case 'created':
      arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'modified':
      arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    case 'alphabetical':
      arr.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      break;
    case 'priority':
      arr.sort((a, b) => {
        const diff = PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank;
        return diff !== 0 ? diff : dueValue(a) - dueValue(b);
      });
      break;
    case 'due':
      arr.sort((a, b) => {
        const diff = dueValue(a) - dueValue(b);
        return diff !== 0 ? diff : b.createdAt.localeCompare(a.createdAt);
      });
      break;
  }
  return arr;
}

export function selectTasks(
  tasks: Task[],
  { filter, categoryId, sort, query }: SelectOptions,
  categories: Category[],
): Task[] {
  const now = new Date();
  const filtered = tasks.filter(
    (t) =>
      matchesFilter(t, filter, now) &&
      (categoryId ? t.category === categoryId : true) &&
      matchesQuery(t, query, categories),
  );
  return sortTasks(filtered, sort);
}
