import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastItem } from '../types';
import { toastListeners } from '../lib/toast';

export { toast } from '../lib/toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastItem['type'], title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((t: ToastItem) => {
    setToasts(prev => [...prev.slice(-3), t]); // Keep max 4 toasts
    setTimeout(() => {
      removeToast(t.id);
    }, 4000);
  }, [removeToast]);

  useEffect(() => {
    toastListeners.add(addToast);
    return () => {
      toastListeners.delete(addToast);
    };
  }, [addToast]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info', title?: string) => {
    addToast({
      id: `toast_${Date.now()}_${Math.random()}`,
      type,
      message,
      title
    });
  }, [addToast]);

  const contextValue: ToastContextType = {
    showToast,
    success: (msg, title) => showToast(msg, 'success', title),
    error: (msg, title) => showToast(msg, 'error', title),
    info: (msg, title) => showToast(msg, 'info', title),
    warning: (msg, title) => showToast(msg, 'warning', title),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => {
          let icon = <Info size={18} color="#0284c7" />;
          let borderColor = '#bae6fd';
          let bgColor = '#ffffff';

          if (t.type === 'success') {
            icon = <CheckCircle2 size={18} color="#059669" />;
            borderColor = '#a7f3d0';
          } else if (t.type === 'error') {
            icon = <AlertCircle size={18} color="#e11d48" />;
            borderColor = '#fecdd3';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle size={18} color="#d97706" />;
            borderColor = '#fde68a';
          }

          return (
            <div 
              key={t.id} 
              className="toast-card"
              style={{
                borderColor,
                backgroundColor: bgColor
              }}
            >
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {t.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
