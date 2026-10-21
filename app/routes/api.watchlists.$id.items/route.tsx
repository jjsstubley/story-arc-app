import { getWatchlistWMovies, requireWatchlistIdParam } from "~/features/watchlists/index.server";
import { apiRoute } from "~/shared/api/route.server";

// "default" or a uuid; "popcorn" is served by api.watchlists.popcorn.items
const route = apiRoute({
  GET: ({ params, user, supabase }) => getWatchlistWMovies(requireWatchlistIdParam(params), user.id, supabase),
});

export const loader = route;
