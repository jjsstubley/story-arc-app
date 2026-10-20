import { apiFetch } from "~/shared/api/client";
import type { MovieWatchedStatus } from "./types";

const watchedUrl = (movieId: number) => `/api/movies/${movieId}/watched`;

export function fetchMovieWatched(movieId: number, signal?: AbortSignal) {
  return apiFetch<MovieWatchedStatus>(watchedUrl(movieId), { signal });
}

export function saveMovieWatched(movieId: number, watched: boolean) {
  return apiFetch<MovieWatchedStatus>(watchedUrl(movieId), { method: "POST", body: { watched } });
}
