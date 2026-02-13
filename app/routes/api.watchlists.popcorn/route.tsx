import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getPopcornWatchlist, getPopcornWatchlistWMovies, serializePopcornWatchlistCookie } from "~/utils/services/cookies/popcorn-watchlist";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('api/watchlist/popcorn')
  const cookie = await getPopcornWatchlist(request)
  console.log('api/watchlist/popcorn cookie', cookie)

  if (!cookie) {
    return json(
      {
        exists: false,
        expired: true,
        movieIds: [],
      },
      {
        headers: await serializePopcornWatchlistCookie(null),
      }
    );
  }

  const watchlist = await getPopcornWatchlistWMovies(request);

  return json({
    exists: true,
    expired: false,
    watchlist,
  });
}