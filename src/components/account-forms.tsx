"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import { becomeSellerAction, saveBuyerAction } from "@/lib/actions/account";
import { emptyFormState } from "@/lib/actions/state";
import { TextField } from "./fields";
import { FormMessage, SubmitButton } from "./form";
import { useActionNotice } from "./notifications";
import { button } from "./ui";

export function BuyerProfileForm({
  locale,
  mode,
  defaultDisplayName,
  labels,
  children,
}: {
  locale: Locale;
  mode: "create" | "update";
  defaultDisplayName?: string;
  labels: { displayName: string; submit: string; saving: string; done: string };
  /** The home-address fieldset, rendered on the server so it can be translated. */
  children: React.ReactNode;
}) {
  const [state, action] = useActionState(saveBuyerAction, emptyFormState);
  useActionNotice(state, labels.done);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="mode" value={mode} />

      <FormMessage error={state.error} />

      <TextField
        id="displayName"
        name="displayName"
        label={labels.displayName}
        required
        minLength={3}
        maxLength={32}
        defaultValue={defaultDisplayName}
      />

      {children}

      <SubmitButton className={`${button.primary} self-start`} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}

export function SellerProfileForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { name: string; submit: string; saving: string; done: string };
}) {
  const [state, action] = useActionState(becomeSellerAction, emptyFormState);
  useActionNotice(state, labels.done);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lang" value={locale} />

      <FormMessage error={state.error} />

      <TextField id="sellerName" name="username" label={labels.name} required maxLength={32} />

      <SubmitButton className={`${button.primary} self-start`} pendingLabel={labels.saving}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
