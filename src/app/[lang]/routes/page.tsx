import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { listItineraries } from "@/lib/api/itineraries";
import { getSession } from "@/lib/session";
import { errorMessage } from "@/lib/errors";
import { fillTemplate, formatDate } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import type { Itinerary } from "@/lib/api/types";
import { button, panel, stopPip } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).routes.title };
}

export default async function RoutesPage() {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  if (!session) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="display text-3xl text-ink">{dict.routes.signInTitle}</h1>
        <p className="mx-auto mt-3 max-w-[48ch] text-ink-soft">{dict.routes.signInBody}</p>
        <Link
          href={`${path(locale, routes.signIn)}?next=${encodeURIComponent(path(locale, routes.itineraries))}`}
          className={`${button.primary} mt-8`}
        >
          {dict.nav.signIn}
        </Link>
      </div>
    );
  }

  let itineraries: Itinerary[];
  try {
    itineraries = await listItineraries(session.token);
  } catch (error) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12">
        <p className={`${panel} border-flag/40 px-4 py-8 text-sm text-flag`}>{errorMessage(dict, error)}</p>
      </div>
    );
  }

  const ordered = [...itineraries].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-ink">{dict.routes.title}</h1>
          <p className="mt-2 max-w-[56ch] text-ink-soft">{dict.routes.lede}</p>
        </div>
        <Link href={path(locale, routes.newItinerary)} className={button.primary}>
          {dict.routes.new}
        </Link>
      </div>

      {ordered.length === 0 ? (
        <div className={`${panel} mt-10 px-6 py-14 text-center`}>
          <p className="display text-xl text-ink">{dict.routes.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm text-ink-soft">{dict.routes.emptyBody}</p>
          <Link href={path(locale, routes.newItinerary)} className={`${button.primary} mt-6`}>
            {dict.routes.new}
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {ordered.map((itinerary) => (
            <li key={itinerary.id}>
              <Link
                href={path(locale, routes.itinerary(itinerary.id))}
                className={`${panel} group flex h-full flex-col gap-3 p-5 transition-colors hover:border-ink/30`}
              >
                <span className="display text-xl text-ink group-hover:text-route">{itinerary.name}</span>
                <span className="text-sm text-ink-soft">{formatDate(itinerary.date, locale)}</span>

                <span className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  {itinerary.stops.length === 0 ? (
                    <span className="text-sm text-dusk">{dict.routes.stopsNone}</span>
                  ) : (
                    <>
                      <span className="flex gap-1" aria-hidden>
                        {itinerary.stops
                          .slice()
                          .sort((a, b) => a.position - b.position)
                          .map((stop) => (
                            <span
                              key={stop.saleId}
                              className={`h-2.5 w-2.5 rounded-full border ${stopPip[stop.status]}`}
                            />
                          ))}
                      </span>
                      <span className="text-sm text-ink-soft">
                        {itinerary.stops.length === 1
                          ? dict.routes.stopsOne
                          : fillTemplate(dict.routes.stops, { count: itinerary.stops.length })}
                      </span>
                    </>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
