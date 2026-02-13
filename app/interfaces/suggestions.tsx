import { TmdbMovieSummaryInterface } from "./tmdb/movie/summary";

export interface MovieSuggestionInterface {
    title: string;
    year: string;
    reason: string;
    themes: string[];
    tags: string[];
    tmdbData?: TmdbMovieSummaryInterface
}
  
interface ResultsDataInterface {
    suggestions: MovieSuggestionInterface[];
}
  
export interface SuggestionsDataInterface {
    result?: ResultsDataInterface; // Optional, as it may not always exist
    error?: string;  // Optional, as it may not always exist
}