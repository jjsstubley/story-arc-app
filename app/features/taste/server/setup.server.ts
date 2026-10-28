import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "~/shared/errors";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import { getKeywordBySearchQuery, getPersonBySearchQuery } from "~/utils/services/external/tmdb/search";
import { COMPARISON_PAIRS, STORY_AXES, type ComparisonFilm, type ComparisonPair } from "../story";
import type { ComparisonFilmView, ComparisonPairView, TastePreferences, TasteSearchResult, TasteSearchType, TasteSetupStatus } from "../types";
import { getTastePreferences } from "./preferences.server";

const SETUP_PAIR_COUNT = 8;
const SEARCH_RESULTS = 8;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

export function getSetupStatus(preferences: TastePreferences): TasteSetupStatus {
  if (preferences.onboarded_at) return "done";
  if (preferences.onboarding_skipped_at) return "skipped";
  return "needed";
}

/** Whether to send the user to the setup after signing in */
export async function needsTasteSetup(userId: string, supabase: SupabaseClient): Promise<boolean> {
  return getSetupStatus(await getTastePreferences(userId, supabase)) === "needed";
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function toFilmView(film: ComparisonFilm): Promise<ComparisonFilmView> {
  const details = await getMovieDetailsById({ movie_id: film.tmdbId }).catch(() => null);
  return { ...film, posterPath: details?.poster_path ?? null, overview: details?.overview ?? "" };
}

/**
 * A random set of pairs covering every axis at least once, with posters and
 * synopses. Random so redoing the setup shows different films.
 */
export async function getSetupPairs(): Promise<ComparisonPairView[]> {
  const active = shuffle(COMPARISON_PAIRS.filter((pair) => pair.active));
  const onePerAxis = STORY_AXES.map((axis) => active.find((pair) => pair.axis === axis.key)).filter(
    (pair): pair is ComparisonPair => Boolean(pair)
  );
  const extra = active.filter((pair) => !onePerAxis.includes(pair)).slice(0, SETUP_PAIR_COUNT - onePerAxis.length);

  return Promise.all(
    shuffle([...onePerAxis, ...extra]).map(async (pair) => ({
      id: pair.id,
      axis: pair.axis,
      low: await toFilmView(pair.low),
      high: await toFilmView(pair.high),
    }))
  );
}

/** People or subgenre keywords matching a query, for the setup and preferences pickers */
export async function searchTasteOptions(type: TasteSearchType, query: string): Promise<TasteSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];
  if (trimmed.length > MAX_QUERY_LENGTH) throw new ValidationError("That search is too long.", "QUERY_TOO_LONG");
  const encoded = encodeURIComponent(trimmed);

  if (type === "person") {
    const data = await getPersonBySearchQuery({ query: encoded, page: 1 });
    return ((data?.results ?? []) as { id: number; name: string; known_for_department?: string; profile_path?: string | null }[])
      .slice(0, SEARCH_RESULTS)
      .map((person) => ({
        id: person.id,
        name: person.name,
        detail: person.known_for_department ?? null,
        imagePath: person.profile_path ?? null,
      }));
  }

  const data = await getKeywordBySearchQuery({ query: encoded, page: 1 });
  return ((data?.results ?? []) as { id: number; name: string }[])
    .slice(0, SEARCH_RESULTS)
    .map((keyword) => ({ id: keyword.id, name: keyword.name, detail: null, imagePath: null }));
}
