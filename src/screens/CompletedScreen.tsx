import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { sortTasks } from '../lib/filters';
import { SORT_OPTIONS } from '../lib/constants';
import type { SortKind } from '../types';
import { TaskList } from '../components/task/TaskList';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Sheet } from '../components/ui/Sheet';
import { useUIStore } from '../store/useUIStore';

export function CompletedScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const clearCompleted = useTaskStore((s) => s.clearCompleted);
  const confirm = useUIStore((s) => s.confirm);
  const toast = useUIStore((s) => s.toast);

  const [sort, setSort] = useState<SortKind>('modified');
  const [sortOpen, setSortOpen] = useState(false);

  const completed = useMemo(
    () => sortTasks(tasks.filter((t) => t.completed), sort),
    [tasks, sort],
  );

  const handleClear = async () => {
    const ok = await confirm({
      title: 'Clear completed?',
      message: `This will permanently remove ${completed.length} completed task${
        completed.length === 1 ? '' : 's'
      }.`,
      confirmLabel: 'Clear all',
      danger: true,
    });
    if (ok) {
      clearCompleted();
      toast('Completed tasks cleared', 'info');
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
          <div className="app-header__eyebrow">
            {completed.length} completed{completed.length ? ' · nice work' : ''}
          </div>
          <h1 className="app-header__title">Completed</h1>
        </div>
        <div className="header-actions">
          <IconButton label="Sort tasks" onClick={() => setSortOpen(true)}>
            <SlidersHorizontal size={21} />
          </IconButton>
          <IconButton
            label="Clear all completed"
            onClick={handleClear}
            disabled={completed.length === 0}
          >
            <Trash2 size={21} />
          </IconButton>
        </div>
      </header>

      {completed.length > 0 ? (
        <TaskList tasks={completed} />
      ) : (
        <EmptyState
          emoji="🗂️"
          title="No completed tasks yet"
          sub="Tasks you finish will collect here so you can look back on them."
        />
      )}

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <div className="sheet-list">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`sheet-item ${sort === o.value ? 'sheet-item--active' : ''}`}
              onClick={() => {
                setSort(o.value);
                setSortOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Sheet>
    </motion.div>
  );
}
