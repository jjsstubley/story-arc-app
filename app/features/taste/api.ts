import { apiFetch } from "~/shared/api/client";
import type { ForYouState, TastePreferences } from "./types";

export function fetchForYou(signal?: AbortSignal) {
  return apiFetch<ForYouState>("/api/taste/for-you", { signal });
}

export function refreshForYou(manual: boolean) {
  return apiFetch<ForYouState>("/api/taste/for-you", { method: "POST", body: { manual } });
}

export function fetchTastePreferences(signal?: AbortSignal) {
  return apiFetch<TastePreferences>("/api/taste/preferences", { signal });
}

export function saveTastePreferences(preferences: TastePreferences) {
  return apiFetch<TastePreferences>("/api/taste/preferences", { method: "PUT", body: preferences });
}
