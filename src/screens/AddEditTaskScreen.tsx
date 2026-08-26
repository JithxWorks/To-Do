import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { TaskDraft } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { useUIStore } from '../store/useUIStore';
import { TaskForm } from '../components/task/TaskForm';
import { TopBar } from '../components/layout/TopBar';
import { EmptyState } from '../components/ui/EmptyState';

export function AddEditTaskScreen() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const toast = useUIStore((s) => s.toast);

  const editing = Boolean(id);
  const existing = id ? tasks.find((t) => t.id === id) : undefined;

  const goBack = () => navigate(-1);

  if (editing && !existing) {
    return (
      <div className="screen screen--plain">
        <TopBar title="Edit task" onBack={() => navigate('/')} />
        <EmptyState emoji="🔍" title="Task not found" sub="This task may have been deleted." />
      </div>
    );
  }

  const initial: TaskDraft | undefined = existing
    ? {
        title: existing.title,
        description: existing.description ?? '',
        notes: existing.notes ?? '',
        priority: existing.priority,
        category: existing.category,
        dueDate: existing.dueDate,
        dueTime: existing.dueTime,
        reminderMinutes: existing.reminderMinutes,
        repeat: existing.repeat,
      }
    : undefined;

  const prefillDate = params.get('date') ?? undefined;

  function handleSubmit(draft: TaskDraft) {
    if (editing && existing) {
      updateTask(existing.id, draft);
      toast('Changes saved', 'success');
    } else {
      addTask(draft);
      toast('Task added', 'success');
    }
    goBack();
  }

  return (
    <motion.div
      className="screen screen--plain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <TopBar title={editing ? 'Edit task' : 'New task'} onBack={goBack} />
      <TaskForm
        initial={initial}
        initialDueDate={prefillDate}
        submitLabel={editing ? 'Save changes' : 'Add task'}
        onSubmit={handleSubmit}
        onCancel={goBack}
      />
    </motion.div>
  );
}
