import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "~/shared/ui/notify";
import { deleteReview, fetchMovieReviews, saveReview } from "./api";
import type { MovieReviews } from "./types";

export const reviewKeys = {
  all: ["reviews"] as const,
  movie: (movieId: number) => [...reviewKeys.all, "movie", movieId] as const,
};

export function useMovieReviews(movieId: number, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: reviewKeys.movie(movieId),
    queryFn: ({ signal }) => fetchMovieReviews(movieId, signal),
    enabled,
  });
}

/**
 * Creates or updates the user's review. Not optimistic: the form keeps the
 * draft until the save succeeds, so a failure never loses what they wrote.
 */
export function useSaveReview(movieId: number) {
  const queryClient = useQueryClient();
  const queryKey = reviewKeys.movie(movieId);

  return useMutation({
    mutationFn: (reviewText: string) => saveReview(movieId, reviewText),

    onError: (error) => notifyError("Couldn't save your review", error),

    onSuccess: (review) =>
      queryClient.setQueryData<MovieReviews>(queryKey, (current) => ({
        reviews: current?.reviews ?? [],
        userReview: review,
      })),

    // A first save may happen before the list was ever loaded
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

/** Deletes the user's review optimistically, rolling back with a toast on failure */
export function useDeleteReview(movieId: number) {
  const queryClient = useQueryClient();
  const queryKey = reviewKeys.movie(movieId);

  return useMutation({
    mutationFn: () => deleteReview(movieId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MovieReviews>(queryKey);
      if (previous) queryClient.setQueryData<MovieReviews>(queryKey, { ...previous, userReview: null });
      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      notifyError("Couldn't delete your review", error);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
