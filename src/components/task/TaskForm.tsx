import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Priority, RepeatType, RepeatUnit, TaskDraft } from '../../types';
import { PRIORITIES, PRIORITY_ORDER, REMINDER_OPTIONS } from '../../lib/constants';
import { hueVar } from '../../lib/style';
import { todayKey, toDateKey, addDays } from '../../lib/date';
import { useSettingsStore } from '../../store/useSettingsStore';

interface Props {
  initial?: TaskDraft;
  initialDueDate?: string;
  submitLabel: string;
  onSubmit: (draft: TaskDraft) => void;
  onCancel: () => void;
}

const REPEAT_TYPES: { value: RepeatType; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export function TaskForm({ initial, initialDueDate, submitLabel, onSubmit, onCancel }: Props) {
  const categories = useSettingsStore((s) => s.categories);
  const addCategory = useSettingsStore((s) => s.addCategory);
  const defaults = useSettingsStore((s) => ({
    priority: s.defaultPriority,
    category: s.defaultCategory,
    reminder: s.defaultReminderMinutes,
  }));

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? initialDueDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(initial?.dueTime ?? null);
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? defaults.priority);
  const [category, setCategory] = useState(initial?.category ?? defaults.category);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(
    initial ? initial.reminderMinutes : defaults.reminder,
  );
  const [repeatType, setRepeatType] = useState<RepeatType>(initial?.repeat.type ?? 'none');
  const [repeatInterval, setRepeatInterval] = useState<number>(initial?.repeat.interval ?? 1);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>(initial?.repeat.unit ?? 'week');

  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [touched, setTouched] = useState(false);

  const titleError = touched && !title.trim();
  const canSubmit = title.trim().length > 0;

  const activeCat = useMemo(
    () => categories.find((c) => c.id === category),
    [categories, category],
  );

  function handleSubmit() {
    setTouched(true);
    if (!title.trim()) return;
    const draft: TaskDraft = {
      title: title.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      priority,
      category: activeCat ? category : 'other',
      dueDate,
      dueTime: dueDate ? dueTime : null,
      reminderMinutes,
      repeat:
        repeatType === 'custom'
          ? { type: 'custom', interval: Math.max(1, repeatInterval), unit: repeatUnit }
          : { type: repeatType },
    };
    onSubmit(draft);
  }

  function commitNewCategory() {
    const created = addCategory(newCat);
    if (created) setCategory(created.id);
    setNewCat('');
    setAddingCat(false);
  }

  return (
    <div>
      {/* Title */}
      <div className="field">
        <label className="field__label" htmlFor="task-title">
          Title <span className="req">*</span>
        </label>
        <input
          id="task-title"
          className={`input input-title ${titleError ? 'input--invalid' : ''}`}
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          autoFocus={!initial}
          maxLength={120}
        />
        {titleError && <div className="field__error">Please enter a task title.</div>}
      </div>

      {/* Description */}
      <div className="field">
        <label className="field__label" htmlFor="task-desc">
          Description
        </label>
        <input
          id="task-desc"
          className="input"
          placeholder="Add a short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
      </div>

      {/* Due date + time */}
      <div className="field">
        <label className="field__label">Due date</label>
        <div className="chip-scroller" style={{ margin: '0 0 10px', padding: 0 }}>
          <button
            type="button"
            className={`chip ${dueDate === todayKey() ? 'chip--active' : ''}`}
            onClick={() => setDueDate(todayKey())}
          >
            Today
          </button>
          <button
            type="button"
            className={`chip ${dueDate === toDateKey(addDays(new Date(), 1)) ? 'chip--active' : ''}`}
            onClick={() => setDueDate(toDateKey(addDays(new Date(), 1)))}
          >
            Tomorrow
          </button>
          {dueDate && (
            <button type="button" className="chip" onClick={() => { setDueDate(null); setDueTime(null); }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
        <div className="grid-2">
          <input
            className="input"
            type="date"
            aria-label="Due date"
            value={dueDate ?? ''}
            onChange={(e) => setDueDate(e.target.value || null)}
          />
          <input
            className="input"
            type="time"
            aria-label="Due time"
            value={dueTime ?? ''}
            disabled={!dueDate}
            onChange={(e) => setDueTime(e.target.value || null)}
          />
        </div>
      </div>

      {/* Priority */}
      <div className="field">
        <label className="field__label">Priority</label>
        <div className="pick-row">
          {PRIORITY_ORDER.map((p) => {
            const meta = PRIORITIES[p];
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                className={`pick ${active ? 'pick--active' : ''}`}
                style={hueVar(meta.color)}
                onClick={() => setPriority(p)}
                aria-pressed={active}
              >
                <span className="dot-only" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div className="field">
        <label className="field__label">Category</label>
        <div className="cat-wrap">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-chip ${category === c.id ? 'cat-chip--active' : ''}`}
              style={hueVar(c.color)}
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
            >
              <span className="dot-only" />
              {c.name}
            </button>
          ))}
          {!addingCat && (
            <button type="button" className="cat-chip cat-chip--add" onClick={() => setAddingCat(true)}>
              <Plus size={15} /> New
            </button>
          )}
        </div>
        {addingCat && (
          <div className="row gap-2" style={{ marginTop: 10 }}>
            <input
              className="input"
              placeholder="Category name"
              value={newCat}
              autoFocus
              maxLength={20}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitNewCategory();
                if (e.key === 'Escape') setAddingCat(false);
              }}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={commitNewCategory} disabled={!newCat.trim()}>
              Add
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setAddingCat(false); setNewCat(''); }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Reminder */}
      <div className="field">
        <label className="field__label" htmlFor="task-reminder">
          Reminder
        </label>
        <select
          id="task-reminder"
          className="select"
          value={reminderMinutes === null ? 'none' : String(reminderMinutes)}
          onChange={(e) =>
            setReminderMinutes(e.target.value === 'none' ? null : Number(e.target.value))
          }
        >
          {REMINDER_OPTIONS.map((o) => (
            <option key={o.label} value={o.value === null ? 'none' : String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
        {reminderMinutes !== null && !dueDate && (
          <div className="field__hint">Set a due date and time for the reminder to fire.</div>
        )}
      </div>

      {/* Repeat */}
      <div className="field">
        <label className="field__label" htmlFor="task-repeat">
          Repeat
        </label>
        <select
          id="task-repeat"
          className="select"
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value as RepeatType)}
        >
          {REPEAT_TYPES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {repeatType === 'custom' && (
          <div className="grid-2" style={{ marginTop: 10 }}>
            <input
              className="input"
              type="number"
              min={1}
              max={99}
              aria-label="Repeat every"
              value={repeatInterval}
              onChange={(e) => setRepeatInterval(Number(e.target.value))}
            />
            <select
              className="select"
              aria-label="Repeat unit"
              value={repeatUnit}
              onChange={(e) => setRepeatUnit(e.target.value as RepeatUnit)}
            >
              <option value="day">day(s)</option>
              <option value="week">week(s)</option>
              <option value="month">month(s)</option>
            </select>
          </div>
        )}
        {repeatType !== 'none' && !dueDate && (
          <div className="field__hint">Repeating tasks need a due date to schedule the next one.</div>
        )}
      </div>

      {/* Notes */}
      <div className="field">
        <label className="field__label" htmlFor="task-notes">
          Notes
        </label>
        <textarea
          id="task-notes"
          className="textarea"
          placeholder="Any extra details…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost btn--block" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
