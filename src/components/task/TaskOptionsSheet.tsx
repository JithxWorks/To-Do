import { CheckCircle2, Circle, Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useUIStore } from '../../store/useUIStore';
import { Sheet } from '../ui/Sheet';

export function TaskOptionsSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const navigate = useNavigate();
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const confirm = useUIStore((s) => s.confirm);
  const toast = useUIStore((s) => s.toast);

  return (
    <Sheet open={!!task} onClose={onClose} title={task?.title}>
      {task && (
        <div className="sheet-list">
          <button
            className="sheet-item"
            onClick={() => {
              onClose();
              navigate(`/task/${task.id}`);
            }}
          >
            <Eye size={20} />
            View details
          </button>
          <button
            className="sheet-item"
            onClick={() => {
              onClose();
              navigate(`/task/${task.id}/edit`);
            }}
          >
            <Pencil size={20} />
            Edit task
          </button>
          <button
            className="sheet-item"
            onClick={() => {
              toggleComplete(task.id);
              toast(task.completed ? 'Marked as active' : 'Task completed 🎉', task.completed ? 'info' : 'success');
              onClose();
            }}
          >
            {task.completed ? <Circle size={20} /> : <CheckCircle2 size={20} />}
            {task.completed ? 'Mark as active' : 'Mark as complete'}
          </button>
          <button
            className="sheet-item"
            onClick={() => {
              duplicateTask(task.id);
              toast('Task duplicated', 'success');
              onClose();
            }}
          >
            <Copy size={20} />
            Duplicate
          </button>
          <div className="sheet-divider" />
          <button
            className="sheet-item sheet-item--danger"
            onClick={async () => {
              onClose();
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
            }}
          >
            <Trash2 size={20} />
            Delete task
          </button>
        </div>
      )}
    </Sheet>
  );
}
