import { apiFetch } from "~/shared/api/client";
import type { Collection, CollectionWithMovies, CreateCollectionInput, UpdateCollectionInput } from "./types";

const collectionUrl = (id: string) => `/api/collections/${id}`;

export function fetchCollection(id: string, signal?: AbortSignal) {
  return apiFetch<CollectionWithMovies>(collectionUrl(id), { signal });
}

export function createCollection(input: CreateCollectionInput) {
  return apiFetch<Collection>("/api/collections", { method: "POST", body: input });
}

export function updateCollection(id: string, input: UpdateCollectionInput) {
  return apiFetch<Collection>(collectionUrl(id), { method: "PATCH", body: input });
}

export function removeCollectionItem(id: string, movieId: number) {
  return apiFetch<{ inCollection: boolean }>(`${collectionUrl(id)}/movies/${movieId}`, { method: "DELETE" });
}
