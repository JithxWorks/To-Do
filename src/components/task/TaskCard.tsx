import { motion, type PanInfo } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  FileText,
  Pencil,
  Repeat,
  Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useUIStore } from '../../store/useUIStore';
import { dueLabel, isOverdue } from '../../lib/date';
import { isRecurring } from '../../lib/recurrence';
import { CategoryBadge, PriorityBadge } from './Badges';

const REVEAL = 150;

function vibrate(ms: number) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

export function TaskCard({
  task,
  onOpenOptions,
}: {
  task: Task;
  onOpenOptions: (task: Task) => void;
}) {
  const navigate = useNavigate();
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const confirm = useUIStore((s) => s.confirm);
  const toast = useUIStore((s) => s.toast);

  const [snapped, setSnapped] = useState(false);
  const movedRef = useRef(false);
  const longPressFired = useRef(false);
  const timerRef = useRef<number | null>(null);

  const overdue = isOverdue(task);
  const due = dueLabel(task);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPointerDown = () => {
    movedRef.current = false;
    longPressFired.current = false;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (!movedRef.current) {
        longPressFired.current = true;
        vibrate(8);
        onOpenOptions(task);
      }
    }, 480);
  };

  const onDrag = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 6) {
      movedRef.current = true;
      clearTimer();
    }
  };

  const handleComplete = () => {
    vibrate(10);
    toggleComplete(task.id);
    toast(task.completed ? 'Marked as active' : 'Task completed 🎉', task.completed ? 'info' : 'success');
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    clearTimer();
    const { offset, velocity } = info;
    if (snapped) {
      setSnapped(!(offset.x > 40 || velocity.x > 400));
      return;
    }
    if (offset.x > 80 || (offset.x > 40 && velocity.x > 500)) {
      setSnapped(false);
      handleComplete();
    } else if (offset.x < -70) {
      setSnapped(true);
    } else {
      setSnapped(false);
    }
  };

  const handleOpen = () => {
    if (movedRef.current || longPressFired.current) return;
    if (snapped) {
      setSnapped(false);
      return;
    }
    navigate(`/task/${task.id}`);
  };

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleComplete();
  };

  const handleEdit = () => {
    setSnapped(false);
    navigate(`/task/${task.id}/edit`);
  };

  const handleDelete = async () => {
    setSnapped(false);
    const ok = await confirm({
      title: 'Delete task?',
      message: `"${task.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) {
      deleteTask(task.id);
      toast('Task deleted', 'info');
    }
  };

  return (
    <div className="swipe">
      <div className="swipe__complete-hint">
        <Check size={20} />
        {task.completed ? 'Reactivate' : 'Complete'}
      </div>
      <div className="swipe__actions">
        <button className="swipe__action swipe__action--edit" onClick={handleEdit} aria-label="Edit task">
          <Pencil size={18} />
          Edit
        </button>
        <button className="swipe__action swipe__action--delete" onClick={handleDelete} aria-label="Delete task">
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      <motion.div
        className={`task-card ${task.completed ? 'task-card--completed' : ''}`}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -REVEAL, right: 90 }}
        dragElastic={0.12}
        animate={{ x: snapped ? -REVEAL : 0 }}
        transition={{ type: 'spring', damping: 34, stiffness: 380 }}
        onPointerDown={onPointerDown}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onDragStart={clearTimer}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      >
        <button
          className="task-card__hit"
          onClick={handleCheck}
          aria-label={task.completed ? 'Mark as active' : 'Mark as complete'}
        >
          <span className={`task-card__check ${task.completed ? 'task-card__check--done' : ''}`}>
            <Check size={15} strokeWidth={3} />
          </span>
        </button>

        <div className="task-card__body" onClick={handleOpen}>
          <div className="task-card__title">{task.title}</div>
          {task.description && <div className="task-card__desc">{task.description}</div>}

          <div className="task-card__meta">
            <PriorityBadge priority={task.priority} showLabel={false} />
            <CategoryBadge categoryId={task.category} />
            {due && (
              <span className={`task-card__due ${overdue ? 'task-card__due--overdue' : ''}`}>
                {overdue ? <AlertTriangle size={13} /> : <Clock size={13} />}
                {overdue ? `Overdue · ${due}` : due}
              </span>
            )}
            <span className="task-card__icons">
              {task.reminderMinutes != null && <Bell size={13} aria-label="Reminder set" />}
              {isRecurring(task) && <Repeat size={13} aria-label="Repeats" />}
              {task.notes && <FileText size={13} aria-label="Has notes" />}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
