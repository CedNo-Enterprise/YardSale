/**
 * Shapes returned by GarageSaleAPI (`interfaces/responses`). Field names follow
 * the JSON tags on the Go structs, which mix snake_case and camelCase — they are
 * mirrored here exactly rather than normalised, so a mismatch shows up as a type
 * error instead of an undefined at runtime.
 */

export type SaleStatus = "scheduled" | "active" | "completed" | "cancelled";

export type SaleItemStatus = "available" | "reserved" | "sold";

export type StopStatus = "planned" | "visited" | "skipped";

export type SaleSort = "date" | "-date" | "created";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface SaleItem {
  id: number;
  name: string;
  price: number;
  status: SaleItemStatus;
}

export interface Sale {
  id: string;
  seller_id: string;
  name: string;
  description?: string;
  date: string;
  status: SaleStatus;
  address: Address;
  items: SaleItem[];
}

/** A browse result. Search does not load items, so the summary carries none. */
export interface SaleSummary {
  id: string;
  seller_id: string;
  name: string;
  description?: string;
  date: string;
  status: SaleStatus;
  address: Address;
}

export interface SaleSearchResult {
  sales: SaleSummary[];
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ItineraryStop {
  saleId: string;
  position: number;
  status: StopStatus;
}

export interface Itinerary {
  id: string;
  name: string;
  description?: string;
  date: string;
  startLatitude: number;
  startLongitude: number;
  stops: ItineraryStop[];
}

export interface User {
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  token: string;
  expires_at: string;
  user: User;
}

export interface SavedAddress {
  id: number;
  label: string;
  address: Address;
  is_default: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  price: number;
  status: SaleItemStatus;
}

export interface Seller {
  id: string;
  name: string;
  saved_addresses: SavedAddress[];
  inventory: InventoryItem[];
}

export interface Buyer {
  id: string;
  display_name: string;
  home_address?: Address;
}

/** An address the geocoder could not place is stored at (0, 0). */
export function isLocated(address: Pick<Address, "latitude" | "longitude">): boolean {
  return address.latitude !== 0 || address.longitude !== 0;
}
