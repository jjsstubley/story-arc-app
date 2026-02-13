import type { SupabaseClient } from "@supabase/supabase-js";

const collection = 'user_reviews';

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
 * Create or update review for a movie
 */
export async function createOrUpdateReview(
  userId: string,
  tmdbMovieId: number,
  reviewText: string,
  supabase: SupabaseClient
) {
  // Validate movie is in watchlist
  const inWatchlist = await isMovieInWatchlist(userId, tmdbMovieId, supabase);
  if (!inWatchlist) {
    throw new Error('Movie must be in a watchlist before adding a review');
  }

  // Validate review text is not empty
  if (!reviewText || reviewText.trim().length === 0) {
    throw new Error('Review text cannot be empty');
  }

  // Check if review already exists
  const { data: existing } = await supabase
    .from(collection)
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_movie_id', tmdbMovieId)
    .maybeSingle();

  if (existing) {
    // Update existing review
    const { data, error } = await supabase
      .from(collection)
      .update({
        review_text: reviewText.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new review
    const { data, error } = await supabase
      .from(collection)
      .insert({
        user_id: userId,
        tmdb_movie_id: tmdbMovieId,
        review_text: reviewText.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Get user's review for a movie
 */
export async function getUserReview(
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
 * Get all reviews for a movie with pagination
 */
export async function getMovieReviews(
  tmdbMovieId: number,
  supabase: SupabaseClient,
  limit: number = 20,
  offset: number = 0
) {
  const { data, error } = await supabase
    .from(collection)
    .select(`
      *,
      user:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .eq('tmdb_movie_id', tmdbMovieId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

/**
 * Delete user's review for a movie
 */
export async function deleteReview(
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
 * Get a specific review by ID
 */
export async function getReviewById(
  reviewId: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from(collection)
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a specific review by ID (author only)
 */
export async function updateReviewById(
  reviewId: string,
  userId: string,
  reviewText: string,
  supabase: SupabaseClient
) {
  // First verify the review belongs to the user
  const review = await getReviewById(reviewId, supabase);
  if (review.user_id !== userId) {
    throw new Error('Unauthorized: You can only update your own reviews');
  }

  const { data, error } = await supabase
    .from(collection)
    .update({
      review_text: reviewText.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a specific review by ID (author only)
 */
export async function deleteReviewById(
  reviewId: string,
  userId: string,
  supabase: SupabaseClient
) {
  // First verify the review belongs to the user
  const review = await getReviewById(reviewId, supabase);
  if (review.user_id !== userId) {
    throw new Error('Unauthorized: You can only delete your own reviews');
  }

  const { error } = await supabase
    .from(collection)
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
  return { success: true };
}

