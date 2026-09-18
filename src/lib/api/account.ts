import "server-only";
import { apiGet, apiSend } from "./client";
import type { AddressInput, Buyer, LoginResult, Seller, User } from "./types";

export async function register(input: { username: string; email: string; password: string }): Promise<void> {
  await apiSend<void>("/user", { method: "POST", body: input });
}

export async function login(input: { email: string; password: string }): Promise<LoginResult> {
  const { data } = await apiSend<LoginResult>("/login", { method: "POST", body: input });
  return data;
}

export async function logout(token: string): Promise<void> {
  await apiSend<void>("/logout", { method: "POST", token });
}

export function getUser(id: string): Promise<User> {
  return apiGet<User>(`/user/${encodeURIComponent(id)}`);
}

export function getSellerByUser(userId: string): Promise<Seller> {
  return apiGet<Seller>(`/seller/user/${encodeURIComponent(userId)}`);
}

export function getSeller(id: string): Promise<Seller> {
  return apiGet<Seller>(`/seller/${encodeURIComponent(id)}`);
}

export async function createSeller(username: string, token: string): Promise<string | null> {
  const { location } = await apiSend<void>("/seller", { method: "POST", body: { username }, token });
  return location;
}

/** The buyer profile is addressed as "me": the token is the only selector. */
export function getBuyer(token: string): Promise<Buyer> {
  return apiGet<Buyer>("/buyer/me", { token });
}

export async function createBuyer(
  input: { displayName: string; homeAddress?: AddressInput },
  token: string,
): Promise<string | null> {
  const { location } = await apiSend<void>("/buyer", { method: "POST", body: input, token });
  return location;
}

/** An empty patch is rejected by the API, so callers send at least one field. */
export async function updateBuyer(
  input: { displayName?: string; homeAddress?: AddressInput },
  token: string,
): Promise<Buyer> {
  const { data } = await apiSend<Buyer>("/buyer/me", { method: "PATCH", body: input, token });
  return data;
}
