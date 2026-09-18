import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSession } from "@/lib/session";
import { path, routes } from "@/lib/paths";
import { RegisterForm } from "@/components/auth-forms";
import { link, panel } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).auth.registerTitle };
}

export default async function RegisterPage() {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  if (session) redirect(path(locale, routes.account));

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="display text-4xl text-ink">{dict.auth.registerTitle}</h1>
      <p className="mt-3 text-ink-soft">{dict.auth.registerLede}</p>

      <div className={`${panel} mt-8 p-6`}>
        <RegisterForm
          locale={locale}
          labels={{
            username: dict.auth.username,
            usernameHint: dict.auth.usernameHint,
            email: dict.auth.email,
            password: dict.auth.password,
            passwordHint: dict.auth.passwordHint,
            submit: dict.auth.register,
            saving: dict.common.saving,
          }}
        />
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        {dict.auth.haveAccount}{" "}
        <Link href={path(locale, routes.signIn)} className={link}>
          {dict.auth.signIn}
        </Link>
      </p>
    </div>
  );
}
