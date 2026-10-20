// Public server-only API of the watched feature. Import from "~/features/watched/index.server".
export {
  addWatchedMovie,
  applyWatchedStatus,
  getMovieWatchedStatus,
  getWatchedMovieIds,
  isMovieWatched,
  removeWatchedMovie,
  setMovieWatched,
} from "./server/watched-movies.server";
