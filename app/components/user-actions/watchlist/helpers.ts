import { checkWatchlist, checkTVSeries } from "./services";

/**
 * Check if a movie is in any of the user's watchlists
 * For now, we check the default watchlist. This can be enhanced to check all watchlists.
 */
export const isMovieInAnyWatchlist = async (movieId: number): Promise<boolean> => {
  try {
    const response = await checkWatchlist("default", movieId);
    return response?.exists || false;
  } catch (error) {
    console.error("Failed to check watchlist", error);
    return false;
  }
};

/**
 * Get watchlist item status including is_seen
 * Returns watchlist item details if it exists
 * For movies, checks watchlist_items table
 * For TV series, checks saved_tv_series table
 */
export const getWatchlistItemStatus = async (
  mediaId: number,
  mediaType: "movie" | "tv" = "movie"
): Promise<{ exists: boolean; is_seen: boolean | null; watchlistId: string | null }> => {
  try {
    if (mediaType === "tv") {
      // For TV series, use the saved_tv_series endpoint
      const response = await checkTVSeries(mediaId);
      if (response && typeof response === "object") {
        // The TV series endpoint might not return is_seen yet, so we'll need to handle that
        // For now, return exists status. We may need to update the API endpoint to return is_seen
        return {
          exists: response.exists || false,
          is_seen: response.is_seen ?? null,
          watchlistId: response.watchlistId ?? null,
        };
      }
      return { exists: false, is_seen: null, watchlistId: null };
    } else {
      // For movies, use the watchlist endpoint
      const response = await checkWatchlist("default", mediaId);
      if (response && typeof response === "object") {
        return {
          exists: response.exists || false,
          is_seen: response.is_seen ?? null,
          watchlistId: response.watchlistId ?? null,
        };
      }
      return { exists: false, is_seen: null, watchlistId: null };
    }
  } catch (error) {
    console.error("Failed to get watchlist item status", error);
    return { exists: false, is_seen: null, watchlistId: null };
  }
};

