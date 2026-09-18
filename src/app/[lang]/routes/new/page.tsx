import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { searchSales } from "@/lib/api/sales";
import { getSession } from "@/lib/session";
import { formatDateShort, formatTime, toDateOnly } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { ItineraryForm, type SaleChoice } from "@/components/itinerary-form";
import { panel } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).routeForm.title };
}

export default async function NewRoutePage() {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  if (!session) {
    redirect(
      `${path(locale, routes.signIn)}?next=${encodeURIComponent(path(locale, routes.newItinerary))}`,
    );
  }

  // Only sales still to come are worth putting on a route.
  const upcoming = await searchSales({
    statuses: ["scheduled", "active"],
    dateFrom: new Date().toISOString(),
    sort: "date",
    limit: 50,
  }).catch(() => null);

  const choices: SaleChoice[] = (upcoming?.sales ?? []).map((sale) => ({
    id: sale.id,
    name: sale.name,
    city: sale.address.city,
    when: `${formatDateShort(sale.date, locale)}, ${formatTime(sale.date, locale)}`,
  }));

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="display text-4xl text-ink">{dict.routeForm.title}</h1>
      <p className="mt-3 max-w-[56ch] text-ink-soft">{dict.routeForm.lede}</p>

      <div className={`${panel} mt-8 p-6`}>
        <ItineraryForm
          locale={locale}
          sales={choices}
          defaultDate={toDateOnly(new Date().toISOString())}
          labels={{
            name: dict.routeForm.name,
            namePlaceholder: dict.routeForm.namePlaceholder,
            description: dict.routeForm.description,
            descriptionPlaceholder: dict.routeForm.descriptionPlaceholder,
            optional: dict.common.optional,
            date: dict.routeForm.date,
            start: dict.routeForm.start,
            startHint: dict.routeForm.startHint,
            latitude: dict.routeForm.latitude,
            longitude: dict.routeForm.longitude,
            useOttawa: dict.routeForm.useOttawa,
            pick: dict.routeForm.pick,
            pickHint: dict.routeForm.pickHint,
            noSales: dict.routeForm.noSales,
            submit: dict.routeForm.submit,
            saving: dict.common.saving,
          }}
        />
      </div>
    </div>
  );
}
