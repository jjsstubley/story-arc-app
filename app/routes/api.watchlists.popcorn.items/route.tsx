import { getPopcornWatchlistWMovies } from "~/features/watchlists/index.server";
import { publicApiRoute } from "~/shared/api/route.server";

// The popcorn list lives in a cookie, so it works signed out
const route = publicApiRoute({
  GET: ({ request }) => getPopcornWatchlistWMovies(request),
});

export const loader = route;
