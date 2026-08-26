import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskOptionsSheet } from './TaskOptionsSheet';

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [optionsTask, setOptionsTask] = useState<Task | null>(null);

  return (
    <>
      <ul className="task-list">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                layout: { type: 'spring', damping: 30, stiffness: 320 },
                duration: 0.22,
              }}
            >
              <TaskCard task={t} onOpenOptions={setOptionsTask} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <TaskOptionsSheet task={optionsTask} onClose={() => setOptionsTask(null)} />
    </>
  );
}
