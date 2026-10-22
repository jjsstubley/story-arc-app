import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createGeneratedCollection,
  deleteGeneratedCollections,
  getGeneratedCollectionsWithMovies,
} from "~/features/collections/index.server";
import type { CollectionWithMovies } from "~/features/collections";
import { getWatchedMovieIds } from "~/features/watched/index.server";
import { ConflictError } from "~/shared/errors";
import { openai, OPENAI_MODEL } from "~/utils/services/ai/openai-client.server";
import { findMovieIdFromTitleAndYear } from "~/utils/services/ai/tmdb-match.server";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import type { ForYouState, TasteContext, TasteProfile } from "../types";
import { fingerprintSignals, getOrBuildTasteProfile, getTasteProfile, getTasteSignals, hasEnoughSignals } from "./profile.server";
import { describeTaste } from "./prompt.server";

/** generated_from.type of "For you" collections */
export const TASTE_LIST_TYPE = 'taste';

const LIST_COUNT = 3;
const FILMS_PER_LIST = 12;
/** Ask for more than we keep: some won't match TMDB, are already watched, or repeat */
const CANDIDATES_PER_LIST = 18;
const MIN_FILMS_PER_LIST = 4;
const AUTO_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MANUAL_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;
/** A lock older than this is assumed to belong to a request that died */
const LOCK_TIMEOUT_MS = 3 * 60 * 1000;
const TMDB_CONCURRENCY = 8;

const listsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["lists"],
  properties: {
    lists: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "films"],
        properties: {
          title: { type: "string", description: "Short, evocative list name, at most 50 characters" },
          description: { type: "string", description: "One sentence on why these suit this person" },
          films: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "year"],
              properties: {
                title: { type: "string" },
                year: { type: "string", description: "4-digit release year" },
              },
            },
          },
        },
      },
    },
  },
} as const;

function isLocked(profile: TasteProfile | null): boolean {
  const since = profile?.lists_generating_since;
  return Boolean(since) && Date.now() - Date.parse(since!) < LOCK_TIMEOUT_MS;
}

function toState(
  profile: TasteProfile | null,
  lists: CollectionWithMovies[],
  currentFingerprint: string | null
): ForYouState {
  const generatedAt = profile?.lists_generated_at ?? null;
  const fresh = lists.length > 0 && currentFingerprint !== null && profile?.lists_fingerprint === currentFingerprint;
  const status = currentFingerprint === null ? "needs-signals" : isLocked(profile) ? "generating" : fresh ? "ready" : "stale";
  const dueForAutoRefresh = lists.length === 0 || !generatedAt || Date.now() - Date.parse(generatedAt) >= AUTO_REFRESH_INTERVAL_MS;

  return { status, profile, lists, generatedAt, autoRefreshAllowed: status === "stale" && dueForAutoRefresh };
}

/** The user's lists and whether they're up to date. Never generates anything. */
export async function getForYouState(userId: string, supabase: SupabaseClient): Promise<ForYouState> {
  const [signals, profile, lists] = await Promise.all([
    getTasteSignals(userId, supabase),
    getTasteProfile(userId, supabase),
    getGeneratedCollectionsWithMovies(userId, TASTE_LIST_TYPE, supabase),
  ]);
  return toState(profile, lists, hasEnoughSignals(signals) ? fingerprintSignals(signals) : null);
}

/**
 * Takes the per-user generation lock; false if another request got there
 * first. Compare-and-set on the value we read (null, or an expired lock), so
 * two requests can't both win. (PostgREST rejects `or` filters on PATCH here.)
 */
async function acquireLock(userId: string, current: string | null | undefined, supabase: SupabaseClient): Promise<boolean> {
  let query = supabase
    .from('user_taste_profiles')
    .update({ lists_generating_since: new Date().toISOString() })
    .eq('user_id', userId);
  query = current ? query.eq('lists_generating_since', current) : query.is('lists_generating_since', null);

  const { data, error } = await query.select('user_id');
  if (error) throw error;
  return (data ?? []).length > 0;
}

async function finishGeneration(userId: string, fingerprint: string | null, supabase: SupabaseClient) {
  const update = fingerprint
    ? { lists_generating_since: null, lists_fingerprint: fingerprint, lists_generated_at: new Date().toISOString() }
    : { lists_generating_since: null };
  const { error } = await supabase.from('user_taste_profiles').update(update).eq('user_id', userId);
  if (error) throw error;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function proposeLists(taste: TasteContext) {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a film curator making personal lists for one person. Each list has a distinct angle " +
          "(a mood, a kind of story or character arc, a filmmaker's sensibility, an overlooked era) rather than a plain genre. " +
          "Mix well-known and lesser-known films. Never include a film the person has rated, watched or saved, or one in a genre they avoid. " +
          "Don't repeat a film across lists.",
      },
      {
        role: "user",
        content: `${describeTaste(taste)}\n\nMake ${LIST_COUNT} lists of ${CANDIDATES_PER_LIST} films each, best fit first.`,
      },
    ],
    response_format: { type: "json_schema", json_schema: { name: "for_you_lists", strict: true, schema: listsSchema } },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty For You lists response");
  return (JSON.parse(content) as { lists: { title: string; description: string; films: { title: string; year: string }[] }[] }).lists
    .slice(0, LIST_COUNT);
}

