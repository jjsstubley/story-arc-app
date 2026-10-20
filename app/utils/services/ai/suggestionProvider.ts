import type { TasteProfile } from "~/utils/services/supabase/taste-profiles.server";

export interface MovieSuggestion {
  title: string;
  year: string;
  reason: string;
  themes?: string[];
  tags?: string[];
  because_you_liked?: string | null;
}

export interface SuggestionRequest {
  query: string;
  excludeTitles: string[];
  page: number;
  taste?: TasteProfile | null;
}

export type ProviderEvent =
  | { type: "title"; title: string }
  | { type: "suggestion"; suggestion: MovieSuggestion };

export interface SuggestionProvider {
  streamSuggestions(request: SuggestionRequest): AsyncIterable<ProviderEvent>;
}
