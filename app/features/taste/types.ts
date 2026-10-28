import type { CollectionWithMovies } from "~/features/collections";
import type { ComparisonPick, StoryAxisKey } from "./story";

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
  /** Hash of the inputs that always rebuild it (ratings, favourites, preferences); null on profiles built before it existed */
  core_fingerprint?: string | null;
  updated_at?: string;
  lists_fingerprint?: string | null;
  lists_generated_at?: string | null;
  lists_generating_since?: string | null;
}

export type StoryAxes = Partial<Record<StoryAxisKey, number>>;

/** An answer to one of the curated film pairs in `COMPARISON_PAIRS` */
export interface ComparisonAnswer {
  pair: string;
  pick: ComparisonPick;
}

export type PersonRole = "director" | "actor";

/** A TMDB person; the name is looked up by the server when they're added */
export interface TastePerson {
  id: number;
  name: string;
  role: PersonRole;
}

/** A TMDB keyword used as a subgenre, e.g. "neo-noir" */
export interface TasteKeyword {
  id: number;
  name: string;
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
  story_axes: StoryAxes;
  arc_types: string[];
  comparisons: ComparisonAnswer[];
  people: TastePerson[];
  keywords: TasteKeyword[];
  onboarded_at?: string | null;
  onboarding_skipped_at?: string | null;
  updated_at?: string;
}

/**
 * A partial update: fields left out keep their saved value. People and
 * keywords only need an id; their names are looked up by the server.
 */
export type TastePreferencesUpdate = Partial<
  Omit<TastePreferences, "people" | "keywords" | "onboarded_at" | "onboarding_skipped_at" | "updated_at">
> & {
  people?: { id: number; role: PersonRole }[];
  keywords?: { id: number }[];
  /** Marks the setup as finished, or put off ("Do it later") */
  onboarding?: "completed" | "skipped";
};

/** Preferences with ids resolved to names, for prompts */
export interface ResolvedPreferences {
  favouriteGenres: string[];
  avoidedGenres: string[];
  eras: string[];
  languages: string[];
  notes: string | null;
  storyAxes: StoryAxes;
  arcTypes: string[];
  comparisons: ComparisonAnswer[];
  directors: string[];
  actors: string[];
  subgenres: string[];
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

/** "needed": never set up or put off; "skipped": chose "Do it later"; "done": finished the setup */
export type TasteSetupStatus = "needed" | "skipped" | "done";

/** A pair film with what the setup screen shows */
export interface ComparisonFilmView {
  tmdbId: number;
  title: string;
  year: string;
  posterPath: string | null;
  overview: string;
}

export interface ComparisonPairView {
  id: string;
  axis: StoryAxisKey;
  low: ComparisonFilmView;
  high: ComparisonFilmView;
}

export type TasteSearchType = "person" | "keyword";

export interface TasteSearchResult {
  id: number;
  name: string;
  /** For people, what they're known for, e.g. "Directing" */
  detail: string | null;
  imagePath: string | null;
}

export interface ForYouState {
  setup: TasteSetupStatus;
  status: ForYouStatus;
  profile: TasteProfile | null;
  lists: CollectionWithMovies[];
  generatedAt: string | null;
  /** Whether a stale state may refresh itself now (at most once a day) */
  autoRefreshAllowed: boolean;
}
