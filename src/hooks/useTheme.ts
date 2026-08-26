import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { ThemeMode } from '../types';

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

/** Applies the selected theme to <html> and keeps it in sync with system changes. */
export function useThemeSync(): 'light' | 'dark' {
  const theme = useSettingsStore((s) => s.theme);
  const resolved = resolveTheme(theme);

  useEffect(() => {
    const apply = () => {
      const r = resolveTheme(theme);
      document.documentElement.setAttribute('data-theme', r);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', r === 'dark' ? '#0f1115' : '#f4f5f7');
    };
    apply();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return resolved;
}
