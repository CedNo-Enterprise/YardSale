"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import { registerAction, signInAction } from "@/lib/actions/auth";
import { emptyFormState } from "@/lib/actions/state";
import { TextField } from "./fields";
import { FormMessage, SubmitButton } from "./form";
import { button } from "./ui";

export interface SignInLabels {
  email: string;
  password: string;
  submit: string;
  saving: string;
}

export function SignInForm({
  locale,
  labels,
  redirectTo,
}: {
  locale: Locale;
  labels: SignInLabels;
  redirectTo?: string;
}) {
  const [state, action] = useActionState(signInAction, emptyFormState);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lang" value={locale} />
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      <FormMessage error={state.error} />

      <TextField
        id="email"
        name="email"
        type="email"
        label={labels.email}
        required
        autoComplete="email"
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label={labels.password}
        required
        minLength={12}
        maxLength={64}
        autoComplete="current-password"
      />

      <SubmitButton className={button.primary} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}

export interface RegisterLabels extends SignInLabels {
  username: string;
  usernameHint: string;
  passwordHint: string;
}

export function RegisterForm({ locale, labels }: { locale: Locale; labels: RegisterLabels }) {
  const [state, action] = useActionState(registerAction, emptyFormState);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lang" value={locale} />

      <FormMessage error={state.error} />

      <TextField
        id="username"
        name="username"
        label={labels.username}
        hint={labels.usernameHint}
        required
        minLength={3}
        maxLength={15}
        pattern="[A-Za-z0-9]+"
        autoComplete="username"
      />
      <TextField
        id="email"
        name="email"
        type="email"
        label={labels.email}
        required
        autoComplete="email"
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label={labels.password}
        hint={labels.passwordHint}
        required
        minLength={12}
        maxLength={64}
        autoComplete="new-password"
      />

      <SubmitButton className={button.primary} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
