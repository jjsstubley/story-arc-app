import type { CollectionWithMovies } from "~/features/collections";

/** A film the profile was built from, with how the user relates to it */
export interface TasteAnchor {
  tmdb_id: number;
  title: string;
  year: string;
  /** A rating tier ("Masterpiece", "Bad", ...), or "Favourite", "Watched" or "Watchlist" */
  tier: string;
}

/** A row in `user_taste_profiles` */
export interface TasteProfile {
  user_id: string;
  summary: string;
  likes: string[];
  dislikes: string[];
  anchors: TasteAnchor[];
  /** Hash of everything the profile was built from; changes when any input changes */
  fingerprint: string;
  updated_at?: string;
  lists_fingerprint?: string | null;
  lists_generated_at?: string | null;
  lists_generating_since?: string | null;
}

/** A row in `user_taste_preferences`, minus the user id */
export interface TastePreferences {
  favourite_genre_ids: number[];
  avoided_genre_ids: number[];
  /** Decades such as "1970s" */
  eras: string[];
  /** ISO 639-1 original languages */
  languages: string[];
  notes: string | null;
  updated_at?: string;
}

/** Preferences with genre and language names resolved, for prompts */
export interface ResolvedPreferences {
  favouriteGenres: string[];
  avoidedGenres: string[];
  eras: string[];
  languages: string[];
  notes: string | null;
}

/** A taste profile together with the preferences it was built with */
export type TasteContext = TasteProfile & { preferences: ResolvedPreferences | null };

export type ForYouStatus =
  /** Lists match the current profile */
  | "ready"
  /** Taste changed since the lists were made */
  | "stale"
  /** Another request is generating them now */
  | "generating"
  /** Not enough ratings, favourites, watched films or preferences yet */
  | "needs-signals";

export interface ForYouState {
  status: ForYouStatus;
  profile: TasteProfile | null;
  lists: CollectionWithMovies[];
  generatedAt: string | null;
  /** Whether a stale state may refresh itself now (at most once a day) */
  autoRefreshAllowed: boolean;
}
