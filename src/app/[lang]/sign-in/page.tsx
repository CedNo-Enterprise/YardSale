import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSession } from "@/lib/session";
import { path, routes } from "@/lib/paths";
import { SignInForm } from "@/components/auth-forms";
import { link, panel } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).auth.signInTitle };
}

export default async function SignInPage({ searchParams }: PageProps<"/[lang]/sign-in">) {
  const [dict, locale, params, session] = await Promise.all([
    getDictionary(),
    getLocale(),
    searchParams,
    getSession(),
  ]);

  if (session) redirect(path(locale, routes.account));

  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="display text-4xl text-ink">{dict.auth.signInTitle}</h1>
      <p className="mt-3 text-ink-soft">{dict.auth.signInLede}</p>

      <div className={`${panel} mt-8 p-6`}>
        <SignInForm
          locale={locale}
          redirectTo={next}
          labels={{
            email: dict.auth.email,
            password: dict.auth.password,
            submit: dict.auth.signIn,
            saving: dict.common.saving,
          }}
        />
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        {dict.auth.noAccount}{" "}
        <Link href={path(locale, routes.register)} className={link}>
          {dict.auth.createAccount}
        </Link>
      </p>
    </div>
  );
}
