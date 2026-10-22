import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "~/shared/ui/notify";
import { fetchFavourite, saveFavourite } from "./api";
import type { FavouriteStatus } from "./types";

export const favouriteKeys = {
  all: ["favourites"] as const,
  movie: (movieId: number) => [...favouriteKeys.all, "movie", movieId] as const,
};

export function useFavourite(movieId: number, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: favouriteKeys.movie(movieId),
    queryFn: ({ signal }) => fetchFavourite(movieId, signal),
    enabled,
  });
}

/**
 * Adds or removes a movie from favourites. Updates the cache optimistically,
 * rolls back with a toast on failure, and stores the server's answer on success.
 */
export function useSetFavourite(movieId: number) {
  const queryClient = useQueryClient();
  const queryKey = favouriteKeys.movie(movieId);

  return useMutation({
    mutationFn: (favourite: boolean) => saveFavourite(movieId, favourite),

    onMutate: async (favourite) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FavouriteStatus>(queryKey);
      queryClient.setQueryData<FavouriteStatus>(queryKey, { favourite });
      return { previous };
    },

    onError: (error, _favourite, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      } else {
        queryClient.removeQueries({ queryKey });
      }
      notifyError("Couldn't update favourites", error);
    },

    // The response is the new server state, so store it rather than refetching
    onSuccess: (status) => queryClient.setQueryData(queryKey, status),
  });
}
