"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface Notice {
  id: number;
  message: string;
}

const NotifyContext = createContext<(message: string) => void>(() => {});

/**
 * Announces something that has just happened and does not need answering — a
 * stop added, a profile saved. Errors are not sent here: they belong beside the
 * form that produced them, where the fields to fix are.
 */
export function useNotify() {
  return useContext(NotifyContext);
}

/**
 * Fires a notice when a Server Action reports success. `useActionState` hands
 * back a fresh state object per submission, so re-submitting the same form
 * announces again while an unrelated re-render does not.
 */
export function useActionNotice(state: { ok?: boolean }, message: string) {
  const notify = useNotify();

  useEffect(() => {
    if (state.ok) notify(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

const DISMISS_AFTER = 5000;

export function NotificationProvider({
  children,
  dismissLabel,
}: {
  children: ReactNode;
  dismissLabel: string;
}) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  const notify = useCallback(
    (message: string) => {
      const id = nextId.current++;
      setNotices((current) => [...current, { id, message }]);
      timers.current.push(setTimeout(() => dismiss(id), DISMISS_AFTER));
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <NotifyContext.Provider value={notify}>
      {children}

      {/* Polite, so a screen reader finishes what it is saying first. The
          region stays mounted and empty so additions are announced. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-6"
      >
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="notice pointer-events-auto flex max-w-sm items-start gap-3 rounded-tab border border-moss/40 bg-card px-4 py-3 shadow-lg shadow-ink/10"
          >
            <Tick />
            <p className="text-sm text-ink">{notice.message}</p>
            <button
              type="button"
              onClick={() => dismiss(notice.id)}
              className="-mr-1 -mt-0.5 shrink-0 rounded-tab p-1 text-dusk transition-colors hover:text-ink"
            >
              <span className="sr-only">{dismissLabel}</span>
              <svg viewBox="0 0 14 14" aria-hidden className="h-3.5 w-3.5">
                <path
                  d="M2.5 2.5 11.5 11.5M11.5 2.5 2.5 11.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-moss">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="M4.75 8.25 6.9 10.4l4.35-4.8"
        fill="none"
        stroke="var(--card)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
