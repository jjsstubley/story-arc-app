import type { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";

/** A row in `movies`: TMDB metadata synced by the film-profile-worker. Public. */
export interface Movie {
  tmdb_movie_id: number;
  title: string;
  original_title: string | null;
  release_date: string | null;
  runtime: number | null;
  original_language: string | null;
  genre_ids: number[];
  keywords: string[];
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
  poster_path: string | null;
  overview: string | null;
  imdb_id: string | null;
  wikidata_id: string | null;
  tmdb_synced_at: string;
}

/**
 * A row in `film_story_profiles`. `ending_type` and `character_arc` are
 * spoilers: match on them, never show them. `logline` is safe to show.
 */
export interface FilmStoryProfile {
  tmdb_movie_id: number;
  axis_ending: number;
  axis_pacing: number;
  axis_structure: number;
  axis_focus: number;
  axis_tone: number;
  axis_resolution: number;
  arc_type: string;
  character_arc: string;
  ending_type: string;
  conflict: string;
  protagonist: string;
  moral_complexity: number;
  violence: number;
  tension: number;
  themes: string[];
  moods: string[];
  emotional_effects: string[];
  devices: string[];
  watch_contexts: string[];
  tropes: string[];
  setting_era: string | null;
  setting_scale: string | null;
  logline: string;
  story_card: string;
  confidence: number;
  plot_source: "wikipedia" | "tmdb";
  wikipedia_title: string | null;
  vocab_version: number;
  model: string;
  source_hash: string;
  generated_at: string;
}

/** A profile with the movie's genres and keywords, which is everything similarity scoring needs */
export type ScoredProfile = FilmStoryProfile & Pick<Movie, "genre_ids" | "keywords">;

export interface SimilarStory {
  /** Shaped like a TMDB list result so the shared poster components can render it */
  movie: TmdbMovieSummaryInterface;
  score: number;
  /** Spoiler-safe reasons for the match */
  sharedThemes: string[];
  sharedMoods: string[];
}

export interface SimilarStories {
  /** False until the film-profile-worker has profiled this movie */
  ready: boolean;
  logline: string | null;
  films: SimilarStory[];
}
