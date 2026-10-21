// Public server-only API of the watchlists feature. Import from "~/features/watchlists/index.server".
export {
  createDefaultWatchlist,
  createWatchlist,
  deleteWatchlistById,
  getDefaultWatchlistWMovies,
  getOrCreateDefaultWatchlist,
  getWatchlistById,
  getWatchlistSummaries,
  getWatchlistWMovies,
  requireWatchlistIdParam,
  updateWatchlistById,
} from "./server/watchlists.server";
export {
  getWatchlistItem,
  getWatchlistMembership,
  isMovieInWatchlist,
  setWatchlistMembership,
  updateWatchlistItem,
} from "./server/watchlist-items.server";
export {
  getPopcornMembership,
  getPopcornWatchlist,
  getPopcornWatchlistWMovies,
  serializePopcornWatchlistCookie,
  setPopcornMembership,
} from "./server/popcorn.server";
