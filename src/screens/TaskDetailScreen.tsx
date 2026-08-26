import { motion } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  PencilLine,
  Pencil,
  Repeat,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskStore } from '../store/useTaskStore';
import { useUIStore } from '../store/useUIStore';
import { TopBar } from '../components/layout/TopBar';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryBadge, PriorityBadge } from '../components/task/Badges';
import { REMINDER_OPTIONS } from '../lib/constants';
import { formatDateLong, formatTimeLabel, formatTimestamp, isOverdue } from '../lib/date';
import { repeatLabel } from '../lib/recurrence';

function reminderText(minutes: number | null): string {
  if (minutes == null) return 'No reminder';
  const opt = REMINDER_OPTIONS.find((o) => o.value === minutes);
  if (opt && opt.value !== null) return opt.label;
  if (minutes === 0) return 'At time of task';
  if (minutes % 1440 === 0) return `${minutes / 1440} day(s) before`;
  if (minutes % 60 === 0) return `${minutes / 60} hour(s) before`;
  return `${minutes} minutes before`;
}

function Row({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="detail-row">
      <span className="detail-row__icon">{icon}</span>
      <div className="grow">
        <div className="detail-row__label">{label}</div>
        <div className="detail-row__value" style={danger ? { color: 'var(--danger)' } : undefined}>
          {value}
        </div>
      </div>
    </div>
  );
}

export function TaskDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === id));
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const confirm = useUIStore((s) => s.confirm);
  const toast = useUIStore((s) => s.toast);

  if (!task) {
    return (
      <div className="screen screen--plain">
        <TopBar title="Task" onBack={() => navigate('/')} />
        <EmptyState emoji="🔍" title="Task not found" sub="This task may have been deleted." />
      </div>
    );
  }

  const overdue = isOverdue(task);

  const handleToggle = () => {
    toggleComplete(task.id);
    toast(task.completed ? 'Marked as active' : 'Task completed 🎉', task.completed ? 'info' : 'success');
  };

  const handleDuplicate = () => {
    const copy = duplicateTask(task.id);
    toast('Task duplicated', 'success');
    if (copy) navigate(`/task/${copy.id}`, { replace: true });
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete task?',
      message: `"${task.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) {
      deleteTask(task.id);
      toast('Task deleted', 'info');
      navigate('/');
    }
  };

  return (
    <motion.div
      className="screen screen--plain"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <TopBar
        title="Details"
        onBack={() => navigate(-1)}
        right={
          <button
            className="icon-btn"
            aria-label="Edit task"
            onClick={() => navigate(`/task/${task.id}/edit`)}
          >
            <Pencil size={20} />
          </button>
        }
      />

      {task.completed && (
        <div className="completed-banner">
          <CheckCircle2 size={18} />
          Completed{task.completedAt ? ` · ${formatTimestamp(task.completedAt)}` : ''}
        </div>
      )}

      <h1 className="detail-title">{task.title}</h1>
      <div className="detail-badges">
        <PriorityBadge priority={task.priority} />
        <CategoryBadge categoryId={task.category} />
      </div>

      {task.description && (
        <div className="detail-section">
          <div className="detail-row__label" style={{ marginBottom: 6 }}>
            Description
          </div>
          <div className="detail-note">{task.description}</div>
        </div>
      )}

      <div className="detail-section">
        <Row
          icon={<CalendarDays size={19} />}
          label="Due date"
          value={task.dueDate ? formatDateLong(task.dueDate) : 'No due date'}
          danger={overdue}
        />
        {task.dueDate && (
          <Row
            icon={<Clock size={19} />}
            label="Due time"
            value={task.dueTime ? formatTimeLabel(task.dueTime) : 'Any time'}
          />
        )}
        <Row icon={<Bell size={19} />} label="Reminder" value={reminderText(task.reminderMinutes)} />
        <Row icon={<Repeat size={19} />} label="Repeat" value={repeatLabel(task.repeat)} />
      </div>

      {task.notes && (
        <div className="detail-section">
          <Row icon={<FileText size={19} />} label="Notes" value={<span className="detail-note">{task.notes}</span>} />
        </div>
      )}

      <div className="detail-section">
        <Row icon={<Sparkles size={19} />} label="Created" value={formatTimestamp(task.createdAt)} />
        <Row icon={<PencilLine size={19} />} label="Last modified" value={formatTimestamp(task.updatedAt)} />
      </div>

      <button
        className={`btn btn--block ${task.completed ? '' : 'btn--primary'}`}
        onClick={handleToggle}
        style={{ marginTop: 4 }}
      >
        {task.completed ? (
          <>
            <RotateCcw size={18} /> Mark as active
          </>
        ) : (
          <>
            <CheckCircle2 size={18} /> Mark as complete
          </>
        )}
      </button>

      <div className="grid-2" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => navigate(`/task/${task.id}/edit`)}>
          <Pencil size={17} /> Edit
        </button>
        <button className="btn" onClick={handleDuplicate}>
          <Copy size={17} /> Duplicate
        </button>
      </div>

      <button className="btn btn--danger btn--block" onClick={handleDelete} style={{ marginTop: 12 }}>
        <Trash2 size={17} /> Delete task
      </button>
    </motion.div>
  );
}
