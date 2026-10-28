import type { TastePreferences } from "./types";

export const ERA_OPTIONS = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"] as const;

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "de", label: "German" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "da", label: "Danish" },
  { code: "sv", label: "Swedish" },
  { code: "pt", label: "Portuguese" },
] as const;

export const MAX_NOTES_LENGTH = 500;
export const MAX_PEOPLE = 10;
export const MAX_KEYWORDS = 10;

export const EMPTY_PREFERENCES: TastePreferences = {
  favourite_genre_ids: [],
  avoided_genre_ids: [],
  eras: [],
  languages: [],
  notes: null,
  story_axes: {},
  arc_types: [],
  comparisons: [],
  people: [],
  keywords: [],
  onboarded_at: null,
  onboarding_skipped_at: null,
};

export function hasPreferences(preferences: TastePreferences | null | undefined): boolean {
  if (!preferences) return false;
  return (
    preferences.favourite_genre_ids.length > 0 ||
    preferences.avoided_genre_ids.length > 0 ||
    preferences.eras.length > 0 ||
    preferences.languages.length > 0 ||
    Boolean(preferences.notes?.trim()) ||
    Object.keys(preferences.story_axes).length > 0 ||
    preferences.arc_types.length > 0 ||
    preferences.comparisons.some((answer) => answer.pick !== "neither") ||
    preferences.people.length > 0 ||
    preferences.keywords.length > 0
  );
}

/** TMDB keywords offered as subgenres before the user searches */
export const SUGGESTED_KEYWORDS = [
  { id: 207268, name: "neo-noir" },
  { id: 10051, name: "heist" },
  { id: 4379, name: "time travel" },
  { id: 4565, name: "dystopia" },
  { id: 12565, name: "psychological thriller" },
  { id: 12570, name: "whodunit" },
  { id: 12190, name: "cyberpunk" },
  { id: 161176, name: "space opera" },
  { id: 167043, name: "road movie" },
  { id: 10349, name: "survival" },
  { id: 8201, name: "satire" },
  { id: 10123, name: "dark comedy" },
  { id: 15060, name: "period drama" },
  { id: 12339, name: "slasher" },
  { id: 163053, name: "found footage" },
] as const;
