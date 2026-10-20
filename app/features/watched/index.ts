// Public client-safe API of the watched feature. Import from "~/features/watched" only.
export { default as MovieWatchedBadge } from "./components/movie-watched-badge";
export { useMovieWatched, useSetMovieWatched, useWatchedMovieCount, watchedKeys } from "./queries";
export type { MovieWatchedStatus } from "./types";
