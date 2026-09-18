"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import { createSaleAction } from "@/lib/actions/sales";
import { emptyFormState } from "@/lib/actions/state";
import { DateField, TextAreaField, TextField } from "./fields";
import { FormMessage, SubmitButton } from "./form";
import { button } from "./ui";

export function SaleForm({
  locale,
  sellerId,
  defaultDate,
  labels,
  children,
}: {
  locale: Locale;
  sellerId: string;
  defaultDate: string;
  labels: {
    name: string;
    namePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    optional: string;
    date: string;
    submit: string;
    saving: string;
  };
  /** The address fieldset, rendered on the server so it can be translated. */
  children: React.ReactNode;
}) {
  const [state, action] = useActionState(createSaleAction, emptyFormState);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="sellerId" value={sellerId} />

      <FormMessage error={state.error} />

      <TextField
        id="name"
        name="name"
        label={labels.name}
        placeholder={labels.namePlaceholder}
        required
        maxLength={64}
      />

      <DateField id="date" name="date" withTime label={labels.date} required defaultValue={defaultDate} />

      <TextAreaField
        id="description"
        name="description"
        label={labels.description}
        placeholder={labels.descriptionPlaceholder}
        optionalLabel={labels.optional}
        rows={4}
      />

      {children}

      <SubmitButton className={`${button.primary} self-start`} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
