import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, matchLocale } from "@/i18n/config";

/**
 * Every page lives under a locale segment. A request without one is sent to the
 * visitor's language: whichever they last chose here, otherwise whatever their
 * browser asks for.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname.split("/")[1];
  if (first && isLocale(first)) return NextResponse.next();

  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    preferred && isLocale(preferred)
      ? preferred
      : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Everything except Next internals, metadata files, and anything with a
    // file extension — those are assets, not pages, and have no locale.
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)",
  ],
};
