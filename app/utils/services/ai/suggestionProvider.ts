export interface MovieSuggestion {
  title: string;
  year: string;
  reason: string;
  themes?: string[];
  tags?: string[];
}

export interface SuggestionResult {
  title: string;
  suggestions: MovieSuggestion[];
}

export interface SuggestionProvider {
  getSuggestions(query: string, previousTitles?: string[], page?: number): Promise<SuggestionResult>;
}