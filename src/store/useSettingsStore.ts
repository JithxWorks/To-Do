import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, Priority, Settings, ThemeMode } from '../types';
import { CATEGORY_COLORS, DEFAULT_CATEGORIES } from '../lib/constants';
import { createId } from '../lib/id';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultPriority: 'medium',
  defaultCategory: 'personal',
  defaultReminderMinutes: null,
  remindersEnabled: false,
  categories: DEFAULT_CATEGORIES,
};

interface SettingsState extends Settings {
  setTheme: (t: ThemeMode) => void;
  setDefaultPriority: (p: Priority) => void;
  setDefaultCategory: (id: string) => void;
  setDefaultReminder: (m: number | null) => void;
  setRemindersEnabled: (v: boolean) => void;
  addCategory: (name: string) => Category | null;
  removeCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;
  resetSettings: () => void;
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),
      setDefaultPriority: (defaultPriority) => set({ defaultPriority }),
      setDefaultCategory: (defaultCategory) => set({ defaultCategory }),
      setDefaultReminder: (defaultReminderMinutes) => set({ defaultReminderMinutes }),
      setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),

      addCategory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const { categories } = get();
        const base = slugify(trimmed) || 'category';
        let id = base;
        let n = 1;
        while (categories.some((c) => c.id === id)) id = `${base}-${++n}`;
        const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
        const category: Category = { id, name: trimmed, color, custom: true };
        set({ categories: [...categories, category] });
        return category;
      },

      removeCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => !(c.id === id && c.custom)),
          defaultCategory:
            state.defaultCategory === id ? 'other' : state.defaultCategory,
        }));
      },

      renameCategory: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name: trimmed } : c,
          ),
        }));
      },

      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'flow-settings-v1',
      version: 1,
    },
  ),
);
