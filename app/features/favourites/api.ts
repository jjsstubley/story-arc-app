import { apiFetch } from "~/shared/api/client";
import type { FavouriteStatus } from "./types";

const favouriteUrl = (movieId: number) => `/api/movies/${movieId}/favourite`;

export function fetchFavourite(movieId: number, signal?: AbortSignal) {
  return apiFetch<FavouriteStatus>(favouriteUrl(movieId), { signal });
}

export function saveFavourite(movieId: number, favourite: boolean) {
  return apiFetch<FavouriteStatus>(favouriteUrl(movieId), { method: "POST", body: { favourite } });
}
