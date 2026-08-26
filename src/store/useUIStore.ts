import { create } from 'zustand';
import { todayKey } from '../lib/date';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface UIState {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
  confirmState: ConfirmState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;
  /** Currently selected day on the Calendar screen ('yyyy-MM-dd'). */
  calendarDate: string;
  setCalendarDate: (date: string) => void;
}

let toastSeq = 1;

const CLOSED_CONFIRM: ConfirmState = {
  open: false,
  title: '',
  message: undefined,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
  resolve: null,
};

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  toast: (message, type = 'info') => {
    const id = toastSeq++;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  confirmState: CLOSED_CONFIRM,
  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        confirmState: {
          open: true,
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
          danger: false,
          ...options,
          resolve,
        },
      });
    }),
  resolveConfirm: (result) => {
    const { confirmState } = get();
    confirmState.resolve?.(result);
    set({ confirmState: CLOSED_CONFIRM });
  },

  calendarDate: todayKey(),
  setCalendarDate: (calendarDate) => set({ calendarDate }),
}));
