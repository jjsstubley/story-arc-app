import { useCallback, useEffect, useRef, useState } from "react";
import type { MovieSuggestionInterface, SuggestionStreamEvent } from "~/interfaces/suggestions";

export type SuggestionStreamStatus = "idle" | "streaming" | "done" | "error";

export interface SuggestionStreamState {
  status: SuggestionStreamStatus;
  query: string;
  page: number;
  title: string;
  cached: boolean;
  personalised: boolean;
  suggestions: MovieSuggestionInterface[];
  error: string | null;
  aiQueryId: string | null;
  collectionId: string | null;
}

const initialState: SuggestionStreamState = {
  status: "idle",
  query: "",
  page: 1,
  title: "",
  cached: false,
  personalised: false,
  suggestions: [],
  error: null,
  aiQueryId: null,
  collectionId: null,
};

/**
 * Streams AI suggestions from /api/suggestions (NDJSON), adding each
 * suggestion to state as soon as it arrives.
 */
export function useSuggestionStream() {
  const [state, setState] = useState<SuggestionStreamState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const abortRef = useRef<AbortController | null>(null);

  const applyEvent = useCallback((event: SuggestionStreamEvent, isFirstPage: boolean) => {
    setState((prev) => {
      switch (event.type) {
        case "meta":
          // Keep the original title/flags when loading more pages
          return isFirstPage
            ? { ...prev, title: event.title, cached: event.cached, personalised: event.personalised }
            : prev;
        case "suggestion": {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { type, ...suggestion } = event;
          if (suggestion.movie_id && prev.suggestions.some((s) => s.movie_id === suggestion.movie_id)) {
            return prev;
          }
          const suggestions = [...prev.suggestions, suggestion].sort((a, b) => a.rank - b.rank);
          return { ...prev, suggestions };
        }
        case "done":
          return { ...prev, status: "done", aiQueryId: event.aiQueryId, collectionId: event.collectionId };
        case "error":
          return { ...prev, status: "error", error: event.message };
      }
    });
  }, []);

  const run = useCallback(
    async (query: string, page: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const current = stateRef.current;
      const isFirstPage = page === 1;

      setState((prev) =>
        isFirstPage
          ? { ...initialState, status: "streaming", query }
          : { ...prev, status: "streaming", page, error: null }
      );

      const formData = new FormData();
      formData.append("query", query);
      formData.append("page", String(page));
      if (!isFirstPage) {
        formData.append("excludeTitles", JSON.stringify(current.suggestions.map((s) => s.title)));
        if (current.aiQueryId) formData.append("aiQueryId", current.aiQueryId);
        if (current.collectionId) formData.append("collectionId", current.collectionId);
      }

      try {
        const response = await fetch("/api/suggestions", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || "Failed to fetch AI suggestions");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finished = false;

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as SuggestionStreamEvent;
            if (event.type === "done" || event.type === "error") finished = true;
            applyEvent(event, isFirstPage);
          }
        }

        if (!finished) {
          applyEvent({ type: "error", message: "The connection was interrupted. Please try again." }, isFirstPage);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        applyEvent(
          { type: "error", message: error instanceof Error ? error.message : "Failed to fetch AI suggestions" },
          isFirstPage
        );
      }
    },
    [applyEvent]
  );

  const start = useCallback((query: string) => run(query, 1), [run]);

  const loadMore = useCallback(() => {
    const { query, page, status } = stateRef.current;
    if (!query || status === "streaming") return;
    run(query, page + 1);
  }, [run]);

  const retry = useCallback(() => {
    const { query, page } = stateRef.current;
    if (query) run(query, page);
  }, [run]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => (prev.status === "streaming" ? { ...prev, status: "done" } : prev));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  // Abort any in-flight request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  return { state, start, loadMore, retry, cancel, reset };
}
