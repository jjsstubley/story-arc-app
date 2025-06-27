// routes/api/temp-watchlist.check.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getPopcornWatchlist, serializePopcornWatchlistCookie } from "~/utils/services/cookies/popcorn-watchlist";

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log('api/watchlist/popcorn/movies/$movieId')
  const { movieId } = params;

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  }

  const cookie = await getPopcornWatchlist(request)

  if (!cookie) {
    return json({ exists: false, expired: true }, {
      headers: await serializePopcornWatchlistCookie(null),
    });
  }

  const exists = cookie.movieIds?.includes(parseInt(movieId)) ?? false;

  return json({ exists, expired: false });
}