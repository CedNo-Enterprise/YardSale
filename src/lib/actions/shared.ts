import "server-only";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import type { AddressInput } from "@/lib/api/types";

export type { FormState } from "./state";

/**
 * Server Actions cannot read the route's locale, so each form carries it in a
 * hidden field. An unrecognised value falls back rather than failing: the worst
 * case is an error message in the wrong language, which is better than no reply.
 */
export function localeFrom(formData: FormData): Locale {
  const value = formData.get("lang");
  return typeof value === "string" && isLocale(value) ? value : defaultLocale;
}

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function number(formData: FormData, name: string): number | undefined {
  const value = text(formData, name);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Reads the address fieldset. Returns null when nothing was filled in, which is
 * how an optional address (a buyer's home) tells "left blank" from "half filled".
 */
export function addressFrom(formData: FormData): AddressInput | null {
  const address: AddressInput = {
    line1: text(formData, "line1"),
    city: text(formData, "city"),
    state: text(formData, "state"),
    postal_code: text(formData, "postal_code"),
    country: text(formData, "country").toUpperCase(),
  };

  const line2 = text(formData, "line2");
  if (line2) address.line2 = line2;

  const filled = [address.line1, address.city, address.state, address.postal_code].some(Boolean);
  return filled ? address : null;
}

/** Only same-site paths are followed, so a form field cannot bounce someone off-site. */
export function safeRedirect(formData: FormData, fallback: string): string {
  const target = text(formData, "redirectTo");
  return target.startsWith("/") && !target.startsWith("//") ? target : fallback;
}
