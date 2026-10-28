import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { notifyError } from "~/shared/ui/notify";
import { fetchForYou, fetchTastePreferences, refreshForYou, saveTastePreferences, searchTaste } from "./api";
import type { ForYouState, TastePreferences, TastePreferencesUpdate, TasteSearchType } from "./types";

const GENERATING_POLL_MS = 5000;

export const tasteKeys = {
  all: ["taste"] as const,
  forYou: () => [...tasteKeys.all, "for-you"] as const,
  preferences: () => [...tasteKeys.all, "preferences"] as const,
  search: (type: TasteSearchType, query: string) => [...tasteKeys.all, "search", type, query] as const,
};

const MIN_SEARCH_LENGTH = 2;

/** People or subgenres matching `query`; pass an already debounced query */
export function useTasteSearch(type: TasteSearchType, query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: tasteKeys.search(type, trimmed),
    queryFn: ({ signal }) => searchTaste(type, trimmed, signal),
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    staleTime: 5 * 60 * 1000,
  });
}

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

/**
 * Saves a partial update optimistically; the lists then show as out of date.
 * People and keywords appear once the server has looked up their names.
 */
export function useSaveTastePreferences() {
  const queryClient = useQueryClient();
  const queryKey = tasteKeys.preferences();

  return useMutation({
    mutationFn: (update: TastePreferencesUpdate) => saveTastePreferences(update),

    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TastePreferences>(queryKey);
      if (update.onboarding) {
        const setup = update.onboarding === "completed" ? "done" : "skipped";
        // Finishing beats putting off: "Do it later" after a finished setup changes nothing
        queryClient.setQueryData<ForYouState>(tasteKeys.forYou(), (state) =>
          state && state.setup !== "done" ? { ...state, setup } : state
        );
      }
      if (previous) {
        const fields = { ...update };
        delete fields.people;
        delete fields.keywords;
        delete fields.onboarding;
        queryClient.setQueryData<TastePreferences>(queryKey, { ...previous, ...(fields as Partial<TastePreferences>) });
      }
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
