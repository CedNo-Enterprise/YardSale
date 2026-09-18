import type { Locale } from "@/i18n/config";

/** Every route lives under a locale segment, so links are built through here. */
export function path(locale: Locale, route = "/"): string {
  return route === "/" ? `/${locale}` : `/${locale}${route}`;
}

export const routes = {
  home: "/",
  sales: "/sales",
  sale: (id: string) => `/sales/${id}`,
  newSale: "/sales/new",
  itineraries: "/routes",
  itinerary: (id: string) => `/routes/${id}`,
  newItinerary: "/routes/new",
  account: "/account",
  signIn: "/sign-in",
  register: "/register",
} as const;
