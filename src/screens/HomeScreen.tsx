import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, CheckCheck, PartyPopper, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useViewStore } from '../store/useViewStore';
import { matchesFilter, selectTasks } from '../lib/filters';
import { computeStats } from '../lib/stats';
import { headerDate } from '../lib/date';
import { SORT_OPTIONS } from '../lib/constants';
import type { FilterKind } from '../types';
import { TaskList } from '../components/task/TaskList';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Sheet } from '../components/ui/Sheet';
import { hueVar } from '../lib/style';

const FILTERS: { value: FilterKind; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'high', label: 'High priority' },
  { value: 'all', label: 'All' },
];

const FILTER_TITLES: Record<FilterKind, string> = {
  today: 'Today',
  active: 'Active tasks',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  high: 'High priority',
  all: 'All tasks',
  completed: 'Completed',
};

function emptyFor(filter: FilterKind, query: string, category?: string) {
  if (query) {
    return { icon: <SearchX size={30} />, title: 'No matches found', sub: `Nothing matched “${query}”. Try a different search.` };
  }
  if (category) {
    return { icon: <CheckCheck size={30} />, title: `No tasks in ${category}`, sub: 'Tasks in this category will show up here.' };
  }
  switch (filter) {
    case 'today':
      return { emoji: '🎉', title: 'No tasks for today', sub: 'Enjoy your free time — or add something new.' };
    case 'active':
      return { emoji: '✅', title: "You're all caught up!", sub: 'No active tasks. Time to relax.' };
    case 'upcoming':
      return { icon: <CalendarClock size={30} />, title: 'Nothing upcoming', sub: 'Future tasks with a due date will appear here.' };
    case 'overdue':
      return { emoji: '👍', title: 'No overdue tasks', sub: "You're right on schedule." };
    case 'high':
      return { emoji: '🎯', title: 'No high-priority tasks', sub: 'High-priority tasks will appear here.' };
    default:
      return { emoji: '📝', title: 'No tasks yet', sub: 'Tap the + button to create your first task.' };
  }
}

export function HomeScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const categories = useSettingsStore((s) => s.categories);
  const { filter, categoryId, sort, setFilter, setCategoryId, setSort } = useViewStore();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const visible = useMemo(
    () => selectTasks(tasks, { filter, categoryId, sort, query }, categories),
    [tasks, filter, categoryId, sort, query, categories],
  );

  const counts = useMemo(() => {
    const now = new Date();
    const c: Record<string, number> = {};
    for (const f of FILTERS) c[f.value] = 0;
    for (const t of tasks) {
      for (const f of FILTERS) if (matchesFilter(t, f.value, now)) c[f.value] += 1;
    }
    return c;
  }, [tasks]);

  const activeCategory = categories.find((cc) => cc.id === categoryId);
  const title = activeCategory ? activeCategory.name : FILTER_TITLES[filter];
  const empty = emptyFor(filter, query.trim(), activeCategory?.name);

  return (
    <div className="screen screen--with-nav">
      <header className="app-header">
        <div>
          <div className="app-header__eyebrow">{headerDate()}</div>
          <h1 className="app-header__title">{title}</h1>
        </div>
        <div className="header-actions">
          <IconButton
            label="Search tasks"
            variant={searchOpen ? 'accent' : 'plain'}
            onClick={() => {
              setSearchOpen((v) => !v);
              if (searchOpen) setQuery('');
            }}
          >
            <Search size={21} />
          </IconButton>
          <IconButton label="Sort tasks" onClick={() => setSortOpen(true)}>
            <SlidersHorizontal size={21} />
          </IconButton>
        </div>
      </header>

      <div className="stat-strip">
        <div className="stat-pill stat-pill--accent">
          <span className="stat-pill__value">{stats.pending}</span>
          <span className="stat-pill__label">To do</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill__value">{stats.completedToday}</span>
          <span className="stat-pill__label">Done today</span>
        </div>
        <div className={`stat-pill ${stats.overdue ? 'stat-pill--danger' : ''}`}>
          <span className="stat-pill__value">{stats.overdue}</span>
          <span className="stat-pill__label">Overdue</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="search-bar">
              <Search size={18} />
              <input
                autoFocus
                placeholder="Search title, description, category…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search tasks"
              />
              {query && (
                <IconButton label="Clear search" onClick={() => setQuery('')}>
                  <X size={18} />
                </IconButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chip-scroller" role="tablist" aria-label="Filter tasks">
        {FILTERS.map((f) => {
          const active = !categoryId && filter === f.value;
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={active}
              className={`chip ${active ? 'chip--active' : ''}`}
              onClick={() => {
                setFilter(f.value);
                setCategoryId(null);
              }}
            >
              {f.label}
              {counts[f.value] > 0 && <span className="chip__count">{counts[f.value]}</span>}
            </button>
          );
        })}
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoryId === c.id ? 'chip--active' : ''}`}
            style={categoryId === c.id ? hueVar(c.color) : undefined}
            onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <TaskList tasks={visible} />
      ) : (
        <EmptyState emoji={empty.emoji} icon={empty.icon} title={empty.title} sub={empty.sub} />
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
    </div>
  );
}
