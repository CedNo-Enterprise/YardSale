import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

/**
 * Loads a dictionary for a locale that is already known. Server Components read
 * the locale from the route instead — see `getDictionary` — but a Server Action
 * cannot, so it is handed the locale by the form that called it.
 */
export function loadDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