/** Asks the model for lists, matches them to TMDB and saves them as private generated collections */
async function generateLists(userId: string, taste: TasteContext, supabase: SupabaseClient): Promise<string[]> {
  const [proposals, watched] = await Promise.all([proposeLists(taste), getWatchedMovieIds(userId, supabase)]);
  const known = new Set([...watched, ...taste.anchors.map((anchor) => anchor.tmdb_id)]);
  const avoided = new Set((taste.preferences?.avoidedGenres ?? []).map((name) => name.toLowerCase()));

  const candidates = proposals.flatMap((list, listIndex) => list.films.map((film) => ({ ...film, listIndex })));
  const matched = await mapWithConcurrency(candidates, TMDB_CONCURRENCY, async (film) => {
    const movieId = await findMovieIdFromTitleAndYear(film.title, film.year);
    if (!movieId || known.has(movieId)) return null;
    if (avoided.size > 0) {
      const details = await getMovieDetailsById({ movie_id: movieId }).catch(() => null);
      if (details?.genres?.some((genre: { name: string }) => avoided.has(genre.name.toLowerCase()))) return null;
    }
    return { movieId, listIndex: film.listIndex };
  });

  // Keep candidate order (best fit first), drop repeats across lists, cap each list
  const used = new Set<number>();
  const movieIdsByList = proposals.map(() => [] as number[]);
  for (const match of matched) {
    if (!match || used.has(match.movieId) || movieIdsByList[match.listIndex].length >= FILMS_PER_LIST) continue;
    used.add(match.movieId);
    movieIdsByList[match.listIndex].push(match.movieId);
  }

  const generatedAt = new Date().toISOString();
  const created: string[] = [];
  for (const [index, list] of proposals.entries()) {
    if (movieIdsByList[index].length < MIN_FILMS_PER_LIST) continue;
    const collection = await createGeneratedCollection(
      userId,
      {
        name: list.title.trim().slice(0, 100),
        description: list.description.trim().slice(0, 500),
        generatedFrom: { type: TASTE_LIST_TYPE, taste_fingerprint: taste.fingerprint, generated_at: generatedAt },
      },
      movieIdsByList[index],
      supabase
    );
    created.push(collection.id);
  }

  if (created.length === 0) throw new Error("No For You list had enough matching films");
  console.log(`For You lists generated for user ${userId}: ${movieIdsByList.map((ids) => ids.length).join("/")} films`);
  return created;
}

/**
 * Regenerates the user's lists if their taste has changed since the last
 * ones. Automatic refreshes happen at most once a day; a manual refresh
 * (`manual: true`) skips that but not a short cooldown.
 */
export async function refreshForYouLists(
  userId: string,
  { manual }: { manual: boolean },
  supabase: SupabaseClient
): Promise<ForYouState> {
  const taste = await getOrBuildTasteProfile(userId, supabase);
  if (!taste) return getForYouState(userId, supabase);

  const lists = await getGeneratedCollectionsWithMovies(userId, TASTE_LIST_TYPE, supabase);
  const state = toState(taste, lists, taste.fingerprint);
  const sinceLast = taste.lists_generated_at ? Date.now() - Date.parse(taste.lists_generated_at) : Infinity;

  if (state.status === "generating") return state;
  if (!manual && (state.status === "ready" || !state.autoRefreshAllowed)) return state;
  if (manual && sinceLast < MANUAL_REFRESH_COOLDOWN_MS) {
    throw new ConflictError("You refreshed these lists a moment ago. Try again in a few minutes.", "REFRESH_TOO_SOON");
  }

  if (!(await acquireLock(userId, taste.lists_generating_since, supabase))) return { ...state, status: "generating", autoRefreshAllowed: false };

  try {
    const created = await generateLists(userId, taste, supabase);
    await deleteGeneratedCollections(userId, TASTE_LIST_TYPE, created, supabase);
    await finishGeneration(userId, taste.fingerprint, supabase);
  } catch (error) {
    await finishGeneration(userId, null, supabase).catch(() => {});
    throw error;
  }

  return getForYouState(userId, supabase);
}
