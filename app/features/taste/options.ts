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

export const EMPTY_PREFERENCES: TastePreferences = {
  favourite_genre_ids: [],
  avoided_genre_ids: [],
  eras: [],
  languages: [],
  notes: null,
};

export function hasPreferences(preferences: TastePreferences | null | undefined): boolean {
  if (!preferences) return false;
  return (
    preferences.favourite_genre_ids.length > 0 ||
    preferences.avoided_genre_ids.length > 0 ||
    preferences.eras.length > 0 ||
    preferences.languages.length > 0 ||
    Boolean(preferences.notes?.trim())
  );
}
