"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit buttons read the pending state of the form they sit in, so every form
 * in the app reports that it is working without each page wiring it up.
 *
 * Anything that needs asking first uses `ConfirmButton` instead. There is no
 * `confirm` option here on purpose: it used to call `window.confirm`, which
 * cannot be translated or styled and looks like the browser talking rather than
 * the app.
 */
export function SubmitButton({
  children,
  className,
  pendingLabel,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  className: string;
  pendingLabel?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={className}
      {...props}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/**
 * Something went wrong with this form. It stays next to the fields rather than
 * going to a notice, because fixing it means coming back here — a message that
 * slides away from the corner of the screen would take the instructions with it.
 */
export function FormMessage({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p role="alert" className="rounded-tab border border-flag/40 bg-flag/5 px-3 py-2 text-sm text-flag">
      {error}
    </p>
  );
}
