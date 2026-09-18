import Link from "next/link";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { searchSales } from "@/lib/api/sales";
import { errorMessage } from "@/lib/errors";
import { path, routes } from "@/lib/paths";
import { button, panel } from "@/components/ui";
import { RouteSketch } from "@/components/route-sketch";
import { SaleListing, SaleListingGroup } from "@/components/sale-listing";

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="grid items-center gap-10 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <h1 className="display text-5xl text-ink sm:text-6xl">{dict.home.headline}</h1>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-ink-soft">{dict.home.lede}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={path(locale, routes.sales)} className={button.primary}>
              {dict.home.browse}
            </Link>
            <Link href={path(locale, routes.newItinerary)} className={button.secondary}>
              {dict.home.plan}
            </Link>
          </div>
        </div>

        <RouteSketch className="w-full max-w-md justify-self-center" />
      </section>

      <section className="border-t border-haze py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="display text-2xl text-ink">{dict.home.weekendTitle}</h2>
          <Link href={path(locale, routes.sales)} className="text-sm font-semibold text-route hover:text-ink">
            {dict.home.seeAll}
          </Link>
        </div>

        <div className="mt-6">
          <Suspense fallback={<UpcomingSkeleton />}>
            <Upcoming />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-haze py-12">
        <h2 className="display text-2xl text-ink">{dict.home.howTitle}</h2>

        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {dict.home.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-route text-base text-route"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

async function Upcoming() {
  const dict = await getDictionary();

  let result;
  try {
    result = await searchSales({ sort: "date", limit: 4, dateFrom: new Date().toISOString() });
  } catch (error) {
    return (
      <p className={`${panel} border-flag/40 px-4 py-6 text-sm text-flag`}>
        {errorMessage(dict, error)}
      </p>
    );
  }

  if (result.sales.length === 0) {
    return <p className={`${panel} px-4 py-6 text-sm text-ink-soft`}>{dict.home.weekendEmpty}</p>;
  }

  return (
    <SaleListingGroup>
      {result.sales.map((sale) => (
        <SaleListing key={sale.id} sale={sale} />
      ))}
    </SaleListingGroup>
  );
}

function UpcomingSkeleton() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <li key={row} className="h-[88px] rounded-tab border border-haze bg-card" />
      ))}
    </ul>
  );
}
