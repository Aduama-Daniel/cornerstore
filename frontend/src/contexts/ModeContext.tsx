'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { type Mode, MODE_COOKIE, MODE_CONFIG, normalizeMode } from '@/lib/modes';

interface ModeContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

const ONE_YEAR = 60 * 60 * 24 * 365;

function applyAccentVars(mode: Mode) {
  if (typeof document === 'undefined') return;
  const cfg = MODE_CONFIG[mode];
  const s = document.body.style;
  s.setProperty('--accent', cfg.accentRgb);
  s.setProperty('--accent-dark', cfg.accentDark);
  s.setProperty('--accent-light', cfg.accentLight);
  s.setProperty('--accent-soft', cfg.accentSoft);
}

export function ModeProvider({ initialMode, children }: { initialMode: Mode; children: ReactNode }) {
  const router = useRouter();
  const [mode, setModeState] = useState<Mode>(normalizeMode(initialMode));
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [isPending, startTransition] = useTransition();

  const setMode = useCallback(
    (next: Mode) => {
      const value = normalizeMode(next);
      if (value === mode) return;
      document.cookie = `${MODE_COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      applyAccentVars(value); // instant re-tint before the server refresh lands
      setPendingMode(value); // shows the transition loader
      setModeState(value);
      startTransition(() => router.refresh());
    },
    [mode, router],
  );

  // Dismiss the loader once the refresh settles (short hold) or after a hard cap, so a
  // slow/unreachable backend can never trap the user behind the transition curtain.
  useEffect(() => {
    if (!pendingMode) return;
    const delay = isPending ? 1100 : 420;
    const t = window.setTimeout(() => setPendingMode(null), delay);
    return () => window.clearTimeout(t);
  }, [pendingMode, isPending]);

  const toggleMode = useCallback(() => {
    setMode(mode === 'fashion' ? 'electronics' : 'fashion');
  }, [mode, setMode]);

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
      <ModeTransition active={pendingMode !== null} mode={pendingMode ?? mode} />
    </ModeContext.Provider>
  );
}

function ModeTransition({ active, mode }: { active: boolean; mode: Mode }) {
  const cfg = MODE_CONFIG[mode];
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-contrast transition-opacity duration-300 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {active && (
        <div className="animate-mode-pop px-6 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-white/55">Cornerstore</p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl" style={{ color: cfg.accent }}>
            {cfg.label}
          </p>
          <div className="mx-auto mt-6 h-0.5 w-44 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-1/3 animate-loadbar rounded-full" style={{ backgroundColor: cfg.accent }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return ctx;
}
