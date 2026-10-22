import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { notifyError } from "~/shared/ui/notify";
import { fetchForYou, fetchTastePreferences, refreshForYou, saveTastePreferences } from "./api";
import type { ForYouState, TastePreferences } from "./types";

const GENERATING_POLL_MS = 5000;

export const tasteKeys = {
  all: ["taste"] as const,
  forYou: () => [...tasteKeys.all, "for-you"] as const,
  preferences: () => [...tasteKeys.all, "preferences"] as const,
};

/** The user's "For you" lists and profile. Polls while another request is generating them. */
export function useForYou({ initialData, enabled = true }: { initialData?: ForYouState; enabled?: boolean } = {}) {
  return useQuery({
    queryKey: tasteKeys.forYou(),
    queryFn: ({ signal }) => fetchForYou(signal),
    initialData,
    enabled,
    refetchInterval: (query) => (query.state.data?.status === "generating" ? GENERATING_POLL_MS : false),
  });
}

/** Regenerates the lists if needed. Pass `true` for a manual refresh (button). */
export function useRefreshForYou() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manual: boolean) => refreshForYou(manual),
    onSuccess: (state) => queryClient.setQueryData(tasteKeys.forYou(), state),
    // Automatic refreshes fail quietly and keep the current lists
    onError: (error, manual) => {
      if (manual) notifyError("Couldn't refresh your lists", error);
      else console.error("Automatic For You refresh failed:", error);
    },
  });
}

/**
 * Starts one automatic refresh when the lists are out of date and the daily
 * limit allows it. Returns the refresh mutation so callers can show progress
 * and offer a manual refresh.
 */
export function useAutoRefreshForYou(state: ForYouState | undefined) {
  const refresh = useRefreshForYou();
  const attempted = useRef(false);
  const { mutate } = refresh;

  useEffect(() => {
    if (!state?.autoRefreshAllowed || attempted.current) return;
    attempted.current = true;
    mutate(false);
  }, [state?.autoRefreshAllowed, mutate]);

  return refresh;
}

export function useTastePreferences({ initialData }: { initialData?: TastePreferences } = {}) {
  return useQuery({
    queryKey: tasteKeys.preferences(),
    queryFn: ({ signal }) => fetchTastePreferences(signal),
    initialData,
  });
}

/** Saves preferences optimistically; the lists then show as out of date */
export function useSaveTastePreferences() {
  const queryClient = useQueryClient();
  const queryKey = tasteKeys.preferences();

  return useMutation({
    mutationFn: (preferences: TastePreferences) => saveTastePreferences(preferences),

    onMutate: async (preferences) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TastePreferences>(queryKey);
      queryClient.setQueryData(queryKey, preferences);
      return { previous };
    },

    onError: (error, _preferences, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      notifyError("Couldn't save your preferences", error);
    },

    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    onSettled: () => queryClient.invalidateQueries({ queryKey: tasteKeys.forYou() }),
  });
}
