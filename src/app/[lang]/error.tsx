"use client";

import { usePathname } from "next/navigation";
import { button } from "@/components/ui";

/**
 * Error boundaries are Client Components, so they cannot read the server-side
 * dictionary. These two strings are kept here instead — the only copy in the
 * app that is not in `src/i18n/dictionaries`.
 */
const copy = {
  en: {
    title: "This page did not load.",
    body: "The sales service may be down. Try again, and if it keeps happening come back in a few minutes.",
    retry: "Try again",
  },
  fr: {
    title: "Cette page ne s’est pas chargée.",
    body: "Le service des ventes est peut-être hors service. Réessayez, et si cela persiste revenez dans quelques minutes.",
    retry: "Réessayer",
  },
} as const;

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const locale = usePathname().split("/")[1] === "fr" ? "fr" : "en";
  const text = copy[locale];

  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <h1 className="display text-4xl text-ink">{text.title}</h1>
      <p className="mt-4 text-ink-soft">{text.body}</p>
      <button type="button" onClick={reset} className={`${button.primary} mt-8`}>
        {text.retry}
      </button>
    </div>
  );
}
