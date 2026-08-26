import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FrameContext } from './components/layout/frame';
import { BottomNav } from './components/layout/BottomNav';
import { Fab } from './components/layout/Fab';
import { Toaster } from './components/ui/Toaster';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { useThemeSync } from './hooks/useTheme';
import { useReminderScheduler } from './hooks/useReminders';
import { HomeScreen } from './screens/HomeScreen';
import { AddEditTaskScreen } from './screens/AddEditTaskScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { CompletedScreen } from './screens/CompletedScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  useThemeSync();
  useReminderScheduler();

  const location = useLocation();
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on navigation.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const hideNav = location.pathname === '/add' || location.pathname.startsWith('/task');

  return (
    <div className="app-frame" ref={setFrame}>
      <FrameContext.Provider value={frame}>
        <div className="app-scroll" ref={scrollRef}>
          {/* Keyed remount per route gives a clean fade-in on navigation.
              Deliberately no AnimatePresence/exit here: `mode="wait"` could
              deadlock (new screen never mounts) if a nav fired mid-exit. */}
          <motion.div
            key={location.pathname}
            style={{ minHeight: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/add" element={<AddEditTaskScreen />} />
              <Route path="/task/:id" element={<TaskDetailScreen />} />
              <Route path="/task/:id/edit" element={<AddEditTaskScreen />} />
              <Route path="/calendar" element={<CalendarScreen />} />
              <Route path="/completed" element={<CompletedScreen />} />
              <Route path="/stats" element={<StatsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </div>

        {!hideNav && <BottomNav />}
        <Fab />
        <Toaster />
        <ConfirmDialog />
      </FrameContext.Provider>
    </div>
  );
}
