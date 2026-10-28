import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "~/shared/errors";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getKeywordDetail } from "~/utils/services/external/tmdb/keywords";
import { getPeopleDetailsById } from "~/utils/services/external/tmdb/people";
import { EMPTY_PREFERENCES, ERA_OPTIONS, LANGUAGE_OPTIONS, MAX_KEYWORDS, MAX_NOTES_LENGTH, MAX_PEOPLE } from "../options";
import { ARC_TYPES, COMPARISON_PICKS, STORY_AXES, STORY_AXIS_MAX, STORY_AXIS_MIN, getComparisonPair } from "../story";
import type {
  ComparisonAnswer,
  PersonRole,
  ResolvedPreferences,
  StoryAxes,
  TasteKeyword,
  TastePerson,
  TastePreferences,
  TastePreferencesUpdate,
} from "../types";

const table = 'user_taste_preferences';
const COLUMNS = 'favourite_genre_ids, avoided_genre_ids, eras, languages, notes, story_axes, arc_types, comparisons, people, keywords, onboarded_at, onboarding_skipped_at, updated_at';
const PERSON_ROLES: PersonRole[] = ["director", "actor"];

export async function getTastePreferences(userId: string, supabase: SupabaseClient): Promise<TastePreferences> {
  const { data, error } = await supabase
    .from(table)
    .select(COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as TastePreferences | null) ?? EMPTY_PREFERENCES;
}

async function resolvePerson(id: number, role: PersonRole, saved: TastePerson[]): Promise<TastePerson> {
  const known = saved.find((person) => person.id === id);
  if (known) return { id, name: known.name, role };

  const details = await getPeopleDetailsById({ person_id: id });
  if (!details?.name) throw new ValidationError("We couldn't find one of those people.", "UNKNOWN_PERSON");
  return { id, name: details.name, role };
}

async function resolveKeyword(id: number, saved: TasteKeyword[]): Promise<TasteKeyword> {
  const known = saved.find((keyword) => keyword.id === id);
  if (known) return known;

  const details = await getKeywordDetail({ id: String(id) });
  if (!details?.name) throw new ValidationError("We couldn't find one of those subgenres.", "UNKNOWN_KEYWORD");
  return { id, name: details.name };
}

/**
 * Applies a partial update; fields left out keep their saved value. New
 * people and keywords have their names looked up on TMDB once, here, so
 * prompts never need to.
 */
