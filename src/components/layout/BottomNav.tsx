import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, CheckCircle2, ListTodo, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Tasks', Icon: ListTodo, end: true },
  { to: '/calendar', label: 'Calendar', Icon: CalendarDays, end: false },
  { to: '/completed', label: 'Done', Icon: CheckCircle2, end: false },
  { to: '/stats', label: 'Stats', Icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-dot"
                  className="nav-item__dot"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              <span className="nav-item__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
