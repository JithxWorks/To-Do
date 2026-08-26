import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useEffect } from 'react';
import { useUIStore, type Toast } from '../../store/useUIStore';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info } as const;

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useUIStore((s) => s.removeToast);
  useEffect(() => {
    const id = window.setTimeout(() => remove(toast.id), 2600);
    return () => window.clearTimeout(id);
  }, [toast.id, remove]);

  const Icon = ICONS[toast.type];
  return (
    <motion.div
      className={`toast toast--${toast.type}`}
      role="status"
      layout
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 26, stiffness: 360 }}
      onClick={() => remove(toast.id)}
    >
      <Icon size={18} />
      <span>{toast.message}</span>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
