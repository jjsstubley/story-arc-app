import { apiFetch } from "~/shared/api/client";
import type { Rating } from "./types";

const ratingUrl = (movieId: number) => `/api/movies/${movieId}/rating`;

/** The current user's rating for a movie, or null if they haven't rated it */
export function fetchRating(movieId: number, signal?: AbortSignal) {
  return apiFetch<Rating | null>(ratingUrl(movieId), { signal });
}

export function saveRating(movieId: number, ratingPercentage: number) {
  return apiFetch<Rating>(ratingUrl(movieId), {
    method: "POST",
    body: { rating_percentage: ratingPercentage },
  });
}

export function deleteRating(movieId: number) {
  return apiFetch<null>(ratingUrl(movieId), { method: "DELETE" });
}
