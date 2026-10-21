import { useMutation, useQuery, useQueryClient, type Query, type QueryClient } from "@tanstack/react-query";
import type { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist";
import { notifyError } from "~/shared/ui/notify";
import {
  createWatchlist,
  fetchWatchlist,
  fetchWatchlistMembership,
  fetchWatchlists,
  saveWatchlistMembership,
} from "./api";
import { DEFAULT_WATCHLIST_ID } from "./ids";
import type { CreateWatchlistInput, WatchlistMembership } from "./types";

export const watchlistKeys = {
  all: ["watchlists"] as const,
  summaries: () => [...watchlistKeys.all, "summaries"] as const,
  details: () => [...watchlistKeys.all, "detail"] as const,
  detail: (watchlistId: string) => [...watchlistKeys.details(), watchlistId] as const,
  membership: (watchlistId: string, movieId: number) =>
    [...watchlistKeys.all, "membership", watchlistId, movieId] as const,
};

/** The user's watchlists (no items). Fails with a 401 when signed out. */
export function useWatchlists() {
  return useQuery({
    queryKey: watchlistKeys.summaries(),
    queryFn: ({ signal }) => fetchWatchlists(signal),
  });
}

interface UseWatchlistOptions {
  /** The same list already loaded by a loader; seeds the cache so no request is made */
  initialData?: WatchlistInterface | null;
  enabled?: boolean;
}

/** A watchlist with its items. `watchlistId` is "default", "popcorn" or a uuid. */
export function useWatchlist(watchlistId: string, { initialData, enabled = true }: UseWatchlistOptions = {}) {
  return useQuery({
    queryKey: watchlistKeys.detail(watchlistId),
    queryFn: ({ signal }) => fetchWatchlist(watchlistId, signal),
    initialData: initialData ?? undefined,
    enabled,
  });
}

export function useWatchlistMembership(watchlistId: string, movieId: number, { enabled = true } = {}) {
  return useQuery({
    queryKey: watchlistKeys.membership(watchlistId, movieId),
    queryFn: ({ signal }) => fetchWatchlistMembership(watchlistId, movieId, signal),
    enabled,
  });
}

/**
 * Adds a movie to, or removes it from, a watchlist. The checkbox updates and
 * removed rows disappear immediately; every cached copy of the list then
 * refetches so added movies appear with their details.
 */
export function useSetWatchlistMembership(watchlistId: string, movieId: number, mediaType = "movie") {
  const queryClient = useQueryClient();
  const membershipKey = watchlistKeys.membership(watchlistId, movieId);
  const listFilter = cachedListFilter(watchlistId);

  return useMutation({
    mutationFn: (inWatchlist: boolean) => saveWatchlistMembership(watchlistId, movieId, inWatchlist, mediaType),
    // Send clicks on the same checkbox in order, so a quick add-then-remove can't land reversed
    scope: { id: `watchlist-membership:${watchlistId}:${movieId}` },

    onMutate: async (inWatchlist) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: membershipKey }),
        queryClient.cancelQueries(listFilter),
      ]);

      const previousMembership = queryClient.getQueryData<WatchlistMembership>(membershipKey);
      const previousLists = queryClient.getQueriesData<WatchlistInterface>(listFilter);

      queryClient.setQueryData<WatchlistMembership>(membershipKey, { inWatchlist });
      // An added movie needs its TMDB details, so it appears when the list refetches
      if (!inWatchlist) {
        queryClient.setQueriesData<WatchlistInterface>(listFilter, (list) =>
          list && { ...list, watchlist_items: list.watchlist_items.filter((item) => itemMovieId(item) !== movieId) }
        );
      }

      return { previousMembership, previousLists };
    },

    onError: (error, inWatchlist, context) => {
      if (context?.previousMembership) {
        queryClient.setQueryData(membershipKey, context.previousMembership);
      } else {
        queryClient.removeQueries({ queryKey: membershipKey, exact: true });
      }
      context?.previousLists.forEach(([key, list]) => queryClient.setQueryData(key, list));
      notifyError(inWatchlist ? "Couldn't add to watchlist" : "Couldn't remove from watchlist", error);
    },

    onSuccess: (membership) => queryClient.setQueryData(membershipKey, membership),

    onSettled: () => invalidateListContents(queryClient, watchlistId),
  });
}

interface CreateWatchlistVariables extends CreateWatchlistInput {
  /** Added to the new list once it exists */
  movieId?: number;
  mediaType?: string;
}

/** Creates a watchlist, optionally adding a movie to it straight away */
export function useCreateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movieId, mediaType = "movie", ...input }: CreateWatchlistVariables) => {
      const watchlist = await createWatchlist(input);
      if (movieId !== undefined) {
        await saveWatchlistMembership(watchlist.id, movieId, true, mediaType);
      }
      return watchlist;
    },

    onSuccess: (watchlist, { movieId }) => {
      if (movieId !== undefined) {
        queryClient.setQueryData<WatchlistMembership>(watchlistKeys.membership(watchlist.id, movieId), {
          inWatchlist: true,
        });
      }
    },

    onError: (error) => notifyError("Couldn't create watchlist", error),

    // Even a failed add leaves the new list behind, so always refresh
    onSettled: () => queryClient.invalidateQueries({ queryKey: watchlistKeys.summaries() }),
  });
}

/**
 * Refreshes everything showing a list's contents after it changes, including
 * item counts. Call this from any other code that edits a watchlist.
 */
export function invalidateListContents(queryClient: QueryClient, watchlistId: string) {
  return Promise.all([
    queryClient.invalidateQueries(cachedListFilter(watchlistId)),
    queryClient.invalidateQueries({ queryKey: watchlistKeys.summaries() }),
  ]);
}

/**
 * Matches every cached copy of a list. The default list can be cached under
 * both "default" (side panel) and its uuid (opened from the list of lists).
 */
function cachedListFilter(watchlistId: string) {
  return {
    queryKey: watchlistKeys.details(),
    predicate: (query: Query) => {
      const list = query.state.data as WatchlistInterface | undefined;
      return (
        query.queryKey[2] === watchlistId ||
        list?.id === watchlistId ||
        (watchlistId === DEFAULT_WATCHLIST_ID && list?.is_default === true)
      );
    },
  };
}

function itemMovieId(item: WatchlistItemInterface) {
  return item.tmdb_movie_id ?? item.tmdb_id;
}
