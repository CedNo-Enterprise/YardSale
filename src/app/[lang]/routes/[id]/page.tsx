import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getItinerary, listItineraries } from "@/lib/api/itineraries";
import { searchSales, getSale } from "@/lib/api/sales";
import { ApiError, optional } from "@/lib/api/client";
import { isLocated, type Itinerary, type Sale, type StopStatus } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import {
  fillTemplate,
  formatCoordinates,
  formatDate,
  formatDateShort,
  formatTime,
  toDateOnly,
} from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { deleteItineraryAction } from "@/lib/actions/itineraries";
import type { SaleChoice } from "@/components/itinerary-form";
import { AddStopToRoute, ReorderStops, RouteDetailsForm } from "@/components/route-tools";
import { StopActions } from "@/components/stop-actions";
import { ConfirmButton } from "@/components/confirm-button";
import { button, link, panel, stopMarker, stopName, stopTone } from "@/components/ui";

async function loadItinerary(id: string): Promise<Itinerary> {
  try {
    return await getItinerary(id);
  } catch (error) {
    if (error instanceof ApiError && (error.kind === "not_found" || error.kind === "invalid")) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/routes/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    return { title: (await getItinerary(id)).name };
  } catch {
    return { title: (await getDictionary()).route.notFound };
  }
}

