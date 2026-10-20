import type { RatingTier } from "./tiers";

/** A row in `user_ratings` */
export interface Rating {
  id: string;
  user_id: string;
  tmdb_movie_id: number;
  rating_percentage: number;
  rating_tier: RatingTier;
  created_at: string;
  updated_at: string;
}
