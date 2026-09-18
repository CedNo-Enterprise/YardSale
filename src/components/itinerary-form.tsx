"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/i18n/config";
import { createItineraryAction } from "@/lib/actions/itineraries";
import { emptyFormState } from "@/lib/actions/state";
import { CheckboxField, DateField, TextAreaField, TextField } from "./fields";
import { FormMessage, SubmitButton } from "./form";
import { button, hint, panel } from "./ui";

/** Parliament Hill — a landmark people recognise, and the middle of the map. */
const OTTAWA = { latitude: 45.4215, longitude: -75.6972 };

export interface SaleChoice {
  id: string;
  name: string;
  city: string;
  when: string;
}

export interface ItineraryFormLabels {
  name: string;
  namePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  optional: string;
  date: string;
  start: string;
  startHint: string;
  latitude: string;
  longitude: string;
  useOttawa: string;
  pick: string;
  pickHint: string;
  noSales: string;
  submit: string;
  saving: string;
}

export function ItineraryForm({
  locale,
  sales,
  defaultDate,
  labels,
}: {
  locale: Locale;
  sales: SaleChoice[];
  defaultDate: string;
  labels: ItineraryFormLabels;
}) {
  const [state, action] = useActionState(createItineraryAction, emptyFormState);
  const [start, setStart] = useState({ latitude: "", longitude: "" });

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="lang" value={locale} />

      <FormMessage error={state.error} />

      <TextField
        id="name"
        name="name"
        label={labels.name}
        placeholder={labels.namePlaceholder}
        required
        maxLength={64}
      />

      <DateField id="date" name="date" label={labels.date} required defaultValue={defaultDate} />

      <TextAreaField
        id="description"
        name="description"
        label={labels.description}
        placeholder={labels.descriptionPlaceholder}
        optionalLabel={labels.optional}
        maxLength={500}
      />

      <fieldset className="border-t border-haze pt-5">
        <legend className="display pr-3 text-lg text-ink">{labels.start}</legend>
        <p className={`${hint} mt-2 max-w-[58ch] leading-relaxed`}>{labels.startHint}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            id="startLatitude"
            name="startLatitude"
            label={labels.latitude}
            inputMode="decimal"
            value={start.latitude}
            onChange={(event) => setStart({ ...start, latitude: event.target.value })}
            placeholder="45.4215"
          />
          <TextField
            id="startLongitude"
            name="startLongitude"
            label={labels.longitude}
            inputMode="decimal"
            value={start.longitude}
            onChange={(event) => setStart({ ...start, longitude: event.target.value })}
            placeholder="-75.6972"
          />
        </div>

        <button
          type="button"
          className={`${button.quiet} mt-3`}
          onClick={() =>
            setStart({ latitude: String(OTTAWA.latitude), longitude: String(OTTAWA.longitude) })
          }
        >
          {labels.useOttawa}
        </button>
      </fieldset>

      <fieldset className="border-t border-haze pt-5">
        <legend className="display pr-3 text-lg text-ink">{labels.pick}</legend>
        <p className={`${hint} mt-2 max-w-[58ch] leading-relaxed`}>{labels.pickHint}</p>

        {sales.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">{labels.noSales}</p>
        ) : (
          <ul className={`${panel} mt-4 max-h-96 space-y-0.5 overflow-y-auto p-1.5`}>
            {sales.map((sale) => (
              <li key={sale.id}>
                <CheckboxField
                  id={`sale-${sale.id}`}
                  name="saleIds"
                  value={sale.id}
                  label={sale.name}
                  description={`${sale.when} — ${sale.city}`}
                />
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <SubmitButton className={`${button.primary} self-start`} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
