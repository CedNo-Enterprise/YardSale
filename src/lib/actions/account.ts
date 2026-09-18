"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { loadDictionary } from "@/i18n/load";
import { createBuyer, createSeller, updateBuyer } from "@/lib/api/account";
import { getSession } from "@/lib/session";
import { errorMessage } from "@/lib/errors";
import { path, routes } from "@/lib/paths";
import { addressFrom, localeFrom, text, type FormState } from "./shared";

export async function becomeSellerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const username = text(formData, "username");
  if (!username) return { error: dict.errors.invalid };

  try {
    await createSeller(username, session.token);
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}

export async function saveBuyerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const session = await getSession();
  if (!session) redirect(path(locale, routes.signIn));

  const displayName = text(formData, "displayName");
  if (!displayName) return { error: dict.errors.invalid };

  const homeAddress = addressFrom(formData) ?? undefined;

  try {
    if (text(formData, "mode") === "update") {
      // A home address left blank means "leave it alone"; the API replaces an
      // address whole, so a partial patch is never sent.
      await updateBuyer({ displayName, homeAddress }, session.token);
    } else {
      await createBuyer({ displayName, homeAddress }, session.token);
    }
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  refresh();
  return { ok: true };
}
