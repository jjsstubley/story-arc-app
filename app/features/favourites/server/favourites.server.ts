import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError } from "~/shared/errors";
import { isMovieWatched } from "~/features/watched/index.server";
import type { Favourite, FavouriteStatus } from "../types";

const collection = 'user_favourites';

/**
 * Add or remove a movie from the user's favourites. Adding requires the movie
 * to be watched; both directions are idempotent.
 */
export async function setFavourite(
  userId: string,
  tmdbMovieId: number,
  favourite: boolean,
  supabase: SupabaseClient
): Promise<FavouriteStatus> {
  if (!favourite) {
    const { error } = await supabase
      .from(collection)
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_movie_id', tmdbMovieId);

    if (error) throw error;
    return { favourite: false };
  }

  const watched = await isMovieWatched(userId, tmdbMovieId, supabase);
  if (!watched) {
    throw new ConflictError('Mark this movie as watched before adding it to your favourites.', 'MOVIE_NOT_WATCHED');
  }

  const { error } = await supabase
    .from(collection)
    .upsert(
      { user_id: userId, tmdb_movie_id: tmdbMovieId },
      { onConflict: 'user_id,tmdb_movie_id', ignoreDuplicates: true }
    );

  if (error) throw error;
  return { favourite: true };
}

/**
 * Check if movie is in user's favourites
 */
export async function getFavouriteStatus(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<FavouriteStatus> {
  const { data, error } = await supabase
    .from(collection)
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId)
    .maybeSingle();

  if (error) throw error;
  return { favourite: Boolean(data) };
}

/**
 * Get all favourites for a user, newest first
 */
export async function getUserFavourites(
  userId: string,
  supabase: SupabaseClient
): Promise<Favourite[]> {
  const { data, error } = await supabase
    .from(collection)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
