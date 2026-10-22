import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "~/shared/ui/notify";
import { createCollection, fetchCollection, removeCollectionItem, updateCollection } from "./api";
import type { CollectionWithMovies, CreateCollectionInput, UpdateCollectionInput } from "./types";

export const collectionKeys = {
  all: ["collections"] as const,
  detail: (id: string) => [...collectionKeys.all, "detail", id] as const,
};

interface UseCollectionOptions {
  /** The same collection already loaded by a loader; seeds the cache so no request is made */
  initialData?: CollectionWithMovies;
}

export function useCollection(id: string, { initialData }: UseCollectionOptions = {}) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: ({ signal }) => fetchCollection(id, signal),
    initialData,
  });
}

/** Creates a collection (empty, or a copy of another). Navigate to it in `onSuccess`. */
export function useCreateCollection() {
  return useMutation({
    mutationFn: (input: CreateCollectionInput) => createCollection(input),
    onError: (error) => notifyError("Couldn't create the collection", error),
  });
}

/** Renames or re-describes a collection; the page updates immediately and rolls back on failure */
export function useUpdateCollection(id: string) {
  const queryClient = useQueryClient();
  const queryKey = collectionKeys.detail(id);

  return useMutation({
    mutationFn: (input: UpdateCollectionInput) => updateCollection(id, input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CollectionWithMovies>(queryKey);
      if (previous) queryClient.setQueryData<CollectionWithMovies>(queryKey, { ...previous, ...input });
      return { previous };
    },

    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      notifyError("Couldn't save the collection", error);
    },

    // The response has no items, so keep ours and take the saved fields
    onSuccess: (saved) =>
      queryClient.setQueryData<CollectionWithMovies>(queryKey, (current) => (current ? { ...current, ...saved } : current)),
  });
}

/** Removes a movie from a collection; the row disappears immediately and comes back on failure */
export function useRemoveCollectionItem(id: string) {
  const queryClient = useQueryClient();
  const queryKey = collectionKeys.detail(id);

  return useMutation({
    mutationFn: (movieId: number) => removeCollectionItem(id, movieId),

    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CollectionWithMovies>(queryKey);
      if (previous) {
        queryClient.setQueryData<CollectionWithMovies>(queryKey, {
          ...previous,
          collection_items: previous.collection_items.filter((item) => item.movie_id !== movieId),
        });
      }
      return { previous };
    },

    onError: (error, _movieId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      notifyError("Couldn't remove the movie", error);
    },
  });
}
