import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../store/useTaskStore';
import { useUIStore } from '../store/useUIStore';
import {
  addDays,
  format,
  fromDateKey,
  isToday,
  toDateKey,
  todayKey,
} from '../lib/date';
import { sortTasks } from '../lib/filters';
import { TaskList } from '../components/task/TaskList';
import { EmptyState } from '../components/ui/EmptyState';

const WINDOW = 14;

export function CalendarScreen() {
  const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks);
  const calendarDate = useUIStore((s) => s.calendarDate);
  const setCalendarDate = useUIStore((s) => s.setCalendarDate);

  const [weekStart, setWeekStart] = useState<string>(() => toDateKey(addDays(new Date(), -1)));

  const days = useMemo(
    () => Array.from({ length: WINDOW }, (_, i) => addDays(fromDateKey(weekStart), i)),
    [weekStart],
  );

  // Active-task counts per day, for the dot indicators.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.completed || !t.dueDate) continue;
      map.set(t.dueDate, (map.get(t.dueDate) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const dayTasks = useMemo(
    () => sortTasks(tasks.filter((t) => t.dueDate === calendarDate), 'due'),
    [tasks, calendarDate],
  );

  const selected = fromDateKey(calendarDate);
  const monthTitle = format(addDays(fromDateKey(weekStart), 6), 'MMMM yyyy');
  const selectedLabel = isToday(selected) ? 'Today' : format(selected, 'EEEE, MMM d');

  const goToday = () => {
    const k = todayKey();
    setWeekStart(toDateKey(addDays(new Date(), -1)));
    setCalendarDate(k);
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
          <div className="app-header__eyebrow">Plan your days</div>
          <h1 className="app-header__title">Calendar</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn--ghost btn--sm" onClick={goToday}>
            Today
          </button>
        </div>
      </header>

      <div className="cal-monthbar">
        <button
          className="icon-btn"
          aria-label="Previous week"
          onClick={() => setWeekStart(toDateKey(addDays(fromDateKey(weekStart), -7)))}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="cal-monthbar__title">{monthTitle}</div>
        <button
          className="icon-btn"
          aria-label="Next week"
          onClick={() => setWeekStart(toDateKey(addDays(fromDateKey(weekStart), 7)))}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="cal-strip" role="listbox" aria-label="Select a day">
        {days.map((d) => {
          const key = toDateKey(d);
          const active = key === calendarDate;
          const count = counts.get(key) ?? 0;
          return (
            <button
              key={key}
              role="option"
              aria-selected={active}
              className={`cal-day ${active ? 'cal-day--active' : ''} ${
                isToday(d) ? 'cal-day--today' : ''
              }`}
              onClick={() => setCalendarDate(key)}
            >
              <span className="cal-day__dow">{format(d, 'EEE')}</span>
              <span className="cal-day__num">{format(d, 'd')}</span>
              <span className="cal-day__dots">
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <i key={i} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="row between" style={{ margin: '18px 0 12px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedLabel}</div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => navigate(`/add?date=${calendarDate}`)}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {dayTasks.length > 0 ? (
        <TaskList tasks={dayTasks} />
      ) : (
        <EmptyState
          emoji="📅"
          title="Nothing planned"
          sub="No tasks for this day. Tap Add to schedule something."
        />
      )}
    </motion.div>
  );
}
