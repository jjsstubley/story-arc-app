import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "~/shared/ui/notify";
import { deleteRating, fetchRating, saveRating } from "./api";
import { getRatingTier } from "./tiers";
import type { Rating } from "./types";

export const ratingKeys = {
  all: ["ratings"] as const,
  detail: (movieId: number) => [...ratingKeys.all, "detail", movieId] as const,
};

export function useRating(movieId: number) {
  return useQuery({
    queryKey: ratingKeys.detail(movieId),
    queryFn: ({ signal }) => fetchRating(movieId, signal),
  });
}

/**
 * Sets the user's rating for a movie; pass `null` to clear it.
 * Updates the cache optimistically and rolls back with a toast on failure.
 */
export function useUpdateRating(movieId: number) {
  const queryClient = useQueryClient();
  const queryKey = ratingKeys.detail(movieId);

  return useMutation({
    mutationFn: (percentage: number | null) =>
      percentage === null ? deleteRating(movieId) : saveRating(movieId, percentage),

    onMutate: async (percentage) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Rating | null>(queryKey) ?? null;
      queryClient.setQueryData<Rating | null>(queryKey, optimisticRating(previous, movieId, percentage));
      return { previous };
    },

    onError: (error, _percentage, context) => {
      queryClient.setQueryData(queryKey, context?.previous ?? null);
      notifyError("Couldn't save your rating", error);
    },

    // The server is the source of truth; refetch whatever happened
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

function optimisticRating(previous: Rating | null, movieId: number, percentage: number | null): Rating | null {
  if (percentage === null) return null;
  const now = new Date().toISOString();
  return {
    id: previous?.id ?? "optimistic",
    user_id: previous?.user_id ?? "",
    tmdb_movie_id: movieId,
    created_at: previous?.created_at ?? now,
    updated_at: now,
    rating_percentage: percentage,
    rating_tier: getRatingTier(percentage),
  };
}
