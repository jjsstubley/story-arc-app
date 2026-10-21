import type { User } from "@supabase/supabase-js";
import { getPopcornMembership, setPopcornMembership } from "~/features/watchlists/index.server";
import { publicApiRoute, requireIntParam, type ApiContext } from "~/shared/api/route.server";

async function setMembership({ request, params, headers }: ApiContext<User | null>, inWatchlist: boolean) {
  const result = await setPopcornMembership(request, requireIntParam(params, "movieId"), inWatchlist);
  headers.append("Set-Cookie", result.headers["Set-Cookie"]);
  return result.membership;
}

// The popcorn list lives in a cookie, so it works signed out
const route = publicApiRoute({
  GET: ({ request, params }) => getPopcornMembership(request, requireIntParam(params, "movieId")),
  PUT: (ctx) => setMembership(ctx, true),
  DELETE: (ctx) => setMembership(ctx, false),
});

export const loader = route;
export const action = route;
