import type { Priority, RepeatType, Task } from '../types';
import { createId } from './id';

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const REPEATS: RepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'custom'];

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

/** Coerce arbitrary imported JSON into a valid Task, filling defaults. */
function normalizeTask(raw: any): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return null;

  const priority: Priority = PRIORITIES.includes(raw.priority) ? raw.priority : 'medium';
  const repeatType: RepeatType = REPEATS.includes(raw?.repeat?.type)
    ? raw.repeat.type
    : 'none';
  const now = new Date().toISOString();

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(),
    title,
    description: str(raw.description),
    notes: str(raw.notes),
    completed: Boolean(raw.completed),
    priority,
    category: typeof raw.category === 'string' && raw.category ? raw.category : 'other',
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.dueDate) ? raw.dueDate : null,
    dueTime: /^\d{2}:\d{2}$/.test(raw.dueTime) ? raw.dueTime : null,
    reminderMinutes:
      typeof raw.reminderMinutes === 'number' ? raw.reminderMinutes : null,
    repeat: {
      type: repeatType,
      interval:
        typeof raw?.repeat?.interval === 'number' ? raw.repeat.interval : undefined,
      unit: ['day', 'week', 'month'].includes(raw?.repeat?.unit)
        ? raw.repeat.unit
        : undefined,
    },
    createdAt: str(raw.createdAt) ?? now,
    updatedAt: str(raw.updatedAt) ?? now,
    completedAt: raw.completed ? str(raw.completedAt) ?? now : null,
  };
}

export interface ImportResult {
  tasks: Task[];
  count: number;
}

export function parseImport(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.tasks)
      ? (data as any).tasks
      : null;
  if (!list) throw new Error('No tasks found in the file.');

  const tasks = list.map(normalizeTask).filter((t): t is Task => t !== null);
  if (tasks.length === 0) throw new Error('No valid tasks found in the file.');

  // De-duplicate ids.
  const seen = new Set<string>();
  for (const t of tasks) {
    if (seen.has(t.id)) t.id = createId();
    seen.add(t.id);
  }
  return { tasks, count: tasks.length };
}

export function exportTasksToFile(tasks: Task[]): void {
  const payload = {
    app: 'flow-todo',
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `flow-tasks-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
