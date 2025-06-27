import type { SupabaseClient } from "@supabase/supabase-js";
import { getDefaultWatchlist } from "./watchlist.server";

export async function addMovieToWatchlist(watchlistId: string, tmdbId: number, userId: string, supabase: SupabaseClient) {
  console.log('addMovieToWatchlist watchlistId', watchlistId)
  console.log('addMovieToWatchlist tmdbId', tmdbId)
  const { error } = await supabase
    .from("watchlist_items")
    .insert({ watchlist_id: watchlistId, tmdb_movie_id: tmdbId, user_id: userId });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
}

export async function removeMovieFromWatchlist(watchlistId: string, tmdbId: number, supabase: SupabaseClient) {
  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("watchlist_id", watchlistId)
    .eq("tmdb_movie_id", tmdbId);

  if (error) throw error;
}

export async function isMovieInWatchlist(
  watchlistId: string,
  tmdbId: number,
  supabase: SupabaseClient,
): Promise<boolean> {
  console.log('isMovieInWatchlist watchlistId', watchlistId)
  console.log('isMovieInWatchlist tmdbId', tmdbId)
  const { data, error } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("watchlist_id", watchlistId)
    .eq("tmdb_movie_id", tmdbId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}


export async function toggleMovieInDefaultWatchlist(userId: string, movieId: number, supabase: SupabaseClient) {
  const watchlist = await getDefaultWatchlist(userId, supabase);
  const alreadyAdded = await isMovieInWatchlist(watchlist.id, movieId, supabase);
  return alreadyAdded
    ? await removeMovieFromWatchlist(watchlist.id, movieId, supabase)
    : await addMovieToWatchlist(watchlist.id, movieId, userId, supabase);
}