import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { computeStats } from '../lib/stats';
import { hueVar } from '../lib/style';
import { ProgressRing } from '../components/ui/ProgressRing';
import { EmptyState } from '../components/ui/EmptyState';

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__icon">{icon}</span>
        {label}
      </div>
      <div className="stat-card__value" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

export function StatsScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const categories = useSettingsStore((s) => s.categories);

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const byCategory = useMemo(() => {
    return categories
      .map((c) => {
        const inCat = tasks.filter((t) => t.category === c.id);
        const done = inCat.filter((t) => t.completed).length;
        return { category: c, total: inCat.length, done };
      })
      .filter((x) => x.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [tasks, categories]);

  return (
    <motion.div
      className="screen screen--with-nav"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <header className="app-header">
        <div>
          <div className="app-header__eyebrow">Your progress</div>
          <h1 className="app-header__title">Statistics</h1>
        </div>
      </header>

      {stats.total === 0 ? (
        <EmptyState
          emoji="📊"
          title="No stats yet"
          sub="Add a few tasks and your progress will show up here."
        />
      ) : (
        <>
          <div className="stat-hero">
            <ProgressRing value={stats.completionRate} size={92} stroke={9} />
            <div className="stat-hero__meta">
              <div className="stat-hero__big">{stats.completionRate}%</div>
              <div className="muted" style={{ fontSize: 14, fontWeight: 500 }}>
                Completion rate
              </div>
              <div className="faint" style={{ fontSize: 13, marginTop: 4 }}>
                {stats.completed} of {stats.total} tasks done
              </div>
            </div>
          </div>

          <div className="stat-grid">
            <StatCard icon={<ListTodo size={16} />} label="Total" value={stats.total} />
            <StatCard
              icon={<CheckCircle2 size={16} />}
              label="Completed"
              value={stats.completed}
              color="var(--success)"
            />
            <StatCard icon={<Clock size={16} />} label="Pending" value={stats.pending} />
            <StatCard
              icon={<AlertTriangle size={16} />}
              label="Overdue"
              value={stats.overdue}
              color={stats.overdue ? 'var(--danger)' : undefined}
            />
            <StatCard
              icon={<Sparkles size={16} />}
              label="Done today"
              value={stats.completedToday}
            />
            <StatCard
              icon={<CalendarDays size={16} />}
              label="Due today"
              value={stats.dueToday}
            />
          </div>

          {byCategory.length > 0 && (
            <>
              <div className="section-title">By category</div>
              <div className="detail-section" style={{ padding: '6px var(--sp-4)' }}>
                {byCategory.map(({ category, total, done }) => {
                  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                  return (
                    <div className="cat-breakdown-row" key={category.id}>
                      <span className="dot-only" style={hueVar(category.color)} />
                      <div className="grow">
                        <div className="row between" style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{category.name}</span>
                          <span className="faint" style={{ fontSize: 12.5 }}>
                            {done}/{total}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-bar__fill"
                            style={{ background: `var(--${category.color})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
