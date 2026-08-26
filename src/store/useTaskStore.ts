import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskDraft } from '../types';
import { createId } from '../lib/id';
import { isRecurring, nextOccurrence } from '../lib/recurrence';
import { addDays, toDateKey } from '../lib/date';

interface TaskState {
  tasks: Task[];
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, patch: Partial<TaskDraft>) => void;
  deleteTask: (id: string) => void;
  setCompleted: (id: string, completed: boolean) => void;
  toggleComplete: (id: string) => void;
  duplicateTask: (id: string) => Task | null;
  clearCompleted: () => void;
  reassignCategory: (fromId: string, toId: string) => void;
  replaceAll: (tasks: Task[]) => void;
  deleteAll: () => void;
}

function nowISO() {
  return new Date().toISOString();
}

function makeTask(draft: TaskDraft): Task {
  const ts = nowISO();
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description?.trim() || undefined,
    notes: draft.notes?.trim() || undefined,
    completed: false,
    priority: draft.priority,
    category: draft.category,
    dueDate: draft.dueDate,
    dueTime: draft.dueTime,
    reminderMinutes: draft.reminderMinutes,
    repeat: draft.repeat,
    createdAt: ts,
    updatedAt: ts,
    completedAt: null,
  };
}

/** Sample tasks shown only on first launch (no persisted data yet). */
function seedTasks(): Task[] {
  const today = toDateKey(new Date());
  const tomorrow = toDateKey(addDays(new Date(), 1));
  const in3 = toDateKey(addDays(new Date(), 3));
  const yesterday = toDateKey(addDays(new Date(), -1));
  const ts = nowISO();

  const base = (t: Partial<Task> & Pick<Task, 'title' | 'priority' | 'category'>): Task => ({
    id: createId(),
    description: undefined,
    notes: undefined,
    completed: false,
    dueDate: null,
    dueTime: null,
    reminderMinutes: null,
    repeat: { type: 'none' },
    createdAt: ts,
    updatedAt: ts,
    completedAt: null,
    ...t,
  });

  return [
    base({
      title: 'Morning run',
      description: '3km around the park',
      priority: 'medium',
      category: 'personal',
      dueDate: today,
      dueTime: '07:00',
      reminderMinutes: 10,
      repeat: { type: 'daily' },
    }),
    base({
      title: 'Finish React assignment',
      description: 'Components + hooks section',
      priority: 'high',
      category: 'study',
      dueDate: today,
      dueTime: '18:00',
      reminderMinutes: 60,
    }),
    base({
      title: 'Team standup',
      priority: 'medium',
      category: 'work',
      dueDate: today,
      dueTime: '09:30',
      repeat: { type: 'weekly' },
    }),
    base({
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, coffee',
      priority: 'low',
      category: 'shopping',
      dueDate: tomorrow,
    }),
    base({
      title: 'Study C programming',
      description: 'Pointers & memory chapter',
      priority: 'high',
      category: 'study',
      dueDate: in3,
      dueTime: '19:00',
      repeat: { type: 'custom', interval: 1, unit: 'week' },
    }),
    base({
      title: 'Read 20 pages',
      priority: 'low',
      category: 'personal',
      dueDate: yesterday,
    }),
    base({
      title: 'Pay electricity bill',
      priority: 'high',
      category: 'work',
      completed: true,
      completedAt: ts,
    }),
  ];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: seedTasks(),

      addTask: (draft) => {
        const task = makeTask(draft);
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },

      updateTask: (id, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  title: patch.title !== undefined ? patch.title.trim() : t.title,
                  description:
                    patch.description !== undefined
                      ? patch.description?.trim() || undefined
                      : t.description,
                  notes:
                    patch.notes !== undefined ? patch.notes?.trim() || undefined : t.notes,
                  updatedAt: nowISO(),
                }
              : t,
          ),
        }));
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      setCompleted: (id, completed) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const ts = nowISO();
        const spawn: Task[] = [];

        // Completing a recurring task creates its next occurrence.
        if (completed && !task.completed && isRecurring(task) && task.dueDate) {
          const nextKey = nextOccurrence(task.dueDate, task.repeat);
          if (nextKey) {
            spawn.push({
              ...task,
              id: createId(),
              completed: false,
              completedAt: null,
              dueDate: nextKey,
              createdAt: ts,
              updatedAt: ts,
            });
          }
        }

        set((s) => ({
          tasks: [
            ...spawn,
            ...s.tasks.map((t) =>
              t.id === id
                ? { ...t, completed, completedAt: completed ? ts : null, updatedAt: ts }
                : t,
            ),
          ],
        }));
      },

      toggleComplete: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) get().setCompleted(id, !task.completed);
      },

      duplicateTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return null;
        const ts = nowISO();
        const copy: Task = {
          ...task,
          id: createId(),
          title: `${task.title} (copy)`,
          completed: false,
          completedAt: null,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ tasks: [copy, ...s.tasks] }));
        return copy;
      },

      clearCompleted: () => {
        set((s) => ({ tasks: s.tasks.filter((t) => !t.completed) }));
      },

      reassignCategory: (fromId, toId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.category === fromId ? { ...t, category: toId, updatedAt: nowISO() } : t,
          ),
        }));
      },

      replaceAll: (tasks) => set({ tasks }),

      deleteAll: () => set({ tasks: [] }),
    }),
    {
      name: 'flow-tasks-v1',
      version: 1,
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
