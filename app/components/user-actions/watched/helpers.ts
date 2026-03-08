import { useEffect } from "react";

export interface MovieWatchedStatus {
  watched: boolean;
  watched_at?: string;
}

const WATCHED_MOVIES_CHANGED = "watched-movies-changed";

/**
 * Get global watched status for a movie (user_watched_movies).
 * For use in movie info panel and rating/review dialog.
 */
export async function getMovieWatchedStatus(
  movieId: number
): Promise<MovieWatchedStatus> {
  const response = await fetch(`/api/movies/${movieId}/watched`);
  if (!response.ok) {
    return { watched: false };
  }
  const data = await response.json();
  return {
    watched: Boolean(data.watched),
    watched_at: data.watched_at,
  };
}

/**
 * Dispatch after any successful watched toggle so other UIs can sync.
 */
export function dispatchWatchedChange(movieId: number, watched: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(WATCHED_MOVIES_CHANGED, { detail: { movieId, watched } })
  );
}

/**
 * Subscribe to watched changes for a movie and update local state.
 */
export function useWatchedSync(
  movieId: number,
  setWatched: (watched: boolean) => void
): void {
  useEffect(() => {
    const handler = (e: Event) => {
      const { movieId: id, watched } = (e as CustomEvent<{ movieId: number; watched: boolean }>).detail;
      if (id === movieId) setWatched(watched);
    };
    window.addEventListener(WATCHED_MOVIES_CHANGED, handler);
    return () => window.removeEventListener(WATCHED_MOVIES_CHANGED, handler);
  }, [movieId, setWatched]);
}
