import { AppError } from "~/shared/errors";

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Serialised as JSON */
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Calls a route built with `apiRoute` and returns its `data`.
 * Throws an AppError for non-2xx responses and network failures, so callers
 * (usually React Query) never have to inspect `response.ok`.
 *
 * Only use this for routes that return the `{ data }` envelope.
 */
export async function apiFetch<T>(url: string, { method = "GET", body, signal }: ApiFetchOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AppError("Couldn't reach the server. Check your connection and try again.", { code: "NETWORK", status: 0 });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    // Tolerate legacy routes that return `{ error: "message" }`
    const message = typeof error === "string" ? error : error?.message;
    throw new AppError(message || response.statusText || "Request failed", {
      code: error?.code ?? "HTTP_ERROR",
      status: response.status,
    });
  }

  return (payload?.data ?? null) as T;
}
