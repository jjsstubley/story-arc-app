import type { SupabaseClient } from "@supabase/supabase-js";
import { getDefaultWatchlist } from "./watchlist.server";

const collection = 'watchlist_items'

export async function addMovieToWatchlist(watchlistId: string, tmdbId: number, userId: string, supabase: SupabaseClient, mediaType: string = 'movie') {
  console.log('addMovieToWatchlist watchlistId', watchlistId)
  console.log('addMovieToWatchlist tmdbId', tmdbId)
  console.log('addMovieToWatchlist mediaType', mediaType)
  const { error } = await supabase
    .from(collection)
    .insert({ watchlist_id: watchlistId, tmdb_id: tmdbId, tmdb_movie_id: tmdbId, user_id: userId, media_type: mediaType });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
  console.log('addMovieToWatchlist all good')
}

export async function removeMovieFromWatchlist(watchlistId: string, tmdbId: number, supabase: SupabaseClient) {
  console.log('removeMovieFromWatchlist watchlistId', watchlistId)
  console.log('removeMovieFromWatchlist tmdbId', tmdbId)
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("watchlist_id", watchlistId)
    .eq("tmdb_id", tmdbId);

  if (error) throw error;
  console.log('removeMovieFromWatchlist all good')
}

export async function isMovieInWatchlist(
  watchlistId: string,
  tmdbId: number,
  supabase: SupabaseClient,
): Promise<boolean> {
  console.log('isMovieInWatchlist watchlistId', watchlistId)
  console.log('isMovieInWatchlist tmdbId', tmdbId)
  const { data, error } = await supabase
    .from(collection)
    .select("id")
    .eq("watchlist_id", watchlistId)
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function updateWatchlistItem(
  watchlistId: string, 
  tmdbId: number, 
  updates: {
    notes?: string;
    position?: number;
    source?: string;
    added_at?: string;
    is_seen?: boolean;
  }, 
  supabase: SupabaseClient
) {
  console.log('updateWatchlistItem watchlistId', watchlistId);
  console.log('updateWatchlistItem tmdbId', tmdbId);
  console.log('updateWatchlistItem updates', updates);

  const { data, error } = await supabase
    .from(collection)
    .update(updates)
    .eq("watchlist_id", watchlistId)
    .eq("tmdb_id", tmdbId)
    .select()
    .single();

  if (error) throw error;
  
  console.log('updateWatchlistItem all good');
  return data;
}


export async function toggleMovieInDefaultWatchlist(userId: string, movieId: number, supabase: SupabaseClient, mediaType: string = 'movie') {
  const watchlist = await getDefaultWatchlist(userId, supabase);
  const alreadyAdded = await isMovieInWatchlist(watchlist.id, movieId, supabase);
  return alreadyAdded
    ? await removeMovieFromWatchlist(watchlist.id, movieId, supabase)
    : await addMovieToWatchlist(watchlist.id, movieId, userId, supabase, mediaType);
}

export async function toggleMovieInWatchlist(watchlistId: string, movieId: number, userId: string, supabase: SupabaseClient, mediaType: string = 'movie') {
  const alreadyAdded = await isMovieInWatchlist(watchlistId, movieId, supabase);
  return alreadyAdded
    ? await removeMovieFromWatchlist(watchlistId, movieId, supabase)
    : await addMovieToWatchlist(watchlistId, movieId, userId, supabase, mediaType);
}