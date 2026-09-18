import "server-only";
import { apiGet, apiSend } from "./client";
import type { AddressInput, Sale, SaleSearchResult, SaleSort, SaleStatus } from "./types";

export interface SaleSearchQuery {
  statuses?: SaleStatus[];
  dateFrom?: string;
  dateTo?: string;
  sort?: SaleSort;
  limit?: number;
  offset?: number;
}

export function searchSalesPath(query: SaleSearchQuery): string {
  const params = new URLSearchParams();
  for (const status of query.statuses ?? []) params.append("status", status);
  if (query.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query.dateTo) params.set("dateTo", query.dateTo);
  if (query.sort) params.set("sort", query.sort);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));

  const qs = params.toString();
  return qs ? `/sale?${qs}` : "/sale";
}

export function searchSales(query: SaleSearchQuery): Promise<SaleSearchResult> {
  return apiGet<SaleSearchResult>(searchSalesPath(query));
}

export function getSale(id: string): Promise<Sale> {
  return apiGet<Sale>(`/sale/${encodeURIComponent(id)}`);
}

export interface CreateSaleInput {
  sellerId: string;
  name: string;
  description: string;
  date: string;
  address: AddressInput;
}

/** Answers 201 with the new id in `Location`, so the caller can redirect to it. */
export async function createSale(input: CreateSaleInput, token: string): Promise<string | null> {
  const { location } = await apiSend<void>("/sale", { method: "POST", body: input, token });
  return location;
}
