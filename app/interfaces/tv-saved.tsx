import { TmdbTVSeriesDetailWAppendsProps } from "./tmdb/tv/series/details";
import { TVSeasonDetailsInterface } from "./tmdb/tv/season/details";
import { TVEpisodeSummaryInterface } from "./tmdb/tv/episode/summary";

export interface SavedTVSeriesInterface {
  id: string;
  user_id: string;
  watchlist_id: string | null;
  tmdb_series_id: number;
  added_at: string;
  updated_at: string;
  is_seen: boolean;
  notes: string | null;
  position: number | null;
  source: string | null;
  series?: TmdbTVSeriesDetailWAppendsProps; // Enriched data
}

export interface SavedTVSeasonInterface {
  id: string;
  user_id: string;
  watchlist_id: string | null;
  tmdb_series_id: number;
  season_number: number;
  added_at: string;
  updated_at: string;
  is_seen: boolean;
  notes: string | null;
  position: number | null;
  source: string | null;
  season?: TVSeasonDetailsInterface; // Enriched data
  series?: TmdbTVSeriesDetailWAppendsProps; // Parent series data
}

export interface SavedTVEpisodeInterface {
  id: string;
  user_id: string;
  watchlist_id: string | null;
  tmdb_series_id: number;
  season_number: number;
  episode_number: number;
  added_at: string;
  updated_at: string;
  is_seen: boolean;
  notes: string | null;
  position: number | null;
  source: string | null;
  episode?: TVEpisodeSummaryInterface; // Enriched data
  series?: TmdbTVSeriesDetailWAppendsProps; // Parent series data
}

