import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { loadDictionary, type Dictionary } from "./load";

export type { Dictionary };

/**
 * Reads the locale from the root segment rather than taking it as an argument,
 * so a component deep in the tree can translate without every page above it
 * passing `lang` down. Server Components only — a Server Action gets its locale
 * from the form that invoked it.
 */
export async function getDictionary(): Promise<Dictionary> {
  return loadDictionary(await getLocale());
}

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!value || !isLocale(value)) notFound();
  return value;
}
