/** A row in `user_favourites` */
export interface Favourite {
  id: string;
  user_id: string;
  tmdb_movie_id: number;
  created_at: string;
  updated_at: string;
}

/** Whether the user has favourited a movie */
export interface FavouriteStatus {
  favourite: boolean;
}
