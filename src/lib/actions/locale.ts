"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/i18n/config";

/**
 * Switches language and remembers the choice. Setting the cookie on the server
 * keeps the switcher working without JavaScript, and means a later visit to a
 * URL with no locale segment lands in the language that was picked.
 */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const requested = formData.get("locale");
  const locale = typeof requested === "string" && isLocale(requested) ? requested : defaultLocale;

  const target = formData.get("next");
  const next = typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
    ? target
    : `/${locale}`;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  redirect(next);
}