export default async function RoutePage({ params }: PageProps<"/[lang]/routes/[id]">) {
  const [dict, locale, { id }, session] = await Promise.all([
    getDictionary(),
    getLocale(),
    params,
    getSession(),
  ]);

  const itinerary = await loadItinerary(id);
  const stops = [...itinerary.stops].sort((a, b) => a.position - b.position);

  // A stop names a sale but does not carry it, so each one is read alongside.
  // A sale that has since gone is tolerated rather than failing the whole page.
  const sales = await Promise.all(stops.map((stop) => optional(getSale(stop.saleId))));

  // The API has no "who owns this" endpoint, so ownership is read from the
  // caller's own list. Someone else's route stays readable, without controls.
  const owned = session
    ? ((await optional(listItineraries(session.token))) ?? []).some((route) => route.id === itinerary.id)
    : false;

  const hasStart = itinerary.startLatitude !== 0 || itinerary.startLongitude !== 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link
        href={path(locale, routes.itineraries)}
        className="text-sm font-semibold text-ink-soft hover:text-ink"
      >
        {dict.routes.title}
      </Link>

      <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">{itinerary.name}</h1>
      <p className="mt-3 text-lg text-ink-soft">{formatDate(itinerary.date, locale)}</p>

      {itinerary.description && (
        <p className="mt-4 max-w-[62ch] whitespace-pre-line leading-relaxed text-ink">
          {itinerary.description}
        </p>
      )}

      <p className="mt-4 text-sm text-ink-soft">
        {hasStart
          ? `${dict.route.start} ${formatCoordinates(itinerary.startLatitude, itinerary.startLongitude, locale)}`
          : dict.route.startUnset}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="display text-2xl text-ink">{dict.route.stops}</h2>

          {stops.length === 0 ? (
            <div className={`${panel} mt-5 px-6 py-10 text-center`}>
              <p className="display text-lg text-ink">{dict.route.empty}</p>
              <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ink-soft">{dict.route.emptyBody}</p>
            </div>
          ) : (
            <ol className="mt-6 flex flex-col gap-7">
              {stops.map((stop, index) => (
                <li key={stop.saleId} className="route-spine relative pl-12">
                  <span
                    aria-hidden
                    className={`display absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm ${stopMarker[stop.status]}`}
                  >
                    {index + 1}
                  </span>

                  <StopRow
                    sale={sales[index]}
                    saleId={stop.saleId}
                    status={stop.status}
                    number={fillTemplate(dict.route.stopNumber, { n: index + 1 })}
                  />

                  {owned && (
                    <StopActions
                      locale={locale}
                      itineraryId={itinerary.id}
                      saleId={stop.saleId}
                      status={stop.status}
                      labels={{
                        visited: dict.route.markVisited,
                        skipped: dict.route.markSkipped,
                        planned: dict.route.markPlanned,
                        remove: dict.route.remove,
                        confirm: {
                          title: dict.route.removeTitle,
                          body: dict.route.confirmRemove,
                          confirm: dict.route.remove,
                          cancel: dict.common.cancel,
                        },
                      }}
                    />
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {owned && <RouteTools itinerary={itinerary} />}
      </div>
    </div>
  );
}

async function StopRow({
  sale,
  saleId,
  status,
  number,
}: {
  sale: Sale | null;
  saleId: string;
  status: StopStatus;
  number: string;
}) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  if (!sale) {
    return (
      <div>
        <p className="display text-lg text-dusk">{number}</p>
        <p className="text-sm text-ink-soft">{dict.errors.notFound}</p>
        <span className="sr-only">{saleId}</span>
      </div>
    );
  }

  const skipped = status === "skipped";

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Link
          href={path(locale, routes.sale(sale.id))}
          className={`display text-xl hover:text-route ${stopName[status]}`}
        >
          {sale.name}
        </Link>
        <span className={`text-xs font-semibold ${stopTone[status]}`}>{dict.stopStatus[status]}</span>
      </div>

      <p className={`mt-1 text-sm ${skipped ? "text-dusk" : "text-ink-soft"}`}>
        {formatTime(sale.date, locale)} — {sale.address.line1}, {sale.address.city}
      </p>

      {!isLocated(sale.address) && <p className="mt-1 text-xs text-dusk">{dict.route.unlocated}</p>}
    </div>
  );
}

async function RouteTools({ itinerary }: { itinerary: Itinerary }) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  const onRoute = new Set(itinerary.stops.map((stop) => stop.saleId));

  const upcoming = await searchSales({
    statuses: ["scheduled", "active"],
    dateFrom: new Date().toISOString(),
    sort: "date",
    limit: 50,
  }).catch(() => null);

  const addable: SaleChoice[] = (upcoming?.sales ?? [])
    .filter((sale) => !onRoute.has(sale.id))
    .map((sale) => ({
      id: sale.id,
      name: sale.name,
      city: sale.address.city,
      when: `${formatDateShort(sale.date, locale)}, ${formatTime(sale.date, locale)}`,
    }));

  return (
    <aside className="flex flex-col gap-8">
      <div className={`${panel} p-5`}>
        <AddStopToRoute
          locale={locale}
          itineraryId={itinerary.id}
          sales={addable}
          labels={{
            heading: dict.route.addStop,
            hint: dict.route.addStopHint,
            choose: dict.route.chooseSale,
            submit: dict.sale.add,
            saving: dict.common.saving,
            added: dict.route.stopAdded,
            none: dict.route.noneToAdd,
          }}
        />
      </div>

      <div className={`${panel} p-5`}>
        <ReorderStops
          locale={locale}
          itineraryId={itinerary.id}
          labels={{
            heading: dict.route.reoptimize,
            hint: dict.route.reoptimizeHint,
            start: dict.routeForm.start,
            latitude: dict.routeForm.latitude,
            longitude: dict.routeForm.longitude,
            optional: dict.common.optional,
            submit: dict.route.reoptimize,
            saving: dict.common.saving,
            done: dict.route.saved,
          }}
        />
      </div>

      <div className={`${panel} p-5`}>
        <RouteDetailsForm
          locale={locale}
          itineraryId={itinerary.id}
          defaults={{
            name: itinerary.name,
            description: itinerary.description ?? "",
            date: toDateOnly(itinerary.date),
            latitude: itinerary.startLatitude === 0 ? "" : String(itinerary.startLatitude),
            longitude: itinerary.startLongitude === 0 ? "" : String(itinerary.startLongitude),
          }}
          labels={{
            heading: dict.route.details,
            name: dict.routeForm.name,
            description: dict.routeForm.description,
            optional: dict.common.optional,
            date: dict.routeForm.date,
            start: dict.routeForm.start,
            startHint: dict.route.startHint,
            latitude: dict.routeForm.latitude,
            longitude: dict.routeForm.longitude,
            submit: dict.route.save,
            saving: dict.common.saving,
            done: dict.route.saved,
          }}
        />
      </div>

      <form action={deleteItineraryAction}>
        <input type="hidden" name="lang" value={locale} />
        <input type="hidden" name="itineraryId" value={itinerary.id} />
        <ConfirmButton
          className={button.danger}
          labels={{
            title: dict.routes.deleteTitle,
            body: dict.routes.deleteConfirm,
            confirm: dict.routes.delete,
            cancel: dict.common.cancel,
          }}
        >
          {dict.routes.delete}
        </ConfirmButton>
      </form>

      <Link href={path(locale, routes.sales)} className={`${link} text-sm`}>
        {dict.sale.backToSales}
      </Link>
    </aside>
  );
}
