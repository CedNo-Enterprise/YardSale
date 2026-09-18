"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { loadDictionary } from "@/i18n/load";
import {
  addStop,
  createItinerary,
  deleteItinerary,
  removeStop,
  reorderStops,
  setStopStatus,
  updateItinerary,
} from "@/lib/api/itineraries";
import type { StopStatus } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import { errorMessage } from "@/lib/errors";
import { fromDateOnly, fromDateTimeLocal } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { localeFrom, number, text, type FormState } from "./shared";

const STOP_STATUSES: StopStatus[] = ["planned", "visited", "skipped"];

export async function createItineraryAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const name = text(formData, "name");
  const date = fromDateOnly(text(formData, "date")) ?? fromDateTimeLocal(text(formData, "date"));
  const saleIds = formData.getAll("saleIds").filter((id): id is string => typeof id === "string");

  if (!name || !date) return { error: dict.errors.invalid };
  if (saleIds.length === 0) return { error: dict.errors.pickAtLeastOne };

  let itineraryId: string | null;
  try {
    itineraryId = await createItinerary(
      {
        name,
        description: text(formData, "description"),
        date,
        startLatitude: number(formData, "startLatitude"),
        startLongitude: number(formData, "startLongitude"),
        saleIds,
      },
      session.token,
    );
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  redirect(
    itineraryId ? path(locale, routes.itinerary(itineraryId)) : path(locale, routes.itineraries),
  );
}

export async function updateItineraryAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const id = text(formData, "itineraryId");
  const name = text(formData, "name");
  if (!id || !name) return { error: dict.errors.invalid };

  const date = fromDateOnly(text(formData, "date"));

  // The API applies a start point only when both coordinates are present, so
  // half a pair would save nothing while the form reported success.
  const startLatitude = number(formData, "startLatitude");
  const startLongitude = number(formData, "startLongitude");
  if ((startLatitude === undefined) !== (startLongitude === undefined)) {
    return { error: dict.errors.startPairNeeded };
  }

  try {
    await updateItinerary(
      id,
      {
        name,
        description: text(formData, "description"),
        date: date ?? undefined,
        startLatitude,
        startLongitude,
      },
      session.token,
    );
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}

export async function deleteItineraryAction(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const id = text(formData, "itineraryId");
  if (id) await deleteItinerary(id, session.token);

  redirect(path(locale, routes.itineraries));
}

export async function addStopAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const id = text(formData, "itineraryId");
  const saleId = text(formData, "saleId");
  if (!id || !saleId) return { error: dict.errors.invalid };

  try {
    await addStop(id, saleId, session.token);
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}

export async function stopStatusAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const id = text(formData, "itineraryId");
  const saleId = text(formData, "saleId");
  const status = text(formData, "status") as StopStatus;

  if (!id || !saleId || !STOP_STATUSES.includes(status)) return { error: dict.errors.invalid };

  try {
    await setStopStatus(id, saleId, status, session.token);
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}

export async function removeStopAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const id = text(formData, "itineraryId");
  const saleId = text(formData, "saleId");
  if (!id || !saleId) return { error: dict.errors.invalid };

  try {
    await removeStop(id, saleId, session.token);
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}

export async function reorderStopsAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const id = text(formData, "itineraryId");
  if (!id) return { error: dict.errors.invalid };

  // Omitted coordinates tell the API to reuse the start point it already has,
  // but it wants the pair or nothing: one on its own is quietly ignored and the
  // route would be reordered from the old point instead.
  const startLatitude = number(formData, "startLatitude");
  const startLongitude = number(formData, "startLongitude");
  if ((startLatitude === undefined) !== (startLongitude === undefined)) {
    return { error: dict.errors.startPairNeeded };
  }

  try {
    await reorderStops(id, { startLatitude, startLongitude }, session.token);
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}
