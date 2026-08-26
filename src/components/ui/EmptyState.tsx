import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  emoji?: string;
  icon?: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, icon, title, sub, action }: Props) {
  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {icon ? (
        <div className="empty__icon">{icon}</div>
      ) : (
        <div className="empty__emoji" aria-hidden>
          {emoji}
        </div>
      )}
      <div className="empty__title">{title}</div>
      {sub && <div className="empty__sub">{sub}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </motion.div>
  );
}
