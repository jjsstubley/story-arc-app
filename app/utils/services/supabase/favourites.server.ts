import type { SupabaseClient } from "@supabase/supabase-js";
import { addOrUpdateRating } from "./ratings.server";
import { createOrUpdateReview } from "./reviews.server";

const collection = 'user_favourites';

/**
 * Check if a movie exists in any of the user's watchlists
 */
export async function isMovieInWatchlist(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('watchlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbMovieId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

/**
 * Add movie to favourites
 * Optionally also add rating and review in the same operation
 */
export async function addToFavourites(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient,
  options?: {
    rating_percentage?: number;
    review_text?: string;
  }
) {
  // Validate movie is in watchlist
  const inWatchlist = await isMovieInWatchlist(userId, tmdbMovieId, supabase);
  if (!inWatchlist) {
    throw new Error('Movie must be in a watchlist before adding to favourites');
  }

  // Add to favourites
  const { data: favouriteData, error: favouriteError } = await supabase
    .from(collection)
    .insert({
      user_id: userId,
      tmdb_movie_id: tmdbMovieId,
    })
    .select()
    .single();

  if (favouriteError && favouriteError.code !== "23505") {
    // 23505 = unique violation (already exists)
    throw favouriteError;
  }

  // If favourite already exists, get it
  let favourite = favouriteData;
  if (!favourite) {
    const { data: existing, error: fetchError } = await supabase
      .from(collection)
      .select()
      .eq('user_id', userId)
      .eq('tmdb_movie_id', tmdbMovieId)
      .single();
    
    if (fetchError) throw fetchError;
    favourite = existing;
  }

  // Optionally add rating
  if (options?.rating_percentage !== undefined) {
    await addOrUpdateRating(userId, tmdbMovieId, options.rating_percentage, supabase);
  }

  // Optionally add review
  if (options?.review_text) {
    await createOrUpdateReview(userId, tmdbMovieId, options.review_text, supabase);
  }

  return favourite;
}

/**
 * Remove movie from favourites
 */
export async function removeFromFavourites(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId);

  if (error) throw error;
  return { success: true };
}

/**
 * Check if movie is in user's favourites
 */
export async function isFavourite(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from(collection)
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

/**
 * Get all favourites for a user
 */
export async function getUserFavourites(
  userId: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from(collection)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

