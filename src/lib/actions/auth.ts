"use server";

import { redirect } from "next/navigation";
import { loadDictionary } from "@/i18n/load";
import { login, logout, register } from "@/lib/api/account";
import { endSession, getSession, startSession } from "@/lib/session";
import { errorMessage, signInErrorMessage } from "@/lib/errors";
import { path, routes } from "@/lib/paths";
import { localeFrom, safeRedirect, text, type FormState } from "./shared";

export async function signInAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const email = text(formData, "email");
  const password = text(formData, "password");
  if (!email || !password) return { error: dict.errors.invalid };

  try {
    const result = await login({ email, password });
    await startSession(result.token, result.expires_at);
  } catch (error) {
    return { error: signInErrorMessage(dict, error) };
  }

  redirect(safeRedirect(formData, path(locale, routes.account)));
}

export async function registerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const dict = await loadDictionary(locale);

  const username = text(formData, "username");
  const email = text(formData, "email");
  const password = text(formData, "password");
  if (!username || !email || !password) return { error: dict.errors.invalid };

  try {
    await register({ username, email, password });
    // Signing in straight away spares a second form for something the person
    // has just typed.
    const result = await login({ email, password });
    await startSession(result.token, result.expires_at);
  } catch (error) {
    return { error: errorMessage(dict, error) };
  }

  redirect(path(locale, routes.account));
}

export async function signOutAction(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const session = await getSession();

  if (session) {
    try {
      await logout(session.token);
    } catch {
      // The token is being thrown away either way; a failed revoke on the API
      // side must not leave someone stuck signed in here.
    }
  }

  await endSession();
  redirect(path(locale, routes.home));
}
