/** A row in `user_reviews`. Reviews are public: anyone can read them. */
export interface Review {
  id: string;
  user_id: string;
  tmdb_movie_id: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

/** Reviews for one movie, with the signed-in user's own review split out */
export interface MovieReviews {
  reviews: Review[];
  userReview: Review | null;
}
