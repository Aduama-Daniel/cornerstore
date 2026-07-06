'use client';

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
/* eslint-disable @next/next/no-img-element */

export interface ToastOptions {
  /** Small product/media thumbnail shown at the left of the toast. */
  image?: string;
  /** Optional action rendered as a button, e.g. { label: 'View cart', href: '/cart' }. */
  action?: { label: string; href: string };
  /** Optional bold first line; the message renders below it. */
  title?: string;
}

interface Toast extends ToastOptions {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
  leaving?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    duration?: number,
    options?: ToastOptions
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const MAX_VISIBLE = 3;
const EXIT_MS = 220;

const TYPE_STYLES = {
  success: { ring: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500' },
  error: { ring: 'bg-red-100 text-red-600', bar: 'bg-red-500' },
  info: { ring: 'bg-brand-light text-brand-dark', bar: 'bg-brand' },
} as const;

function ToastIcon({ type }: { type: Toast['type'] }) {
  if (type === 'success') {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const pending = timers.current.get(id);
    if (pending) {
      clearTimeout(pending);
      timers.current.delete(id);
    }
    // Play the exit animation, then drop the toast.
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const addToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' = 'success',
      duration: number = 4000,
      options: ToastOptions = {}
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, type, duration, ...options }];
        // Keep the stack short — retire the oldest immediately.
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => removeToast(id), duration)
        );
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast stack: centred above the bottom edge on mobile, bottom-left on
          desktop (the chat launcher owns the bottom-right corner). */}
      <div
        aria-live="polite"
        className="cs-toast-stack pointer-events-none fixed inset-x-3 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:items-start"
      >
        {toasts.map((toast) => {
          const styles = TYPE_STYLES[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-black/5 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all duration-200 ${
                toast.leaving ? 'translate-y-2 opacity-0' : 'animate-toast-in'
              }`}
            >
              <div className="flex items-center gap-3 p-3.5 pr-2.5">
                {toast.image ? (
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-sand/40">
                    <img src={toast.image} alt="" className="h-full w-full object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${styles.ring}`}>
                      <ToastIcon type={toast.type} />
                    </span>
                  </span>
                ) : (
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.ring}`}>
                    <ToastIcon type={toast.type} />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  {toast.title && (
                    <p className="truncate text-sm font-bold text-contrast">{toast.title}</p>
                  )}
                  <p className={`text-sm leading-snug text-contrast ${toast.title ? 'text-neutral' : 'font-medium'}`}>
                    {toast.message}
                  </p>
                </div>

                {toast.action && (
                  <Link
                    href={toast.action.href}
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 rounded-full bg-contrast px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-contrast/85"
                  >
                    {toast.action.label}
                  </Link>
                )}

                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-full p-1.5 text-neutral/60 transition-colors hover:bg-sand/60 hover:text-contrast"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Auto-dismiss progress */}
              {toast.duration > 0 && !toast.leaving && (
                <span
                  className={`absolute bottom-0 left-0 h-0.5 ${styles.bar} animate-toast-progress`}
                  style={{ animationDuration: `${toast.duration}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
