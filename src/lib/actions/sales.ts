"use server";

import { redirect } from "next/navigation";
import { loadDictionary } from "@/i18n/load";
import { createSale } from "@/lib/api/sales";
import { getSession } from "@/lib/session";
import { errorMessage } from "@/lib/errors";
import { fromDateTimeLocal } from "@/lib/format";
import { path, routes } from "@/lib/paths";
import { addressFrom, localeFrom, text, type FormState } from "./shared";

export async function createSaleAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const sellerId = text(formData, "sellerId");
  const name = text(formData, "name");
  const date = fromDateTimeLocal(text(formData, "date"));
  const address = addressFrom(formData);

  if (!sellerId || !name || !date || !address) return { error: dict.errors.invalid };

  let saleId: string | null;
  try {
    saleId = await createSale(
      { sellerId, name, description: text(formData, "description"), date, address },
      session.token,
    );
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  redirect(saleId ? path(locale, routes.sale(saleId)) : path(locale, routes.sales));
}
