import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { dateTab, formatTime } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { isLocated, type Sale, type SaleSummary } from "@/lib/api/types";
import { saleEdge, saleTagTone } from "./ui";

/**
 * One sale in a list. The tear-off date tab answers "which morning is this?"
 * first, because that is what someone planning a Saturday is scanning for; the
 * coloured edge carries the status without a second label to read.
 */
export async function SaleListing({ sale }: { sale: SaleSummary | Sale }) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const tab = dateTab(sale.date, locale);

  return (
    <li>
      <Link
        href={path(locale, routes.sale(sale.id))}
        className="group flex overflow-hidden rounded-tab border border-haze bg-card transition-colors hover:border-ink/30"
      >
        <span aria-hidden className={`w-1 shrink-0 ${saleEdge[sale.status]}`} />

        <span className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-dashed border-haze px-2 py-4 text-center leading-none">
          <span className="text-[11px] font-semibold text-ink-soft">{tab.weekday}</span>
          <span className="display mt-1 text-2xl text-ink">{tab.day}</span>
          <span className="mt-1 text-[11px] text-ink-soft">{tab.month}</span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3.5">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="display text-lg text-ink group-hover:text-route">{sale.name}</span>
            <span className={`text-xs font-semibold ${saleTagTone[sale.status]}`}>
              {dict.status[sale.status]}
            </span>
          </span>

          <span className="text-sm text-ink-soft">
            {sale.address.line1}, {sale.address.city}
          </span>

          <span className="text-sm text-ink-soft">
            {formatTime(sale.date, locale)}
            {!isLocated(sale.address) && (
              <span className="ml-2 text-xs text-dusk">{dict.route.unlocated}</span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function SaleListingGroup({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}
