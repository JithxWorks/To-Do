import type { Repeat, Task } from '../types';
import { addDays, addMonths, addWeeks, fromDateKey, toDateKey } from './date';

export function repeatLabel(repeat: Repeat): string {
  switch (repeat.type) {
    case 'none':
      return 'Does not repeat';
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Every week';
    case 'monthly':
      return 'Every month';
    case 'custom': {
      const n = repeat.interval && repeat.interval > 0 ? repeat.interval : 1;
      const unit = repeat.unit ?? 'day';
      const plural = n === 1 ? unit : `${unit}s`;
      return n === 1 ? `Every ${unit}` : `Every ${n} ${plural}`;
    }
    default:
      return 'Does not repeat';
  }
}

export function isRecurring(task: Pick<Task, 'repeat'>): boolean {
  return task.repeat.type !== 'none';
}

/**
 * Given a due date key, return the next occurrence key based on the repeat
 * rule. Returns null when the task does not repeat or has no due date.
 */
export function nextOccurrence(dueDate: string | null, repeat: Repeat): string | null {
  if (!dueDate || repeat.type === 'none') return null;
  const base = fromDateKey(dueDate);
  let next: Date;
  switch (repeat.type) {
    case 'daily':
      next = addDays(base, 1);
      break;
    case 'weekly':
      next = addWeeks(base, 1);
      break;
    case 'monthly':
      next = addMonths(base, 1);
      break;
    case 'custom': {
      const n = repeat.interval && repeat.interval > 0 ? repeat.interval : 1;
      const unit = repeat.unit ?? 'day';
      if (unit === 'week') next = addWeeks(base, n);
      else if (unit === 'month') next = addMonths(base, n);
      else next = addDays(base, n);
      break;
    }
    default:
      return null;
  }
  return toDateKey(next);
}
