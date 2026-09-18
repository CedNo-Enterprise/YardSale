"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { button } from "./ui";

export interface ConfirmLabels {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
}

/**
 * Asks before doing something that cannot be undone, in the app's own voice.
 *
 * Built on the native `<dialog>` with `showModal()`, which brings focus
 * trapping, Escape-to-close and an inert background without hand-rolling any of
 * it. The trigger is a plain button; confirming submits the form it sits in, so
 * the Server Action behind that form is reached the same way as any other.
 */
export function ConfirmButton({
  className,
  children,
  labels,
  pendingLabel,
}: {
  className: string;
  children: React.ReactNode;
  labels: ConfirmLabels;
  pendingLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();
  // A route page renders one of these per stop, so the id has to be unique.
  const titleId = useId();

  function confirm() {
    dialog.current?.close();
    // Submitting the owning form rather than calling the action directly keeps
    // the hidden fields, the pending state and progressive behaviour intact.
    trigger.current?.form?.requestSubmit();
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() => dialog.current?.showModal()}
        className={className}
      >
        {pending && pendingLabel ? pendingLabel : children}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="confirm-dialog max-w-[min(26rem,calc(100vw-2rem))] rounded-tab border border-haze bg-card p-6 text-ink shadow-2xl shadow-ink/20"
      >
        <h2 id={titleId} className="display text-xl text-ink">
          {labels.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{labels.body}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {/* Cancel takes focus: the safe choice should be the one a stray
              Return key lands on. */}
          <button
            type="button"
            autoFocus
            onClick={() => dialog.current?.close()}
            className={button.secondary}
          >
            {labels.cancel}
          </button>
          <button type="button" onClick={confirm} className={button.destructive}>
            {labels.confirm}
          </button>
        </div>
      </dialog>
    </>
  );
}
