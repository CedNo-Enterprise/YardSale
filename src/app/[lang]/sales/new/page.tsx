import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSellerByUser } from "@/lib/api/account";
import { optional } from "@/lib/api/client";
import { getSession } from "@/lib/session";
import { toDateTimeLocal } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { AddressFieldset } from "@/components/address-fieldset";
import { SaleForm } from "@/components/sale-form";
import { button, hint, panel } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).saleForm.title };
}

/** Sales mostly happen on a weekend morning, so that is what the form opens on. */
function nextSaturdayMorning(): string {
  const date = new Date();
  date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
  date.setHours(8, 0, 0, 0);
  return toDateTimeLocal(date.toISOString());
}

export default async function NewSalePage() {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  if (!session) {
    redirect(`${path(locale, routes.signIn)}?next=${encodeURIComponent(path(locale, routes.newSale))}`);
  }

  const seller = await optional(getSellerByUser(session.userId));

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="display text-4xl text-ink">{dict.saleForm.title}</h1>
      <p className="mt-3 max-w-[56ch] text-ink-soft">{dict.saleForm.lede}</p>

      {seller ? (
        <>
          <div className={`${panel} mt-8 p-6`}>
            <SaleForm
              locale={locale}
              sellerId={seller.id}
              defaultDate={nextSaturdayMorning()}
              labels={{
                name: dict.saleForm.name,
                namePlaceholder: dict.saleForm.namePlaceholder,
                description: dict.saleForm.description,
                descriptionPlaceholder: dict.saleForm.descriptionPlaceholder,
                optional: dict.common.optional,
                date: dict.saleForm.date,
                submit: dict.saleForm.submit,
                saving: dict.common.saving,
              }}
            >
              <AddressFieldset />
            </SaleForm>
          </div>

          <p className={`${hint} mt-4 max-w-[62ch] leading-relaxed`}>{dict.saleForm.geocodeNote}</p>
        </>
      ) : (
        <div className={`${panel} mt-8 p-6`}>
          <h2 className="display text-xl text-ink">{dict.saleForm.needSellerTitle}</h2>
          <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-ink-soft">
            {dict.saleForm.needSellerBody}
          </p>
          <Link href={path(locale, routes.account)} className={`${button.primary} mt-5`}>
            {dict.saleForm.needSellerCta}
          </Link>
        </div>
      )}
    </div>
  );
}
