import { useWatchedMovieCount } from "~/features/watched";
import { WatchlistItemInterface } from "~/interfaces/watchlist";

/**
 * Seen count for a watchlist. Movies use the global watched cache, so the count
 * updates when a movie is toggled anywhere. TV items use their own is_seen.
 */
export function useSeenCount(items: WatchlistItemInterface[], watchlistId: string) {
  const trustIsSeen = watchlistId !== "popcorn"; // cookie list has no real is_seen
  const movieCount = useWatchedMovieCount(
    items
      .filter((item) => item.media_type !== "tv")
      .map((item) => ({
        movieId: item.tmdb_movie_id ?? item.tmdb_id,
        initialWatched: trustIsSeen ? item.is_seen : undefined,
      }))
  );
  const seriesCount = items.filter((item) => item.media_type === "tv" && item.is_seen).length;
  return movieCount + seriesCount;
}
