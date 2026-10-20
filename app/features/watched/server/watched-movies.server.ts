import type { SupabaseClient } from "@supabase/supabase-js";
import type { MovieWatchedStatus } from "../types";

const collection = "user_watched_movies";

export async function isMovieWatched(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from(collection)
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_movie_id", tmdbMovieId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function getWatchedMovie(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<{ id: string; watched_at: string } | null> {
  const { data, error } = await supabase
    .from(collection)
    .select("id, watched_at")
    .eq("user_id", userId)
    .eq("tmdb_movie_id", tmdbMovieId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addWatchedMovie(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase.from(collection).insert({
    user_id: userId,
    tmdb_movie_id: tmdbMovieId,
  });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
}

export async function removeWatchedMovie(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_movie_id", tmdbMovieId);

  if (error) throw error;
}

export async function getWatchedMovieIds(
  userId: string,
  supabase: SupabaseClient
): Promise<Set<number>> {
  const { data, error } = await supabase
    .from(collection)
    .select("tmdb_movie_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data || []).map((row) => Number(row.tmdb_movie_id)));
}

export async function getMovieWatchedStatus(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<MovieWatchedStatus> {
  const row = await getWatchedMovie(userId, tmdbMovieId, supabase);
  return { watched: Boolean(row), watched_at: row?.watched_at ?? null };
}

/** Marks a movie watched or unwatched for the user and returns the resulting status */
export async function setMovieWatched(
  userId: string,
  tmdbMovieId: number,
  watched: boolean,
  supabase: SupabaseClient
): Promise<MovieWatchedStatus> {
  if (watched) {
    await addWatchedMovie(userId, tmdbMovieId, supabase);
  } else {
    await removeWatchedMovie(userId, tmdbMovieId, supabase);
  }
  return getMovieWatchedStatus(userId, tmdbMovieId, supabase);
}

/**
 * Overwrites `is_seen` on movie list items with the user's global watched state,
 * so lists never disagree with the rest of the app. TV items keep their own `is_seen`.
 */
export function applyWatchedStatus<T extends { tmdb_movie_id?: number; tmdb_id?: number; media_type?: string | null; is_seen?: boolean }>(
  items: T[],
  watchedIds: Set<number>
): T[] {
  return items.map((item) =>
    item.media_type === "tv"
      ? item
      : { ...item, is_seen: watchedIds.has(Number(item.tmdb_movie_id ?? item.tmdb_id)) }
  );
}
