import { TmdbMovieSummaryInterface } from "./tmdb/movie/summary";

export interface MovieSuggestionInterface {
    rank: number;
    title: string;
    year: string;
    reason: string;
    themes: string[];
    tags: string[];
    because_you_liked?: string | null;
    movie_id?: number | null;
    tmdbData?: TmdbMovieSummaryInterface | null
}

/**
 * NDJSON events streamed from /api/suggestions (one JSON object per line)
 */
export type SuggestionStreamEvent =
    | { type: "meta"; title: string; cached: boolean; personalised: boolean }
    | ({ type: "suggestion" } & MovieSuggestionInterface)
    | { type: "done"; aiQueryId: string | null; collectionId: string | null }
    | { type: "error"; message: string };
