import Link from "next/link";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSession } from "@/lib/session";
import { path, routes } from "@/lib/paths";
import { LocaleSwitcher } from "./locale-switcher";
import { NavLink } from "./nav-link";

export async function SiteHeader() {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  return (
    <header className="sticky top-0 z-20 border-b border-haze bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <Link href={path(locale, routes.home)} className="flex items-center gap-2">
          <RouteMark />
          <span className="display text-xl">YardSale</span>
        </Link>

        <nav className="flex items-center gap-5" aria-label={dict.brand}>
          <NavLink href={path(locale, routes.sales)}>{dict.nav.sales}</NavLink>
          <NavLink href={path(locale, routes.itineraries)}>{dict.nav.routes}</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Suspense fallback={<div className="h-6 w-16" />}>
            <LocaleSwitcher current={locale} label={dict.nav.language} />
          </Suspense>
          <Link
            href={path(locale, session ? routes.account : routes.signIn)}
            className="text-sm font-semibold text-ink hover:text-route"
          >
            {session ? dict.nav.account : dict.nav.signIn}
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Three stops joined by a line — the same shape the route pages are built on. */
function RouteMark() {
  return (
    <svg width="34" height="14" viewBox="0 0 34 14" aria-hidden className="shrink-0">
      <path
        d="M4 10 C 11 10, 10 4, 17 4 S 26 10, 30 10"
        fill="none"
        stroke="var(--route)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="4" cy="10" r="3" fill="var(--route)" />
      <circle cx="17" cy="4" r="3" fill="var(--paper)" stroke="var(--route)" strokeWidth="1.75" />
      <circle cx="30" cy="10" r="3.5" fill="var(--flag)" />
    </svg>
  );
}
