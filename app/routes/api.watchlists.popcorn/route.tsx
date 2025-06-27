import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getPopcornWatchlist, serializePopcornWatchlistCookie } from "~/utils/services/cookies/popcorn-watchlist";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";

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

  const movies = await Promise.all(
    cookie.movieIds.map((id: number) =>
      getMovieDetailsById({ movie_id: id }).catch(() => null)
    )
  );

  // Filter out failed fetches
  const validMovies = movies.filter(Boolean);

  return json({
    exists: true,
    expired: false,
    movieIds: cookie.movieIds ?? [],
    movies: validMovies,
  });
}