// Core domain types for the Flow todo app.

export type Priority = 'low' | 'medium' | 'high';

export type RepeatUnit = 'day' | 'week' | 'month';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Repeat {
  type: RepeatType;
  /** Only used when type === 'custom'. Repeat every `interval` `unit`s. */
  interval?: number;
  unit?: RepeatUnit;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  completed: boolean;
  priority: Priority;
  /** Category id (see Category). */
  category: string;
  /** ISO date string 'yyyy-MM-dd' or null when no due date. */
  dueDate: string | null;
  /** 'HH:mm' 24h or null. Only meaningful when dueDate is set. */
  dueTime: string | null;
  /** Minutes before due datetime to remind. null = no reminder. */
  reminderMinutes: number | null;
  repeat: Repeat;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  /** A hue name mapping to a CSS variable, e.g. 'violet'. */
  color: string;
  /** Whether the category is user-created and removable. */
  custom?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  theme: ThemeMode;
  defaultPriority: Priority;
  defaultCategory: string;
  defaultReminderMinutes: number | null;
  remindersEnabled: boolean;
  categories: Category[];
}

export type FilterKind =
  | 'all'
  | 'active'
  | 'completed'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'high';

export type SortKind =
  | 'created'
  | 'due'
  | 'priority'
  | 'alphabetical'
  | 'modified';

/** Shape used by the Add/Edit form. */
export type TaskDraft = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'completed'
>;
