import type { ToastItem } from '../types';

type ToastListener = (toast: ToastItem) => void;
export const toastListeners = new Set<ToastListener>();

export const toast = {
  success: (message: string, title?: string) => {
    toastListeners.forEach(l => l({ id: `toast_${Date.now()}_${Math.random()}`, type: 'success', message, title }));
  },
  error: (message: string, title?: string) => {
    toastListeners.forEach(l => l({ id: `toast_${Date.now()}_${Math.random()}`, type: 'error', message, title }));
  },
  info: (message: string, title?: string) => {
    toastListeners.forEach(l => l({ id: `toast_${Date.now()}_${Math.random()}`, type: 'info', message, title }));
  },
  warning: (message: string, title?: string) => {
    toastListeners.forEach(l => l({ id: `toast_${Date.now()}_${Math.random()}`, type: 'warning', message, title }));
  }
};
