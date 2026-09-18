import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { searchSales } from "@/lib/api/sales";
import { fromDateOnly } from "@/lib/format";
import { fillTemplate } from "@/lib/format";
import { errorMessage } from "@/lib/errors";
import { path, routes } from "@/lib/paths";
import type { SaleSort, SaleStatus } from "@/lib/api/types";
import { button, label, panel, saleEdge } from "@/components/ui";
import { CheckboxField, DateField, SelectField } from "@/components/fields";
import { SaleListing, SaleListingGroup } from "@/components/sale-listing";

const PAGE_SIZE = 20;
const STATUSES: SaleStatus[] = ["scheduled", "active", "completed", "cancelled"];
const SORTS: SaleSort[] = ["date", "-date", "created"];

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).sales.title };
}

function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function SalesPage({ searchParams }: PageProps<"/[lang]/sales">) {
  const [dict, locale, params] = await Promise.all([getDictionary(), getLocale(), searchParams]);

  const statuses = asArray(params.status).filter((s): s is SaleStatus =>
    STATUSES.includes(s as SaleStatus),
  );
  const sortParam = typeof params.sort === "string" ? params.sort : "";
  const sort = SORTS.includes(sortParam as SaleSort) ? (sortParam as SaleSort) : "date";
  const dateFrom = typeof params.dateFrom === "string" ? params.dateFrom : "";
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : "";
  const offset = Math.max(0, Number(params.offset) || 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-ink">{dict.sales.title}</h1>
          <p className="mt-2 text-ink-soft">{dict.sales.lede}</p>
        </div>
        <Link href={path(locale, routes.newSale)} className={button.secondary}>
          {dict.sales.newSale}
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[250px_1fr]">
        <form method="get" className={`${panel} h-max p-5`}>
          <h2 className="display text-lg text-ink">{dict.sales.filters}</h2>

          <fieldset className="mt-5">
            <legend className={label}>{dict.sales.status}</legend>
            {/* The dot on each row is the colour that sale will carry in the
                list, so the filter and the results read as one thing. */}
            <div className="-mx-2.5 mt-2 flex flex-col">
              {STATUSES.map((status) => (
                <CheckboxField
                  key={status}
                  id={`status-${status}`}
                  name="status"
                  value={status}
                  defaultChecked={statuses.includes(status)}
                  label={dict.status[status]}
                  swatch={saleEdge[status]}
                />
              ))}
            </div>
          </fieldset>

          {/* Stacked, not side by side: two columns of this sidebar leave about
              70px of content box each, and a date field clips its own segments
              rather than scrolling them. */}
          <div className="mt-5 flex flex-col gap-4">
            <DateField id="dateFrom" name="dateFrom" label={dict.sales.dateFrom} defaultValue={dateFrom} />
            <DateField id="dateTo" name="dateTo" label={dict.sales.dateTo} defaultValue={dateTo} />
          </div>

          <div className="mt-5">
            <SelectField id="sort" name="sort" label={dict.sales.sort} defaultValue={sort}>
              <option value="date">{dict.sales.sortDate}</option>
              <option value="-date">{dict.sales.sortDateDesc}</option>
              <option value="created">{dict.sales.sortCreated}</option>
            </SelectField>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" className={button.primary}>
              {dict.sales.apply}
            </button>
            <Link href={path(locale, routes.sales)} className="text-sm font-semibold text-ink-soft hover:text-ink">
              {dict.sales.reset}
            </Link>
          </div>
        </form>

        <Results
          query={{
            statuses,
            sort,
            offset,
            dateFrom: dateFrom ? (fromDateOnly(dateFrom) ?? undefined) : undefined,
            dateTo: dateTo ? (fromDateOnly(dateTo, true) ?? undefined) : undefined,
          }}
          search={{ statuses, sort, dateFrom, dateTo }}
        />
      </div>
    </div>
  );
}

interface SearchState {
  statuses: SaleStatus[];
  sort: SaleSort;
  dateFrom: string;
  dateTo: string;
}

async function Results({
  query,
  search,
}: {
  query: { statuses: SaleStatus[]; sort: SaleSort; offset: number; dateFrom?: string; dateTo?: string };
  search: SearchState;
}) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  let result;
  try {
    result = await searchSales({ ...query, limit: PAGE_SIZE });
  } catch (error) {
    return (
      <p className={`${panel} border-flag/40 px-4 py-8 text-sm text-flag`}>{errorMessage(dict, error)}</p>
    );
  }

  if (result.sales.length === 0) {
    return (
      <div className={`${panel} px-6 py-12 text-center`}>
        <p className="display text-xl text-ink">{dict.sales.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-[46ch] text-sm text-ink-soft">{dict.sales.emptyBody}</p>
      </div>
    );
  }

  const pageHref = (offset: number) => {
    const params = new URLSearchParams();
    for (const status of search.statuses) params.append("status", status);
    if (search.dateFrom) params.set("dateFrom", search.dateFrom);
    if (search.dateTo) params.set("dateTo", search.dateTo);
    if (search.sort !== "date") params.set("sort", search.sort);
    if (offset > 0) params.set("offset", String(offset));

    const qs = params.toString();
    return `${path(locale, routes.sales)}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <SaleListingGroup>
        {result.sales.map((sale) => (
          <SaleListing key={sale.id} sale={sale} />
        ))}
      </SaleListingGroup>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-haze pt-4">
        <p className="text-sm text-ink-soft">
          {fillTemplate(dict.sales.showing, {
            from: result.offset + 1,
            to: result.offset + result.sales.length,
          })}
        </p>

        <div className="flex gap-2">
          {result.offset > 0 && (
            <Link href={pageHref(Math.max(0, result.offset - result.limit))} className={button.quiet}>
              {dict.sales.previous}
            </Link>
          )}
          {result.has_more && (
            <Link href={pageHref(result.offset + result.limit)} className={button.quiet}>
              {dict.sales.next}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
