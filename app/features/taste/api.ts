import { apiFetch } from "~/shared/api/client";
import type { ForYouState, TastePreferences, TastePreferencesUpdate, TasteSearchResult, TasteSearchType } from "./types";

export function fetchForYou(signal?: AbortSignal) {
  return apiFetch<ForYouState>("/api/taste/for-you", { signal });
}

export function refreshForYou(manual: boolean) {
  return apiFetch<ForYouState>("/api/taste/for-you", { method: "POST", body: { manual } });
}

export function fetchTastePreferences(signal?: AbortSignal) {
  return apiFetch<TastePreferences>("/api/taste/preferences", { signal });
}

export function saveTastePreferences(update: TastePreferencesUpdate) {
  return apiFetch<TastePreferences>("/api/taste/preferences", { method: "PATCH", body: update });
}

export function searchTaste(type: TasteSearchType, query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ type, query });
  return apiFetch<TasteSearchResult[]>(`/api/taste/search?${params}`, { signal });
}
