/**
 * Watchlists the client addresses by name rather than uuid. The server resolves
 * "default" to the user's default list (`is_default`); "popcorn" lives in a cookie.
 */
export const DEFAULT_WATCHLIST_ID = "default";
export const POPCORN_WATCHLIST_ID = "popcorn";

/** The id to read or write a list through: "default" for the default list, otherwise its own id */
export function watchlistRef(watchlist: { id: string; is_default: boolean }): string {
  return watchlist.is_default ? DEFAULT_WATCHLIST_ID : watchlist.id;
}
