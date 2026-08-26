import type { Category, Priority, SortKind } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'personal', name: 'Personal', color: 'violet' },
  { id: 'study', name: 'Study', color: 'blue' },
  { id: 'work', name: 'Work', color: 'amber' },
  { id: 'shopping', name: 'Shopping', color: 'green' },
  { id: 'other', name: 'Other', color: 'slate' },
];

/** Ordered palette used when creating custom categories. */
export const CATEGORY_COLORS = [
  'violet',
  'blue',
  'green',
  'amber',
  'rose',
  'cyan',
  'orange',
  'slate',
] as const;

export interface PriorityMeta {
  value: Priority;
  label: string;
  color: string; // css var suffix
  rank: number; // higher = more important
}

export const PRIORITIES: Record<Priority, PriorityMeta> = {
  low: { value: 'low', label: 'Low', color: 'green', rank: 1 },
  medium: { value: 'medium', label: 'Medium', color: 'amber', rank: 2 },
  high: { value: 'high', label: 'High', color: 'rose', rank: 3 },
};

export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high'];

export interface ReminderOption {
  value: number | null;
  label: string;
}

export const REMINDER_OPTIONS: ReminderOption[] = [
  { value: null, label: 'None' },
  { value: 0, label: 'At time of task' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

export const SORT_OPTIONS: { value: SortKind; label: string }[] = [
  { value: 'created', label: 'Created date' },
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'modified', label: 'Recently modified' },
];

export const APP_VERSION = '1.0.0';
