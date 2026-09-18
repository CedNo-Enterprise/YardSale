"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import { addStopAction, reorderStopsAction, updateItineraryAction } from "@/lib/actions/itineraries";
import { emptyFormState } from "@/lib/actions/state";
import type { SaleChoice } from "./itinerary-form";
import { DateField, SelectField, TextAreaField, TextField } from "./fields";
import { FormMessage, SubmitButton } from "./form";
import { useActionNotice } from "./notifications";
import { button, hint, label as labelClass } from "./ui";

export function ReorderStops({
  locale,
  itineraryId,
  labels,
}: {
  locale: Locale;
  itineraryId: string;
  labels: {
    heading: string;
    hint: string;
    start: string;
    latitude: string;
    longitude: string;
    optional: string;
    submit: string;
    saving: string;
    done: string;
  };
}) {
  const [state, action] = useActionState(reorderStopsAction, emptyFormState);
  useActionNotice(state, labels.done);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="itineraryId" value={itineraryId} />

      <div>
        <h3 className="display text-lg text-ink">{labels.heading}</h3>
        <p className={`${hint} mt-1.5 leading-relaxed`}>{labels.hint}</p>
      </div>

      <FormMessage error={state.error} />

      {/* A pair of bare coordinates says nothing on its own, so the legend
          names what they are. A screen reader reads it with each field. */}
      <fieldset>
        <legend className={labelClass}>{labels.start}</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <TextField
            id="reorderLatitude"
            name="startLatitude"
            label={labels.latitude}
            optionalLabel={labels.optional}
            inputMode="decimal"
          />
          <TextField
            id="reorderLongitude"
            name="startLongitude"
            label={labels.longitude}
            optionalLabel={labels.optional}
            inputMode="decimal"
          />
        </div>
      </fieldset>

      <SubmitButton className={`${button.secondary} self-start`} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}

export function AddStopToRoute({
  locale,
  itineraryId,
  sales,
  labels,
}: {
  locale: Locale;
  itineraryId: string;
  sales: SaleChoice[];
  labels: {
    heading: string;
    hint: string;
    choose: string;
    submit: string;
    saving: string;
    added: string;
    none: string;
  };
}) {
  const [state, action] = useActionState(addStopAction, emptyFormState);
  useActionNotice(state, labels.added);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="itineraryId" value={itineraryId} />

      <div>
        <h3 className="display text-lg text-ink">{labels.heading}</h3>
        <p className={`${hint} mt-1.5 leading-relaxed`}>{labels.hint}</p>
      </div>

      <FormMessage error={state.error} />

      {sales.length === 0 ? (
        <p className="text-sm text-ink-soft">{labels.none}</p>
      ) : (
        <>
          <SelectField id="saleId" name="saleId" label={labels.choose} required>
            {sales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {sale.name} — {sale.when}
              </option>
            ))}
          </SelectField>

          <SubmitButton className={`${button.secondary} self-start`} pendingLabel={labels.saving}>
            {labels.submit}
          </SubmitButton>
        </>
      )}
    </form>
  );
}

export function RouteDetailsForm({
  locale,
  itineraryId,
  defaults,
  labels,
}: {
  locale: Locale;
  itineraryId: string;
  defaults: { name: string; description: string; date: string; latitude: string; longitude: string };
  labels: {
    heading: string;
    name: string;
    description: string;
    optional: string;
    date: string;
    start: string;
    startHint: string;
    latitude: string;
    longitude: string;
    submit: string;
    saving: string;
    done: string;
  };
}) {
  const [state, action] = useActionState(updateItineraryAction, emptyFormState);
  useActionNotice(state, labels.done);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="itineraryId" value={itineraryId} />

      <h3 className="display text-lg text-ink">{labels.heading}</h3>

      <FormMessage error={state.error} />

      <TextField
        id="routeName"
        name="name"
        label={labels.name}
        required
        maxLength={64}
        defaultValue={defaults.name}
      />

      <DateField id="routeDate" name="date" label={labels.date} defaultValue={defaults.date} />

      <TextAreaField
        id="routeDescription"
        name="description"
        label={labels.description}
        optionalLabel={labels.optional}
        maxLength={500}
        defaultValue={defaults.description}
      />

      <fieldset>
        <legend className={labelClass}>{labels.start}</legend>
        <p className={`${hint} mt-1.5 leading-relaxed`}>{labels.startHint}</p>

        <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
          <TextField
            id="routeLatitude"
            name="startLatitude"
            label={labels.latitude}
            inputMode="decimal"
            defaultValue={defaults.latitude}
          />
          <TextField
            id="routeLongitude"
            name="startLongitude"
            label={labels.longitude}
            inputMode="decimal"
            defaultValue={defaults.longitude}
          />
        </div>
      </fieldset>

      <SubmitButton className={`${button.primary} self-start`} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
