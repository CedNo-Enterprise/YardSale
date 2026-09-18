import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSeller } from "@/lib/api/account";
import { listItineraries } from "@/lib/api/itineraries";
import { getSale } from "@/lib/api/sales";
import { ApiError, optional } from "@/lib/api/client";
import { isLocated, type Sale } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import { formatDate, formatPrice, formatTime } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { AddToRoute, type RouteOption } from "@/components/add-to-route";
import { button, link, panel, saleEdge, saleTagTone } from "@/components/ui";

async function loadSale(id: string): Promise<Sale> {
  try {
    return await getSale(id);
  } catch (error) {
    if (error instanceof ApiError && (error.kind === "not_found" || error.kind === "invalid")) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/sales/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    return { title: (await getSale(id)).name };
  } catch {
    return { title: (await getDictionary()).sale.notFound };
  }
}

export default async function SalePage({ params }: PageProps<"/[lang]/sales/[id]">) {
  const [dict, locale, { id }] = await Promise.all([getDictionary(), getLocale(), params]);

  const sale = await loadSale(id);
  const seller = await optional(getSeller(sale.seller_id));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link href={path(locale, routes.sales)} className="text-sm font-semibold text-ink-soft hover:text-ink">
        {dict.sale.backToSales}
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <span aria-hidden className={`mt-2 h-14 w-1.5 shrink-0 rounded-full ${saleEdge[sale.status]}`} />
        <div>
          <p className={`text-sm font-semibold ${saleTagTone[sale.status]}`}>{dict.status[sale.status]}</p>
          <h1 className="display mt-1 text-4xl text-ink sm:text-5xl">{sale.name}</h1>
          {seller?.name && (
            <p className="mt-3 text-sm text-ink-soft">
              {dict.sale.seller} {seller.name}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="display text-xl text-ink">{dict.sale.when}</h2>
            <p className="mt-2 text-lg text-ink">{formatDate(sale.date, locale)}</p>
            <p className="text-ink-soft">{formatTime(sale.date, locale)}</p>
          </section>

          {sale.description && (
            <p className="max-w-[62ch] whitespace-pre-line text-base leading-relaxed text-ink">
              {sale.description}
            </p>
          )}

          <section>
            <h2 className="display text-xl text-ink">{dict.sale.items}</h2>

            {sale.items.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">{dict.sale.noItems}</p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-haze border-y border-haze">
                {sale.items.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="text-ink">{item.name}</span>
                    <span className="flex items-baseline gap-4">
                      <span className="text-xs text-ink-soft">{dict.sale.itemStatus[item.status]}</span>
                      <span className="display text-base text-ink">{formatPrice(item.price, locale)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className={`${panel} p-5`}>
            <h2 className="display text-lg text-ink">{dict.sale.where}</h2>
            <address className="mt-3 not-italic leading-relaxed text-ink">
              {sale.address.line1}
              {sale.address.line2 && (
                <>
                  <br />
                  {sale.address.line2}
                </>
              )}
              <br />
              {sale.address.city}, {sale.address.state}
              <br />
              {sale.address.postal_code}
            </address>

            {isLocated(sale.address) ? (
              <a
                href={`https://www.openstreetmap.org/?mlat=${sale.address.latitude}&mlon=${sale.address.longitude}#map=17/${sale.address.latitude}/${sale.address.longitude}`}
                target="_blank"
                rel="noreferrer"
                className={`${link} mt-4 inline-block text-sm`}
              >
                {dict.sale.openInMaps}
              </a>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-dusk">{dict.sale.noCoordinates}</p>
            )}
          </section>

          <AddToRoutePanel saleId={sale.id} />
        </aside>
      </div>
    </div>
  );
}

async function AddToRoutePanel({ saleId }: { saleId: string }) {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  if (!session) {
    return (
      <section className={`${panel} p-5`}>
        <h2 className="display text-lg text-ink">{dict.sale.addToRoute}</h2>
        <p className="mt-2 text-sm text-ink-soft">{dict.sale.signInToAdd}</p>
        <Link
          href={`${path(locale, routes.signIn)}?next=${encodeURIComponent(path(locale, routes.sale(saleId)))}`}
          className={`${button.secondary} mt-4 w-full`}
        >
          {dict.nav.signIn}
        </Link>
      </section>
    );
  }

  const itineraries = await optional(listItineraries(session.token));

  const options: RouteOption[] = (itineraries ?? []).map((itinerary) => ({
    id: itinerary.id,
    name: itinerary.name,
    date: itinerary.date,
    alreadyHere: itinerary.stops.some((stop) => stop.saleId === saleId),
  }));

  const selectable = options.filter((option) => !option.alreadyHere);

  return (
    <section className={`${panel} p-5`}>
      <h2 className="display text-lg text-ink">{dict.sale.addToRoute}</h2>

      {selectable.length === 0 ? (
        <>
          <p className="mt-2 text-sm text-ink-soft">
            {options.length === 0 ? dict.sale.noRoutes : dict.sale.onAllRoutes}
          </p>
          <Link href={path(locale, routes.newItinerary)} className={`${button.secondary} mt-4 w-full`}>
            {dict.sale.createRoute}
          </Link>
        </>
      ) : (
        <div className="mt-4">
          <AddToRoute
            locale={locale}
            saleId={saleId}
            options={options}
            labels={{
              choose: dict.sale.chooseRoute,
              add: dict.sale.add,
              saving: dict.common.saving,
              added: dict.route.stopAdded,
            }}
          />
        </div>
      )}
    </section>
  );
}
