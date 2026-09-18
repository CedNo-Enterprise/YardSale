"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import { addStopAction } from "@/lib/actions/itineraries";
import { emptyFormState } from "@/lib/actions/state";
import { SelectField } from "./fields";
import { FormMessage, SubmitButton } from "./form";
import { useActionNotice } from "./notifications";
import { button } from "./ui";

export interface RouteOption {
  id: string;
  name: string;
  date: string;
  alreadyHere: boolean;
}

export function AddToRoute({
  locale,
  saleId,
  options,
  labels,
}: {
  locale: Locale;
  saleId: string;
  options: RouteOption[];
  labels: { choose: string; add: string; saving: string; added: string };
}) {
  const [state, action] = useActionState(addStopAction, emptyFormState);
  useActionNotice(state, labels.added);
  const selectable = options.filter((option) => !option.alreadyHere);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="saleId" value={saleId} />

      <FormMessage error={state.error} />

      <SelectField id="itineraryId" name="itineraryId" label={labels.choose} required>
        {selectable.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </SelectField>

      <SubmitButton
        className={button.primary}
        pendingLabel={labels.saving}
        disabled={selectable.length === 0}
      >
        {labels.add}
      </SubmitButton>
    </form>
  );
}
