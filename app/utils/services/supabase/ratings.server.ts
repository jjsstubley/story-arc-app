import type { SupabaseClient } from "@supabase/supabase-js";
import { getRatingTier, type RatingTier } from "~/utils/constants/ratings";

const collection = 'user_ratings';

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
 * Add or update rating for a movie
 */
export async function addOrUpdateRating(
  userId: string,
  tmdbMovieId: number,
  percentage: number,
  supabase: SupabaseClient
) {
  // Validate movie is in watchlist
  const inWatchlist = await isMovieInWatchlist(userId, tmdbMovieId, supabase);
  if (!inWatchlist) {
    throw new Error('Movie must be in a watchlist before adding a rating');
  }

  // Validate percentage is between 0 and 100
  if (percentage < 0 || percentage > 100) {
    throw new Error('Rating percentage must be between 0 and 100');
  }

  const ratingTier = getRatingTier(percentage);

  // Check if rating already exists
  const { data: existing } = await supabase
    .from(collection)
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId)
    .maybeSingle();

  if (existing) {
    // Update existing rating
    const { data, error } = await supabase
      .from(collection)
      .update({
        rating_percentage: percentage,
        rating_tier: ratingTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new rating
    const { data, error } = await supabase
      .from(collection)
      .insert({
        user_id: userId,
        tmdb_movie_id: tmdbMovieId,
        rating_percentage: percentage,
        rating_tier: ratingTier,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Get user's rating for a movie
 */
export async function getUserRating(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from(collection)
    .select('*')
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Delete user's rating for a movie
 */
export async function deleteRating(
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

