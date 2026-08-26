import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  ChevronRight,
  Download,
  Flag,
  Monitor,
  Moon,
  Plus,
  Sun,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import type { Category, Priority, ThemeMode } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTaskStore } from '../store/useTaskStore';
import { useUIStore } from '../store/useUIStore';
import { Segmented } from '../components/ui/Segmented';
import { Switch } from '../components/ui/Switch';
import { Sheet } from '../components/ui/Sheet';
import { APP_VERSION, PRIORITIES, PRIORITY_ORDER, REMINDER_OPTIONS } from '../lib/constants';
import { hueVar } from '../lib/style';
import { exportTasksToFile, parseImport } from '../lib/export';
import { notificationsSupported, requestNotificationPermission } from '../hooks/useReminders';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={15} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={15} /> },
  { value: 'system', label: 'System', icon: <Monitor size={15} /> },
];

function reminderLabel(minutes: number | null): string {
  return REMINDER_OPTIONS.find((o) => o.value === minutes)?.label ?? 'None';
}

function CategoryRow({
  category,
  onRename,
  onDelete,
}: {
  category: Category;
  onRename: (id: string, name: string) => void;
  onDelete: (category: Category) => void;
}) {
  const [name, setName] = useState(category.name);

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== category.name) onRename(category.id, trimmed);
    else setName(category.name);
  };

  return (
    <div className="cat-manage-row">
      <span className="dot-only" style={hueVar(category.color)} />
      <input
        className="input"
        style={{ flex: 1, minWidth: 0, height: 40, padding: '0 12px' }}
        value={name}
        maxLength={20}
        aria-label={`Rename ${category.name}`}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') {
            setName(category.name);
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {category.custom ? (
        <button
          className="icon-btn"
          aria-label={`Delete ${category.name}`}
          onClick={() => onDelete(category)}
        >
          <Trash2 size={18} />
        </button>
      ) : (
        <span className="faint" style={{ fontSize: 12.5, paddingRight: 6 }}>
          Default
        </span>
      )}
    </div>
  );
}

