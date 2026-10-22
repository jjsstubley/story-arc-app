import { apiFetch } from "~/shared/api/client";
import type { MovieReviews, Review } from "./types";

const reviewsUrl = (movieId: number) => `/api/movies/${movieId}/reviews`;

export function fetchMovieReviews(movieId: number, signal?: AbortSignal) {
  return apiFetch<MovieReviews>(reviewsUrl(movieId), { signal });
}

export function saveReview(movieId: number, reviewText: string) {
  return apiFetch<Review>(reviewsUrl(movieId), { method: "POST", body: { review_text: reviewText } });
}

export function deleteReview(movieId: number) {
  return apiFetch<null>(reviewsUrl(movieId), { method: "DELETE" });
}
