import type { SupabaseClient } from "@supabase/supabase-js";

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
