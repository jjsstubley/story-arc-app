// app/utils/cookies.ts
import { createCookie } from "@remix-run/node";
import { TempWatchlistProps } from "~/interfaces/temp-watchlist";
import { getMovieDetailsById } from "../external/tmdb/movies";
import { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist";

const COOKIE_NAME = 'popcorn_list'
const MAX_AGE = 2 * 24 * 60 * 60; // 2 days (updated on each set)

export const popcornWatchlistCookie = createCookie(COOKIE_NAME, {
  maxAge: MAX_AGE, // 2 days (updated on each set)
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

export async function parsePopcornWatchlistCookie(request: Request): Promise<TempWatchlistProps | null> {
  console.log('parsePopcornWatchlistCookie')
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await popcornWatchlistCookie.parse(cookieHeader);

  if (
    !cookie ||
    !cookie.updatedAt ||
    Date.now() - cookie.updatedAt > MAX_AGE * 1000
  ) {
    return null; // expired or missing
  }

  console.log('parsePopcornWatchlistCookie cookie', cookie)

  return cookie;
}

export async function serializePopcornWatchlistCookie(
  watchlist: TempWatchlistProps | null
) {
  console.log('serializePopcornWatchlistCookie', watchlist)
  return {
    "Set-Cookie": await popcornWatchlistCookie.serialize(watchlist),
  };
}

export async function getPopcornWatchlist(request: Request): Promise<TempWatchlistProps | null> {
  console.log('getPopcornWatchlist')
  return await parsePopcornWatchlistCookie(request);
}

export async function getPopcornWatchlistWMovies(request: Request): Promise<WatchlistInterface> {
  console.log('getPopcornWatchlistWMovies')
  const cookie = await getPopcornWatchlist(request);

  const items = cookie?.movieIds || [];

  const watchlist_items: WatchlistItemInterface[] = await Promise.all(
    items.map(async (tmdb_movie_id) => {
      try {
        const movie = await getMovieDetailsById({ movie_id: tmdb_movie_id });

        return {
          id: `popcorn-${tmdb_movie_id}`, // mock ID
          tmdb_movie_id,
          user_id: "anonymous", // or null / system default
          added_at: cookie?.updatedAt ? new Date(cookie.updatedAt).toISOString() : new Date().toISOString(),
          watchlist_id: "temp", // or null
          is_seen: false,
          movie,
        };
      } catch (e) {
        console.warn(`Failed to fetch movie ${tmdb_movie_id}`, e);
        return null;
      }
    })
  ).then(items => items.filter(Boolean) as WatchlistItemInterface[]);

  // Always return a valid watchlist structure, even when empty
  const now = new Date().toISOString();
  const watchlist: WatchlistInterface = {
    id: "popcorn",
    user_id: "anonymous",
    created_at: watchlist_items.length > 0 
      ? watchlist_items[0].added_at 
      : now, // Use current date if no items exist
    updated_at: cookie?.updatedAt 
      ? new Date(cookie.updatedAt).toISOString() 
      : now,
    name: "Popcorn Watchlist",
    descriptions: "A quick list of movies you're in the mood to watch — perfect for tonight's lineup.",
    tags: [],
    is_public: false,
    is_default: false,
    source: "cookie",
    forked_from_watchlist_id: "",
    shared_with: "",
    watchlist_items: watchlist_items || [], // Ensure it's always an array
  };

  return watchlist;
}

export async function addToPopcornWatchlist(request: Request, movieId: number) {
  console.log('addToPopcornWatchlist')
  let watchlist = await getPopcornWatchlist(request);

  console.log('addToPopcornWatchlist watchlist before', watchlist)

  if (!watchlist) {
    watchlist = {
      movieIds: [movieId],
      updatedAt: Date.now(),
    };
  } else {
    if (!watchlist.movieIds.includes(movieId)) {
      watchlist.movieIds.push(movieId);
    }
    watchlist.updatedAt = Date.now();
  }

  return {
    headers: await serializePopcornWatchlistCookie(watchlist)
  }
}

export async function removeFromPopcornWatchlist(request: Request, movieId: number) {
  console.log('removeFromPopcornWatchlist')
  const watchlist = await getPopcornWatchlist(request);

  if (!watchlist) {
    return {
      headers: await serializePopcornWatchlistCookie(null), // no action needed
    };
  }

  watchlist.movieIds = watchlist.movieIds.filter(id => id !== movieId);
  watchlist.updatedAt = Date.now();

  const newValue = watchlist.movieIds.length === 0 ? null : watchlist;

  return {
    headers: await serializePopcornWatchlistCookie(newValue)
  };
}

export async function clearPopcornWatchlist() {
  console.log('clearPopcornWatchlist')
  return serializePopcornWatchlistCookie(null);
}