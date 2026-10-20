import { json, type LoaderFunctionArgs } from "@remix-run/node";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AppError, UnauthorizedError, ValidationError, isAppError } from "~/shared/errors";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import type { ApiFailure, ApiSuccess } from "./types";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Params = LoaderFunctionArgs["params"];

export interface ApiContext {
  request: Request;
  params: Params;
  supabase: SupabaseClient;
  user: User;
  /** Carries refreshed Supabase auth cookies; already attached to the response */
  headers: Headers;
}

type ApiHandler = (ctx: ApiContext) => Promise<unknown>;

/**
 * Builds an authenticated resource route. Export the result as both `loader`
 * (GET) and `action` (everything else):
 *
 *   const route = apiRoute({ GET: ..., POST: ... });
 *   export const loader = route;
 *   export const action = route;
 *
 * Handlers return plain data (sent as `{ data }`) or throw an AppError.
 * Auth, method dispatch, error mapping and cookie headers are handled here.
 */
export function apiRoute(handlers: Partial<Record<Method, ApiHandler>>) {
  return async ({ request, params }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const handler = handlers[request.method as Method];

    if (!handler) {
      headers.set("Allow", Object.keys(handlers).join(", "));
      return errorResponse(new AppError("Method not allowed", { code: "METHOD_NOT_ALLOWED", status: 405 }), headers);
    }

    try {
      const supabase = getSupabaseServerClient(request, headers);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new UnauthorizedError();

      const data = await handler({ request, params, supabase, user, headers });
      return json<ApiSuccess<unknown>>({ data: data ?? null }, { headers });
    } catch (error) {
      return errorResponse(error, headers);
    }
  };
}

function errorResponse(error: unknown, headers: Headers) {
  if (isAppError(error)) {
    if (error.status >= 500) console.error(error);
    return json<ApiFailure>({ error: { code: error.code, message: error.message } }, { status: error.status, headers });
  }

  // Unknown errors (Supabase, TMDB, bugs) are logged but never leaked to the client
  console.error("Unhandled API error:", error);
  return json<ApiFailure>(
    { error: { code: "INTERNAL", message: "Something went wrong. Please try again." } },
    { status: 500, headers }
  );
}

/** Reads a positive integer route param, e.g. `$movieId` */
export function requireIntParam(params: Params, name: string): number {
  const value = Number(params[name]);
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`Invalid ${name}`, "INVALID_PARAM");
  }
  return value;
}

/** Parses a JSON request body, throwing a 400 if it is missing or malformed */
export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {
    // fall through
  }
  throw new ValidationError("Request body must be a JSON object", "INVALID_JSON");
}
