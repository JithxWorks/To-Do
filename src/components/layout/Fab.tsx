import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';

/** App-level floating action button, shown on the Tasks and Calendar screens. */
export function Fab() {
  const navigate = useNavigate();
  const location = useLocation();
  const calendarDate = useUIStore((s) => s.calendarDate);

  const onTasks = location.pathname === '/';
  const onCalendar = location.pathname === '/calendar';
  const show = onTasks || onCalendar;

  const handleClick = () => {
    navigate(onCalendar ? `/add?date=${calendarDate}` : '/add');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="fab"
          className="fab"
          aria-label="Add task"
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 10 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 380 }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
