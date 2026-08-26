import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';

export function ConfirmDialog() {
  const confirmState = useUIStore((s) => s.confirmState);
  const resolveConfirm = useUIStore((s) => s.resolveConfirm);
  const { open, title, message, confirmLabel, cancelLabel, danger } = confirmState;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolveConfirm(false);
      if (e.key === 'Enter') resolveConfirm(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, resolveConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="scrim scrim--center"
          onClick={() => resolveConfirm(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          >
            <div className="dialog__title">{title}</div>
            {message && <div className="dialog__msg">{message}</div>}
            <div className="dialog__actions">
              <button className="btn btn--ghost btn--block" onClick={() => resolveConfirm(false)}>
                {cancelLabel}
              </button>
              <button
                className={`btn btn--block ${danger ? 'btn--danger-solid' : 'btn--primary'}`}
                onClick={() => resolveConfirm(true)}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
