import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, ValidationError } from "~/shared/errors";
import { isMovieWatched } from "~/features/watched/index.server";
import { getRatingTier, type RatingTier } from "../tiers";
import type { Rating } from "../types";

const collection = 'user_ratings';

/**
 * Add or update rating for a movie
 */
export async function addOrUpdateRating(
  userId: string,
  tmdbMovieId: number,
  percentage: number,
  supabase: SupabaseClient
): Promise<Rating> {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new ValidationError('Rating must be between 0 and 100', 'INVALID_RATING');
  }

  const watched = await isMovieWatched(userId, tmdbMovieId, supabase);
  if (!watched) {
    throw new ConflictError('Mark this movie as watched before rating it.', 'MOVIE_NOT_WATCHED');
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
): Promise<Rating | null> {
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
): Promise<void> {
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId);

  if (error) throw error;
}


/**
 * Get all ratings for a user, highest first
 */
export async function getUserRatings(
  userId: string,
  supabase: SupabaseClient
): Promise<Array<{ tmdb_movie_id: number; rating_percentage: number; rating_tier: RatingTier }>> {
  const { data, error } = await supabase
    .from(collection)
    .select('tmdb_movie_id, rating_percentage, rating_tier')
    .eq('user_id', userId)
    .order('rating_percentage', { ascending: false });

  if (error) throw error;
  return data || [];
}
