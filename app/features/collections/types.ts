import type { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";

/**
 * A row in `collections`. Curated collections have no owner and are public;
 * everything else (a user's own lists, AI suggestion lists) is private to its
 * owner. `is_system_generated` only says the app made it, not who can see it.
 */
export interface Collection {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  name: string;
  description: string | null;
  tags: string[];
  generated_from: Record<string, unknown>;
  is_public: boolean;
  is_system_generated: boolean;
}

/** A row in `collection_items`. Its `is_watched` is stale: use `~/features/watched`. */
export interface CollectionItem {
  list_id: string;
  movie_id: number;
  position: number | null;
  added_at: string;
  notes: string | null;
  source: string | null;
  is_watched: boolean;
}

export interface CollectionItemWithMovie extends CollectionItem {
  /** TMDB details, or null if they couldn't be loaded */
  movie: TmdbMovieSummaryInterface | null;
}

export interface CollectionWithMovies extends Collection {
  collection_items: CollectionItemWithMovie[];
}

export interface CollectionSummary {
  id: string;
  name: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string | null;
  tags?: string[];
  movieIds?: number[];
  /** Set when copying another collection */
  forkedFrom?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
  tags?: string[];
}
