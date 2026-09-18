import "server-only";
import { apiGet, apiSend } from "./client";
import type { Itinerary, StopStatus } from "./types";

export function listItineraries(token: string): Promise<Itinerary[]> {
  return apiGet<Itinerary[]>("/itinerary", { token });
}

export function getItinerary(id: string): Promise<Itinerary> {
  return apiGet<Itinerary>(`/itinerary/${encodeURIComponent(id)}`);
}

export interface CreateItineraryInput {
  name: string;
  description: string;
  date: string;
  startLatitude?: number;
  startLongitude?: number;
  saleIds: string[];
}

export async function createItinerary(input: CreateItineraryInput, token: string): Promise<string | null> {
  const { location } = await apiSend<void>("/itinerary", { method: "POST", body: input, token });
  return location;
}

export interface UpdateItineraryInput {
  name?: string;
  description?: string;
  date?: string;
  startLatitude?: number;
  startLongitude?: number;
}

export async function updateItinerary(id: string, input: UpdateItineraryInput, token: string): Promise<Itinerary> {
  const { data } = await apiSend<Itinerary>(`/itinerary/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input,
    token,
  });
  return data;
}

export async function deleteItinerary(id: string, token: string): Promise<void> {
  await apiSend<void>(`/itinerary/${encodeURIComponent(id)}`, { method: "DELETE", token });
}

/** Appends to the end of the route rather than re-planning it. */
export async function addStop(id: string, saleId: string, token: string): Promise<Itinerary> {
  const { data } = await apiSend<Itinerary>(`/itinerary/${encodeURIComponent(id)}/stop`, {
    method: "POST",
    body: { saleId },
    token,
  });
  return data;
}

export async function setStopStatus(
  id: string,
  saleId: string,
  status: StopStatus,
  token: string,
): Promise<Itinerary> {
  const { data } = await apiSend<Itinerary>(
    `/itinerary/${encodeURIComponent(id)}/stop/${encodeURIComponent(saleId)}`,
    { method: "PATCH", body: { status }, token },
  );
  return data;
}

export async function removeStop(id: string, saleId: string, token: string): Promise<void> {
  await apiSend<void>(`/itinerary/${encodeURIComponent(id)}/stop/${encodeURIComponent(saleId)}`, {
    method: "DELETE",
    token,
  });
}

/** Omitted coordinates reuse the start point already stored on the route. */
export async function reorderStops(
  id: string,
  start: { startLatitude?: number; startLongitude?: number },
  token: string,
): Promise<Itinerary> {
  const { data } = await apiSend<Itinerary>(`/itinerary/${encodeURIComponent(id)}/stops/order`, {
    method: "PUT",
    body: start,
    token,
  });
  return data;
}
