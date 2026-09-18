import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getBuyer, getSellerByUser, getUser } from "@/lib/api/account";
import { optional } from "@/lib/api/client";
import { getSession } from "@/lib/session";
import { signOutAction } from "@/lib/actions/auth";
import { fillTemplate, formatDateShort, formatPrice } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { AddressFieldset } from "@/components/address-fieldset";
import { BuyerProfileForm, SellerProfileForm } from "@/components/account-forms";
import { SubmitButton } from "@/components/form";
import { button, panel } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).account.title };
}

export default async function AccountPage() {
  const [dict, locale, session] = await Promise.all([getDictionary(), getLocale(), getSession()]);

  if (!session) {
    redirect(`${path(locale, routes.signIn)}?next=${encodeURIComponent(path(locale, routes.account))}`);
  }

  const [user, buyer, seller] = await Promise.all([
    optional(getUser(session.userId)),
    optional(getBuyer(session.token)),
    optional(getSellerByUser(session.userId)),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-ink">{dict.account.title}</h1>
          {user && (
            <>
              <p className="mt-2 text-ink-soft">
                {fillTemplate(dict.account.signedInAs, { username: user.username })}
              </p>
              <p className="text-sm text-ink-soft">
                {user.email} — {fillTemplate(dict.account.memberSince, {
                  date: formatDateShort(user.created_at, locale),
                })}
              </p>
            </>
          )}
        </div>

        <form action={signOutAction}>
          <input type="hidden" name="lang" value={locale} />
          <SubmitButton className={button.secondary}>{dict.account.signOut}</SubmitButton>
        </form>
      </header>

      <section className="mt-12">
        <h2 className="display text-2xl text-ink">{dict.account.sellerTitle}</h2>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-soft">{dict.account.sellerLede}</p>

        <div className={`${panel} mt-5 p-6`}>
          {seller ? (
            <>
              <p className="display text-xl text-ink">{seller.name}</p>

              <Link href={path(locale, routes.newSale)} className={`${button.primary} mt-5`}>
                {dict.sales.newSale}
              </Link>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-ink">{dict.account.savedAddresses}</h3>
                  {seller.saved_addresses.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-soft">{dict.account.savedAddressesNone}</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-3">
                      {seller.saved_addresses.map((saved) => (
                        <li key={saved.id} className="text-sm text-ink-soft">
                          <span className="font-semibold text-ink">{saved.label}</span>
                          {saved.is_default && (
                            <span className="ml-2 text-xs text-route">{dict.account.defaultAddress}</span>
                          )}
                          <br />
                          {saved.address.line1}, {saved.address.city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-ink">{dict.account.inventory}</h3>
                  {seller.inventory.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-soft">{dict.account.inventoryNone}</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-2">
                      {seller.inventory.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 text-sm">
                          <span className="text-ink">{item.name}</span>
                          <span className="text-ink-soft">{formatPrice(item.price, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-soft">{dict.account.sellerNone}</p>
              <div className="mt-5">
                <SellerProfileForm
                  locale={locale}
                  labels={{
                    name: dict.account.sellerName,
                    submit: dict.account.createSeller,
                    saving: dict.common.saving,
                    done: dict.account.saved,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="display text-2xl text-ink">{dict.account.buyerTitle}</h2>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-soft">{dict.account.buyerLede}</p>

        <div className={`${panel} mt-5 p-6`}>
          {!buyer && <p className="mb-5 text-sm text-ink-soft">{dict.account.buyerNone}</p>}

          <BuyerProfileForm
            locale={locale}
            mode={buyer ? "update" : "create"}
            defaultDisplayName={buyer?.display_name}
            labels={{
              displayName: dict.account.displayName,
              submit: buyer ? dict.account.updateBuyer : dict.account.createBuyer,
              saving: dict.common.saving,
              done: dict.account.saved,
            }}
          >
            <AddressFieldset
              legend={dict.account.homeAddress}
              required={false}
              defaults={buyer?.home_address}
            />
          </BuyerProfileForm>
        </div>
      </section>
    </div>
  );
}
