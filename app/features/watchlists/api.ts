import { apiFetch } from "~/shared/api/client";
import type { WatchlistInterface } from "~/interfaces/watchlist";
import type { CreateWatchlistInput, WatchlistMembership, WatchlistSummary } from "./types";

// "default" and "popcorn" share these URLs with uuid lists
const itemsUrl = (watchlistId: string) => `/api/watchlists/${watchlistId}/items`;
const itemUrl = (watchlistId: string, movieId: number) => `${itemsUrl(watchlistId)}/${movieId}`;

export function fetchWatchlists(signal?: AbortSignal) {
  return apiFetch<WatchlistSummary[]>("/api/watchlists", { signal });
}

export function createWatchlist(input: CreateWatchlistInput) {
  return apiFetch<WatchlistSummary>("/api/watchlists", { method: "POST", body: input });
}

export function fetchWatchlist(watchlistId: string, signal?: AbortSignal) {
  return apiFetch<WatchlistInterface>(itemsUrl(watchlistId), { signal });
}

export function fetchWatchlistMembership(watchlistId: string, movieId: number, signal?: AbortSignal) {
  return apiFetch<WatchlistMembership>(itemUrl(watchlistId, movieId), { signal });
}

export function saveWatchlistMembership(watchlistId: string, movieId: number, inWatchlist: boolean, mediaType: string) {
  return inWatchlist
    ? apiFetch<WatchlistMembership>(itemUrl(watchlistId, movieId), { method: "PUT", body: { media_type: mediaType } })
    : apiFetch<WatchlistMembership>(itemUrl(watchlistId, movieId), { method: "DELETE" });
}
