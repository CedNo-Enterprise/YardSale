export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers the language someone picked, so the next visit lands there. */
export const LOCALE_COOKIE = "yardsale_locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale for an `Accept-Language` header. The header
 * is parsed rather than string-matched so `fr-CA` reaches the French pages the
 * same way a bare `fr` does.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.toLowerCase(), quality: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.quality))
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}
