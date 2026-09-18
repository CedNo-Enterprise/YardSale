import type { Dictionary } from "@/i18n/load";
import { ApiError } from "./api/client";

/**
 * Turns an API failure into something a person can act on. The API's own
 * messages are English and written for developers, so they are replaced rather
 * than shown; the status code is what carries the meaning.
 */
export function errorMessage(dict: Dictionary, error: unknown): string {
  if (!(error instanceof ApiError)) return dict.errors.generic;

  switch (error.kind) {
    case "network":
      return dict.errors.network;
    case "invalid":
      return dict.errors.invalid;
    case "unauthorized":
      return dict.errors.unauthorized;
    case "forbidden":
      return dict.errors.forbidden;
    case "not_found":
      return dict.errors.notFound;
    case "conflict":
      return dict.errors.conflict;
    case "too_many":
      return dict.errors.tooMany;
    default:
      return dict.errors.generic;
  }
}

/** On the sign-in form a 401 means the credentials were wrong, not "sign in". */
export function signInErrorMessage(dict: Dictionary, error: unknown): string {
  if (error instanceof ApiError && error.kind === "unauthorized") return dict.errors.badCredentials;
  return errorMessage(dict, error);
}