export async function updateTastePreferences(
  userId: string,
  update: TastePreferencesUpdate,
  supabase: SupabaseClient
): Promise<TastePreferences> {
  const saved = await getTastePreferences(userId, supabase);
  const { people, keywords, onboarding, ...fields } = update;
  const next = { ...saved, ...fields };

  if (next.favourite_genre_ids.some((id) => next.avoided_genre_ids.includes(id))) {
    throw new ValidationError("A genre can't be both favoured and avoided.", "INVALID_PREFERENCES");
  }

  const [resolvedPeople, resolvedKeywords] = await Promise.all([
    people && Promise.all(people.map(({ id, role }) => resolvePerson(id, role, saved.people))),
    keywords && Promise.all(keywords.map(({ id }) => resolveKeyword(id, saved.keywords))),
  ]);

  // Only the columns in this update, so two saves in flight can't undo each other
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(table)
    .upsert({
      user_id: userId,
      ...fields,
      ...(resolvedPeople && { people: resolvedPeople }),
      ...(resolvedKeywords && { keywords: resolvedKeywords }),
      ...(onboarding === "completed" && { onboarded_at: now }),
      ...(onboarding === "skipped" && { onboarding_skipped_at: now }),
      updated_at: now,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data as TastePreferences;
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

/** Drops axes set to 0, which means no preference */
function parseStoryAxes(value: unknown): StoryAxes {
  if (!isObject(value)) throw new ValidationError("story_axes must be an object", "INVALID_PREFERENCES");
  const axes: StoryAxes = {};
  for (const [key, score] of Object.entries(value)) {
    const axis = STORY_AXES.find((a) => a.key === key);
    if (!axis || !Number.isInteger(score) || (score as number) < STORY_AXIS_MIN || (score as number) > STORY_AXIS_MAX) {
      throw new ValidationError("story_axes contains an unknown axis or score", "INVALID_PREFERENCES");
    }
    if (score !== 0) axes[axis.key] = score as number;
  }
  return axes;
}

/** One answer per pair; a later answer replaces an earlier one */
function parseComparisons(value: unknown): ComparisonAnswer[] {
  if (!Array.isArray(value)) throw new ValidationError("comparisons must be a list", "INVALID_PREFERENCES");
  const answers = new Map<string, ComparisonAnswer>();
  for (const answer of value) {
    if (
      !isObject(answer) ||
      typeof answer.pair !== "string" ||
      !getComparisonPair(answer.pair) ||
      !COMPARISON_PICKS.includes(answer.pick as ComparisonAnswer["pick"])
    ) {
      throw new ValidationError("comparisons contains an unknown pair or pick", "INVALID_PREFERENCES");
    }
    answers.set(answer.pair, { pair: answer.pair, pick: answer.pick as ComparisonAnswer["pick"] });
  }
  return [...answers.values()];
}

function parsePeople(value: unknown): { id: number; role: PersonRole }[] {
  if (!Array.isArray(value) || value.some((p) => !isObject(p) || !isId(p.id) || !PERSON_ROLES.includes(p.role as PersonRole))) {
    throw new ValidationError("people must be a list of { id, role }", "INVALID_PREFERENCES");
  }
  const people = (value as { id: number; role: PersonRole }[])
    .map(({ id, role }) => ({ id, role }))
    .filter((person, index, self) => self.findIndex((p) => p.id === person.id && p.role === person.role) === index);
  if (people.length > MAX_PEOPLE) {
    throw new ValidationError(`You can pick up to ${MAX_PEOPLE} directors and actors.`, "TOO_MANY_PEOPLE");
  }
  return people;
}

function parseKeywords(value: unknown): { id: number }[] {
  if (!Array.isArray(value) || value.some((k) => !isObject(k) || !isId(k.id))) {
    throw new ValidationError("keywords must be a list of { id }", "INVALID_PREFERENCES");
  }
  const ids = [...new Set((value as { id: number }[]).map((keyword) => keyword.id))];
  if (ids.length > MAX_KEYWORDS) {
    throw new ValidationError(`You can pick up to ${MAX_KEYWORDS} subgenres.`, "TOO_MANY_KEYWORDS");
  }
  return ids.map((id) => ({ id }));
}

function parseNotes(value: unknown): string | null {
  if (value !== null && typeof value !== "string") {
    throw new ValidationError("notes must be a string", "INVALID_PREFERENCES");
  }
  const notes = value?.trim() || null;
  if (notes && notes.length > MAX_NOTES_LENGTH) {
    throw new ValidationError(`Notes can be at most ${MAX_NOTES_LENGTH} characters.`, "INVALID_PREFERENCES");
  }
  return notes;
}

/** Validates a partial update from a request body; unknown fields are ignored */
export function parseTastePreferences(body: Record<string, unknown>): TastePreferencesUpdate {
  const update: TastePreferencesUpdate = {};
  const has = (field: string) => body[field] !== undefined;

  if (has("favourite_genre_ids")) update.favourite_genre_ids = genreList(body.favourite_genre_ids, "favourite_genre_ids");
  if (has("avoided_genre_ids")) update.avoided_genre_ids = genreList(body.avoided_genre_ids, "avoided_genre_ids");
  if (has("eras")) update.eras = stringList(body.eras, "eras", ERA_OPTIONS);
  if (has("languages")) update.languages = stringList(body.languages, "languages", LANGUAGE_OPTIONS.map((l) => l.code));
  if (has("notes")) update.notes = parseNotes(body.notes);
  if (has("story_axes")) update.story_axes = parseStoryAxes(body.story_axes);
  if (has("arc_types")) update.arc_types = stringList(body.arc_types, "arc_types", ARC_TYPES);
  if (has("comparisons")) update.comparisons = parseComparisons(body.comparisons);
  if (has("people")) update.people = parsePeople(body.people);
  if (has("keywords")) update.keywords = parseKeywords(body.keywords);
  if (has("onboarding")) {
    if (body.onboarding !== "completed" && body.onboarding !== "skipped") {
      throw new ValidationError("onboarding must be \"completed\" or \"skipped\"", "INVALID_PREFERENCES");
    }
    update.onboarding = body.onboarding;
  }

  return update;
}

/** Swaps genre ids and language codes for names, for prompts */
export async function resolvePreferences(preferences: TastePreferences): Promise<ResolvedPreferences> {
  const needsGenres = preferences.favourite_genre_ids.length > 0 || preferences.avoided_genre_ids.length > 0;
  const genres: { id: number; name: string }[] = needsGenres ? (await getOfficialMovieGenres())?.genres ?? [] : [];
  const genreName = (id: number) => genres.find((genre) => genre.id === id)?.name;
  const languageName = (code: string) => LANGUAGE_OPTIONS.find((language) => language.code === code)?.label ?? code;
  const peopleNamed = (role: PersonRole) => preferences.people.filter((person) => person.role === role).map((person) => person.name);

  return {
    favouriteGenres: preferences.favourite_genre_ids.map(genreName).filter((name): name is string => Boolean(name)),
    avoidedGenres: preferences.avoided_genre_ids.map(genreName).filter((name): name is string => Boolean(name)),
    eras: preferences.eras,
    languages: preferences.languages.map(languageName),
    notes: preferences.notes,
    storyAxes: preferences.story_axes,
    arcTypes: preferences.arc_types,
    comparisons: preferences.comparisons,
    directors: peopleNamed("director"),
    actors: peopleNamed("actor"),
    subgenres: preferences.keywords.map((keyword) => keyword.name),
  };
}
