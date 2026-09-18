import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

/**
 * Error kinds mirror `apperror.Kind` on the API side. The API answers most
 * failures with a plain-text body (`http.Error`) and a few with JSON, so the
 * status code is the reliable signal and the body is only a hint.
 */
export type ApiErrorKind =
  | "invalid"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "too_many"
  | "server"
  | "network";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;

  constructor(kind: ApiErrorKind, status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function kindOf(status: number): ApiErrorKind {
  switch (status) {
    case 400:
    case 415:
      return "invalid";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 429:
      return "too_many";
    default:
      return "server";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  /** Forwarded to fetch; reads that should survive a navigation opt in here. */
  revalidate?: number;
}

interface ApiResponse<T> {
  data: T;
  /** `Location` on a 201 carries the new id — the API sends the bare id, not a URL. */
  location: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = "GET", body, token, revalidate } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: revalidate === undefined ? "no-store" : undefined,
      next: revalidate === undefined ? undefined : { revalidate },
    });
  } catch (cause) {
    throw new ApiError("network", 0, cause instanceof Error ? cause.message : "fetch failed");
  }

  if (!response.ok) {
    throw new ApiError(kindOf(response.status), response.status, await readErrorMessage(response));
  }

  return {
    data: response.status === 204 ? (undefined as T) : await readBody<T>(response),
    location: response.headers.get("Location"),
  };
}

/** The API writes plain text for domain errors and JSON for auth and throttling. */
async function readErrorMessage(response: Response): Promise<string> {
  const text = (await response.text()).trim();
  if (!text) return `HTTP ${response.status}`;

  if (text.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object" && "error" in parsed) {
        return String((parsed as { error: unknown }).error);
      }
    } catch {
      // Fall through to the raw body.
    }
  }

  return text;
}

async function readBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function apiGet<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) {
  return (await request<T>(path, { ...options, method: "GET" })).data;
}

export async function apiSend<T>(path: string, options: RequestOptions & { method: Exclude<RequestOptions["method"], "GET" | undefined> }) {
  return request<T>(path, options);
}

/**
 * Runs a read that is allowed to come back empty, turning a 404 into `null`.
 * Used for the optional profiles: not being a seller is a normal state, not a
 * failure the page needs to report.
 */
export async function optional<T>(read: Promise<T>): Promise<T | null> {
  try {
    return await read;
  } catch (error) {
    if (error instanceof ApiError && error.kind === "not_found") return null;
    throw error;
  }
}
