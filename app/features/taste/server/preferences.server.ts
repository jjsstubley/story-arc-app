import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "~/shared/errors";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { EMPTY_PREFERENCES, ERA_OPTIONS, LANGUAGE_OPTIONS, MAX_NOTES_LENGTH } from "../options";
import type { ResolvedPreferences, TastePreferences } from "../types";

const table = 'user_taste_preferences';
const COLUMNS = 'favourite_genre_ids, avoided_genre_ids, eras, languages, notes, updated_at';

export async function getTastePreferences(userId: string, supabase: SupabaseClient): Promise<TastePreferences> {
  const { data, error } = await supabase
    .from(table)
    .select(COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? EMPTY_PREFERENCES;
}

export async function saveTastePreferences(
  userId: string,
  preferences: TastePreferences,
  supabase: SupabaseClient
): Promise<TastePreferences> {
  const { data, error } = await supabase
    .from(table)
    .upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

function stringList(value: unknown, field: string, allowed: readonly string[]): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !allowed.includes(item))) {
    throw new ValidationError(`${field} contains an unknown option`, "INVALID_PREFERENCES");
  }
  return [...new Set(value as string[])];
}

function genreList(value: unknown, field: string): number[] {
  if (!Array.isArray(value) || value.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ValidationError(`${field} must be a list of genre ids`, "INVALID_PREFERENCES");
  }
  return [...new Set(value as number[])];
}

/** Validates a full preferences object from a request body */
export function parseTastePreferences(body: Record<string, unknown>): TastePreferences {
  const favourite = genreList(body.favourite_genre_ids ?? [], "favourite_genre_ids");
  const avoided = genreList(body.avoided_genre_ids ?? [], "avoided_genre_ids");
  if (favourite.some((id) => avoided.includes(id))) {
    throw new ValidationError("A genre can't be both favoured and avoided.", "INVALID_PREFERENCES");
  }

  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    throw new ValidationError("notes must be a string", "INVALID_PREFERENCES");
  }
  const notes = (body.notes as string | null | undefined)?.trim() || null;
  if (notes && notes.length > MAX_NOTES_LENGTH) {
    throw new ValidationError(`Notes can be at most ${MAX_NOTES_LENGTH} characters.`, "INVALID_PREFERENCES");
  }

  return {
    favourite_genre_ids: favourite,
    avoided_genre_ids: avoided,
    eras: stringList(body.eras ?? [], "eras", ERA_OPTIONS),
    languages: stringList(body.languages ?? [], "languages", LANGUAGE_OPTIONS.map((l) => l.code)),
    notes,
  };
}

/** Swaps genre ids and language codes for names, for prompts */
export async function resolvePreferences(preferences: TastePreferences): Promise<ResolvedPreferences> {
  const needsGenres = preferences.favourite_genre_ids.length > 0 || preferences.avoided_genre_ids.length > 0;
  const genres: { id: number; name: string }[] = needsGenres ? (await getOfficialMovieGenres())?.genres ?? [] : [];
  const genreName = (id: number) => genres.find((genre) => genre.id === id)?.name;
  const languageName = (code: string) => LANGUAGE_OPTIONS.find((language) => language.code === code)?.label ?? code;

  return {
    favouriteGenres: preferences.favourite_genre_ids.map(genreName).filter((name): name is string => Boolean(name)),
    avoidedGenres: preferences.avoided_genre_ids.map(genreName).filter((name): name is string => Boolean(name)),
    eras: preferences.eras,
    languages: preferences.languages.map(languageName),
    notes: preferences.notes,
  };
}