export function SettingsScreen() {
  const {
    theme,
    defaultPriority,
    defaultCategory,
    defaultReminderMinutes,
    remindersEnabled,
    categories,
    setTheme,
    setDefaultPriority,
    setDefaultCategory,
    setDefaultReminder,
    setRemindersEnabled,
    addCategory,
    removeCategory,
    renameCategory,
  } = useSettingsStore();

  const tasks = useTaskStore((s) => s.tasks);
  const replaceAll = useTaskStore((s) => s.replaceAll);
  const clearCompleted = useTaskStore((s) => s.clearCompleted);
  const deleteAll = useTaskStore((s) => s.deleteAll);
  const reassignCategory = useTaskStore((s) => s.reassignCategory);

  const confirm = useUIStore((s) => s.confirm);
  const toast = useUIStore((s) => s.toast);

  const [picker, setPicker] = useState<null | 'priority' | 'category' | 'reminder'>(null);
  const [newCat, setNewCat] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const categoryLabel =
    categories.find((c) => c.id === defaultCategory)?.name ?? 'Other';

  const handleReminders = async (on: boolean) => {
    if (!on) {
      setRemindersEnabled(false);
      return;
    }
    if (!notificationsSupported()) {
      toast('Notifications are not supported on this device.', 'error');
      return;
    }
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      setRemindersEnabled(true);
      toast('Reminders enabled', 'success');
    } else {
      setRemindersEnabled(false);
      toast('Allow notifications in your browser to get reminders.', 'error');
    }
  };

  const handleAddCategory = () => {
    const created = addCategory(newCat);
    if (created) {
      toast(`Added “${created.name}”`, 'success');
      setNewCat('');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const ok = await confirm({
      title: `Delete “${category.name}”?`,
      message: 'Tasks in this category will be moved to Other.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) {
      reassignCategory(category.id, 'other');
      removeCategory(category.id);
      toast('Category deleted', 'info');
    }
  };

  const handleExport = () => {
    if (tasks.length === 0) {
      toast('No tasks to export yet.', 'info');
      return;
    }
    exportTasksToFile(tasks);
    toast(`Exported ${tasks.length} task${tasks.length === 1 ? '' : 's'}`, 'success');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { tasks: imported, count } = parseImport(text);
      const ok = await confirm({
        title: 'Import tasks?',
        message: `This replaces your current list with ${count} imported task${
          count === 1 ? '' : 's'
        }.`,
        confirmLabel: 'Import',
      });
      if (ok) {
        replaceAll(imported);
        toast(`Imported ${count} task${count === 1 ? '' : 's'}`, 'success');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not import file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleClearCompleted = async () => {
    const done = tasks.filter((t) => t.completed).length;
    if (done === 0) {
      toast('No completed tasks to clear.', 'info');
      return;
    }
    const ok = await confirm({
      title: 'Clear completed?',
      message: `Permanently remove ${done} completed task${done === 1 ? '' : 's'}.`,
      confirmLabel: 'Clear',
      danger: true,
    });
    if (ok) {
      clearCompleted();
      toast('Completed tasks cleared', 'info');
    }
  };

  const handleDeleteAll = async () => {
    const ok = await confirm({
      title: 'Delete all tasks?',
      message: 'This permanently deletes every task. This cannot be undone.',
      confirmLabel: 'Delete everything',
      danger: true,
    });
    if (ok) {
      deleteAll();
      toast('All tasks deleted', 'info');
    }
  };

  return (
    <motion.div
      className="screen screen--with-nav"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <header className="app-header">
        <div>
          <div className="app-header__eyebrow">Make it yours</div>
          <h1 className="app-header__title">Settings</h1>
        </div>
      </header>

      {/* Appearance */}
      <div className="settings-group">
        <div className="settings-group__title">Appearance</div>
        <Segmented<ThemeMode>
          name="Theme"
          options={THEME_OPTIONS}
          value={theme}
          onChange={setTheme}
        />
      </div>

      {/* Defaults */}
      <div className="settings-group">
        <div className="settings-group__title">Defaults for new tasks</div>
        <div className="settings-card">
          <button className="setting-row" onClick={() => setPicker('priority')}>
            <span className="setting-row__icon">
              <Flag size={17} />
            </span>
            <span className="setting-row__label">Default priority</span>
            <span className="setting-row__value">{PRIORITIES[defaultPriority].label}</span>
            <ChevronRight size={18} className="faint" />
          </button>
          <button className="setting-row" onClick={() => setPicker('category')}>
            <span className="setting-row__icon">
              <Tag size={17} />
            </span>
            <span className="setting-row__label">Default category</span>
            <span className="setting-row__value">{categoryLabel}</span>
            <ChevronRight size={18} className="faint" />
          </button>
          <button className="setting-row" onClick={() => setPicker('reminder')}>
            <span className="setting-row__icon">
              <Bell size={17} />
            </span>
            <span className="setting-row__label">Default reminder</span>
            <span className="setting-row__value">{reminderLabel(defaultReminderMinutes)}</span>
            <ChevronRight size={18} className="faint" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-group">
        <div className="settings-group__title">Notifications</div>
        <div className="settings-card">
          <div className="setting-row">
            <span className="setting-row__icon">
              <Bell size={17} />
            </span>
            <span className="setting-row__label">
              Reminders
              <div className="faint" style={{ fontSize: 12, fontWeight: 400, marginTop: 2 }}>
                Get notified before tasks are due
              </div>
            </span>
            <Switch checked={remindersEnabled} onChange={handleReminders} label="Enable reminders" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="settings-group">
        <div className="settings-group__title">Categories</div>
        <div className="settings-card">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              onRename={renameCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
          <div className="cat-manage-row">
            <span className="setting-row__icon" style={{ width: 20, height: 20, background: 'none' }}>
              <Plus size={16} />
            </span>
            <input
              className="input"
              style={{ flex: 1, minWidth: 0, height: 40, padding: '0 12px' }}
              placeholder="Add a category"
              value={newCat}
              maxLength={20}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory();
              }}
            />
            <button
              className="btn btn--primary btn--sm"
              onClick={handleAddCategory}
              disabled={!newCat.trim()}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="settings-group">
        <div className="settings-group__title">Data</div>
        <div className="settings-card">
          <button className="setting-row" onClick={handleExport}>
            <span className="setting-row__icon">
              <Download size={17} />
            </span>
            <span className="setting-row__label">Export tasks</span>
            <span className="setting-row__value">.json</span>
          </button>
          <button className="setting-row" onClick={() => fileRef.current?.click()}>
            <span className="setting-row__icon">
              <Upload size={17} />
            </span>
            <span className="setting-row__label">Import tasks</span>
            <ChevronRight size={18} className="faint" />
          </button>
          <button className="setting-row" onClick={handleClearCompleted}>
            <span className="setting-row__icon">
              <Check size={17} />
            </span>
            <span className="setting-row__label">Clear completed</span>
            <ChevronRight size={18} className="faint" />
          </button>
          <button className="setting-row setting-row--danger" onClick={handleDeleteAll}>
            <span className="setting-row__icon">
              <Trash2 size={17} />
            </span>
            <span className="setting-row__label">Delete all tasks</span>
            <ChevronRight size={18} className="faint" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImportFile}
        />
      </div>

      {/* About */}
      <div className="settings-group">
        <div className="settings-group__title">About</div>
        <div className="settings-card" style={{ padding: 'var(--sp-5)', textAlign: 'center' }}>
          <div className="about-logo">
            <Check size={34} strokeWidth={3} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Flow</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 2 }}>
            A calm place for your tasks
          </div>
          <div className="faint" style={{ fontSize: 12.5, marginTop: 8 }}>
            Version {APP_VERSION}
          </div>
        </div>
      </div>

      {/* Pickers */}
      <Sheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={
          picker === 'priority'
            ? 'Default priority'
            : picker === 'category'
              ? 'Default category'
              : 'Default reminder'
        }
      >
        {picker === 'priority' && (
          <div className="sheet-list">
            {PRIORITY_ORDER.map((p: Priority) => (
              <button
                key={p}
                className={`sheet-item ${defaultPriority === p ? 'sheet-item--active' : ''}`}
                onClick={() => {
                  setDefaultPriority(p);
                  setPicker(null);
                }}
              >
                <span className="dot-only" style={hueVar(PRIORITIES[p].color)} />
                {PRIORITIES[p].label}
              </button>
            ))}
          </div>
        )}
        {picker === 'category' && (
          <div className="sheet-list">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`sheet-item ${defaultCategory === c.id ? 'sheet-item--active' : ''}`}
                onClick={() => {
                  setDefaultCategory(c.id);
                  setPicker(null);
                }}
              >
                <span className="dot-only" style={hueVar(c.color)} />
                {c.name}
              </button>
            ))}
          </div>
        )}
        {picker === 'reminder' && (
          <div className="sheet-list">
            {REMINDER_OPTIONS.map((o) => (
              <button
                key={o.label}
                className={`sheet-item ${defaultReminderMinutes === o.value ? 'sheet-item--active' : ''}`}
                onClick={() => {
                  setDefaultReminder(o.value);
                  setPicker(null);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </motion.div>
  );
}
