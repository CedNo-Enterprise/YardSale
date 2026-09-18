import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { path, routes } from "@/lib/paths";

export async function SiteFooter() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <footer className="mt-20 border-t border-haze">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-6 text-sm text-ink-soft">
        <span className="display text-base text-ink">YardSale</span>
        <Link href={path(locale, routes.sales)} className="hover:text-ink">
          {dict.nav.sales}
        </Link>
        <Link href={path(locale, routes.itineraries)} className="hover:text-ink">
          {dict.nav.routes}
        </Link>
        <Link href={path(locale, routes.newSale)} className="hover:text-ink">
          {dict.sales.newSale}
        </Link>
      </div>
    </footer>
  );
}
