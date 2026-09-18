"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { StopStatus } from "@/lib/api/types";
import { removeStopAction, stopStatusAction } from "@/lib/actions/itineraries";
import { emptyFormState } from "@/lib/actions/state";
import { ConfirmButton, type ConfirmLabels } from "./confirm-button";
import { FormMessage, SubmitButton } from "./form";
import { button } from "./ui";

export interface StopActionLabels {
  visited: string;
  skipped: string;
  planned: string;
  remove: string;
  confirm: ConfirmLabels;
}

/**
 * The controls on a single stop. Marking one off is the thing people do while
 * standing on a driveway, so each is a one-tap submit rather than a menu.
 */
export function StopActions({
  locale,
  itineraryId,
  saleId,
  status,
  labels,
}: {
  locale: Locale;
  itineraryId: string;
  saleId: string;
  status: StopStatus;
  labels: StopActionLabels;
}) {
  const [statusState, changeStatus] = useActionState(stopStatusAction, emptyFormState);
  const [removeState, remove] = useActionState(removeStopAction, emptyFormState);

  const error = statusState.error ?? removeState.error;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={changeStatus} className="flex flex-wrap gap-2">
          <input type="hidden" name="lang" value={locale} />
          <input type="hidden" name="itineraryId" value={itineraryId} />
          <input type="hidden" name="saleId" value={saleId} />

          {status !== "visited" && (
            <SubmitButton name="status" value="visited" className={button.quiet}>
              {labels.visited}
            </SubmitButton>
          )}
          {status !== "skipped" && (
            <SubmitButton name="status" value="skipped" className={button.quiet}>
              {labels.skipped}
            </SubmitButton>
          )}
          {status !== "planned" && (
            <SubmitButton name="status" value="planned" className={button.quiet}>
              {labels.planned}
            </SubmitButton>
          )}
        </form>

        <form action={remove}>
          <input type="hidden" name="lang" value={locale} />
          <input type="hidden" name="itineraryId" value={itineraryId} />
          <input type="hidden" name="saleId" value={saleId} />
          <ConfirmButton className={button.danger} labels={labels.confirm}>
            {labels.remove}
          </ConfirmButton>
        </form>
      </div>

      <FormMessage error={error} />
    </div>
  );
}
