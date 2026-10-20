import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "~/shared/ui/notify";
import { fetchMovieWatched, saveMovieWatched } from "./api";
import type { MovieWatchedStatus } from "./types";

export const watchedKeys = {
  all: ["watched"] as const,
  movie: (movieId: number) => [...watchedKeys.all, "movie", movieId] as const,
};

/**
 * Every write goes through useSetMovieWatched, which updates the cache, so
 * cached values never go stale within a session and lists can seed the cache
 * without each row refetching.
 */
function movieWatchedQuery(movieId: number, initialWatched?: boolean) {
  return {
    queryKey: watchedKeys.movie(movieId),
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchMovieWatched(movieId, signal),
    staleTime: Infinity,
    initialData:
      initialWatched === undefined ? undefined : ({ watched: initialWatched, watched_at: null } satisfies MovieWatchedStatus),
  };
}

interface UseMovieWatchedOptions {
  /**
   * Watched state already loaded by the server (e.g. list items after
   * `applyWatchedStatus`). Seeds the cache so no request is made. Only pass
   * values that came from `user_watched_movies`.
   */
  initialWatched?: boolean;
  enabled?: boolean;
}

export function useMovieWatched(movieId: number, { initialWatched, enabled = true }: UseMovieWatchedOptions = {}) {
  return useQuery({ ...movieWatchedQuery(movieId, initialWatched), enabled });
}

/** Number of the given movies the user has watched; reacts to toggles anywhere in the app */
export function useWatchedMovieCount(entries: { movieId: number; initialWatched?: boolean }[]) {
  return useQueries({
    queries: entries.map((entry) => movieWatchedQuery(entry.movieId, entry.initialWatched)),
    combine: (results) => results.filter((result) => result.data?.watched).length,
  });
}

/**
 * Marks a movie watched/unwatched. Updates every component showing this movie
 * immediately, rolls back with a toast on failure, and stores the server's
 * answer on success.
 */
export function useSetMovieWatched(movieId: number) {
  const queryClient = useQueryClient();
  const queryKey = watchedKeys.movie(movieId);

  return useMutation({
    mutationFn: (watched: boolean) => saveMovieWatched(movieId, watched),

    onMutate: async (watched) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MovieWatchedStatus>(queryKey);
      queryClient.setQueryData<MovieWatchedStatus>(queryKey, {
        watched,
        watched_at: watched ? previous?.watched_at ?? new Date().toISOString() : null,
      });
      return { previous };
    },

    onError: (error, _watched, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      } else {
        queryClient.removeQueries({ queryKey });
      }
      notifyError("Couldn't update watched", error);
    },

    // The response is the new server state, so store it rather than refetching
    onSuccess: (status) => queryClient.setQueryData(queryKey, status),
  });
}
