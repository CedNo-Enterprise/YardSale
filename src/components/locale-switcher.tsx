"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { isLocale, locales, localeNames, type Locale } from "@/i18n/config";
import { setLocaleAction } from "@/lib/actions/locale";

/**
 * Swaps the locale segment of the current path, keeping the reader where they
 * are. The switch goes through a Server Action so the choice is remembered in a
 * cookie and the control still works with no JavaScript.
 */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(locale: Locale): string {
    const segments = pathname.split("/");
    if (isLocale(segments[1])) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }

    const query = searchParams.toString();
    return `${segments.join("/") || `/${locale}`}${query ? `?${query}` : ""}`;
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {locales.map((locale) => (
        <form key={locale} action={setLocaleAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={hrefFor(locale)} />
          <button
            type="submit"
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={
              locale === current
                ? "rounded-tab bg-ink px-2 py-1 text-xs font-semibold text-paper"
                : "rounded-tab px-2 py-1 text-xs font-semibold text-ink-soft hover:text-ink"
            }
          >
            <span className="sr-only">{localeNames[locale]}</span>
            <span aria-hidden>{locale.toUpperCase()}</span>
          </button>
        </form>
      ))}
    </div>
  );
}
