import { checkWatchlist } from "./services";

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

