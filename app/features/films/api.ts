import { apiFetch } from "~/shared/api/client";
import type { SimilarStories } from "./types";

export function fetchSimilarStories(movieId: number, signal?: AbortSignal) {
  return apiFetch<SimilarStories>(`/api/movies/${movieId}/similar-stories`, { signal });
}
