import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { path, routes } from "@/lib/paths";
import { button } from "@/components/ui";

export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <h1 className="display text-4xl text-ink">{dict.common.notFoundTitle}</h1>
      <p className="mt-4 text-ink-soft">{dict.common.notFoundBody}</p>
      <Link href={path(locale, routes.home)} className={`${button.secondary} mt-8`}>
        {dict.common.backHome}
      </Link>
    </div>
  );
}
