import { TmdbMovieInterface } from "./tmdb/tdmi-movie";

export interface MovieSuggestionInterface {
    title: string;
    year: string;
    reason: string;
    themes: string[];
    tags: string[];
    tmdbData?: TmdbMovieInterface
}
  
interface ResultsDataInterface {
    suggestions: MovieSuggestionInterface[];
}
  
export interface SuggestionsDataInterface {
    result?: ResultsDataInterface; // Optional, as it may not always exist
    error?: string;  // Optional, as it may not always exist
}