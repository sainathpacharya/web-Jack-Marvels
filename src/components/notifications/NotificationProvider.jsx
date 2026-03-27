import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

const DEFAULT_DURATION = 3000;

function createToast(input) {
  if (typeof input === 'string') {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: 'info',
      message: input,
      duration: DEFAULT_DURATION,
    };
  }
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: input?.type || 'info',
    message: input?.message || 'Something happened',
    duration: typeof input?.duration === 'number' ? input.duration : DEFAULT_DURATION,
  };
}

function ToastItem({ toast, onClose }) {
  const theme =
    toast.type === 'error'
      ? 'bg-rose-700'
      : toast.type === 'success'
        ? 'bg-emerald-700'
        : 'bg-slate-700';

  return (
    <div className={`pointer-events-auto rounded-lg px-4 py-2 text-sm text-white shadow-lg ${theme}`}>
      <div className="flex items-center gap-2">
        <span>{toast.message}</span>
        <button
          type="button"
          className="rounded bg-white/15 px-2 py-0.5 text-xs hover:bg-white/25"
          onClick={() => onClose(toast.id)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const closeToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (input) => {
      const nextToast = createToast(input);
      setToasts((current) => [...current, nextToast]);
      window.setTimeout(() => closeToast(nextToast.id), nextToast.duration);
      return nextToast.id;
    },
    [closeToast]
  );

  const value = useMemo(
    () => ({
      notify,
      success: (message, duration) => notify({ type: 'success', message, duration }),
      error: (message, duration) => notify({ type: 'error', message, duration }),
      info: (message, duration) => notify({ type: 'info', message, duration }),
    }),
    [notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[1000] flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={closeToast} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return context;
}
