import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getDueDateTime } from '../lib/date';
import type { Task } from '../types';

const MAX_HORIZON_MS = 24 * 60 * 60 * 1000; // schedule at most a day ahead

function reminderTime(task: Task): number | null {
  if (task.completed || task.reminderMinutes == null || !task.dueDate) return null;
  const due = getDueDateTime(task);
  if (!due) return null;
  return due.getTime() - task.reminderMinutes * 60_000;
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * While the app is open, schedules browser notifications for tasks that have
 * reminders. If the Notification API is unavailable or permission is not
 * granted, this is a no-op — the UI and data model still work, so real
 * notifications can be layered in later without changes elsewhere.
 */
export function useReminderScheduler() {
  const tasks = useTaskStore((s) => s.tasks);
  const enabled = useSettingsStore((s) => s.remindersEnabled);
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !notificationsSupported() || Notification.permission !== 'granted') {
      return;
    }

    const now = Date.now();
    const timers: number[] = [];

    for (const task of tasks) {
      const at = reminderTime(task);
      if (at == null) continue;
      const key = `${task.id}@${at}`;
      if (fired.current.has(key)) continue;
      const delay = at - now;
      if (delay <= 0 || delay > MAX_HORIZON_MS) continue;

      const id = window.setTimeout(() => {
        fired.current.add(key);
        try {
          new Notification(task.title, {
            body: task.description || 'Task reminder',
            tag: task.id,
          });
        } catch {
          /* ignore */
        }
      }, delay);
      timers.push(id);
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [tasks, enabled]);
}
