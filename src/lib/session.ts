import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "yardsale_session";

export interface Session {
  token: string;
  userId: string;
}

interface TokenClaims {
  sub?: unknown;
  exp?: unknown;
}

/**
 * Reads the claims out of the API's JWT without verifying it. The signature is
 * the API's business — it re-checks the token on every authenticated call. Here
 * the payload is only used to know who is signed in and when to stop sending a
 * token that has already expired.
 */
function readClaims(token: string): TokenClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const claims: unknown = JSON.parse(json);
    return claims && typeof claims === "object" ? (claims as TokenClaims) : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const claims = readClaims(token);
  if (!claims || typeof claims.sub !== "string" || !claims.sub) return null;

  if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) return null;

  return { token, userId: claims.sub };
}

/** Only callable from a Server Action or Route Handler. */
export async function startSession(token: string, expiresAt: string): Promise<void> {
  const expires = new Date(expiresAt);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: Number.isNaN(expires.getTime()) ? undefined : expires,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
