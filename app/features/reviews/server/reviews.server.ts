import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, ValidationError } from "~/shared/errors";
import { isMovieWatched } from "~/features/watched/index.server";
import { MAX_REVIEW_LENGTH } from "../limits";
import type { MovieReviews, Review } from "../types";

const collection = 'user_reviews';
const PAGE_SIZE = 20;

/**
 * Create or update the user's review for a movie (one review per user per movie)
 */
export async function saveReview(
  userId: string,
  tmdbMovieId: number,
  reviewText: string,
  supabase: SupabaseClient
): Promise<Review> {
  const text = reviewText.trim();
  if (!text) {
    throw new ValidationError('Write something before saving your review.', 'REVIEW_EMPTY');
  }
  if (text.length > MAX_REVIEW_LENGTH) {
    throw new ValidationError(`Reviews can be at most ${MAX_REVIEW_LENGTH} characters.`, 'REVIEW_TOO_LONG');
  }

  const watched = await isMovieWatched(userId, tmdbMovieId, supabase);
  if (!watched) {
    throw new ConflictError('Mark this movie as watched before reviewing it.', 'MOVIE_NOT_WATCHED');
  }

  const { data, error } = await supabase
    .from(collection)
    .upsert(
      { user_id: userId, tmdb_movie_id: tmdbMovieId, review_text: text },
      { onConflict: 'user_id,tmdb_movie_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * The latest reviews for a movie. When signed in, the user's own review is
 * returned separately and left out of `reviews`.
 */
export async function getMovieReviews(
  tmdbMovieId: number,
  userId: string | null,
  supabase: SupabaseClient
): Promise<MovieReviews> {
  let query = supabase
    .from(collection)
    .select('*')
    .eq('tmdb_movie_id', tmdbMovieId)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);
  if (userId) query = query.neq('user_id', userId);

  const [reviews, userReview] = await Promise.all([
    query,
    userId ? getUserReview(userId, tmdbMovieId, supabase) : Promise.resolve(null),
  ]);

  if (reviews.error) throw reviews.error;
  return { reviews: reviews.data || [], userReview };
}

/**
 * Get user's review for a movie
 */
export async function getUserReview(
  userId: string,
  tmdbMovieId: number,
  supabase: SupabaseClient
): Promise<Review | null> {
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
 * Delete user's review for a movie
 */
export async function deleteReview(
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
