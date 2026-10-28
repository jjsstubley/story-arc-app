import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserRatings } from "~/features/ratings/index.server";
import { getUserFavourites } from "~/features/favourites/index.server";
import { getRecentlyWatchedMovieIds } from "~/features/watched/index.server";
import { getWatchlistMovieIds } from "~/features/watchlists/index.server";
import { openai, OPENAI_MODEL } from "~/utils/services/ai/openai-client.server";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import { hasPreferences } from "../options";
import type { TasteAnchor, TasteContext, TastePreferences, TasteProfile } from "../types";
import { getTastePreferences, resolvePreferences } from "./preferences.server";
import { describePreferences } from "./prompt.server";

const table = 'user_taste_profiles';
const MIN_FILM_SIGNALS = 3;
const MAX_LIKED_ANCHORS = 12;
const MAX_DISLIKED_ANCHORS = 5;
const RECENT_WATCHED = 30;
const WATCHLIST_SIGNALS = 30;
const MAX_WATCHED_ANCHORS = 6;
const MAX_WATCHLIST_ANCHORS = 6;
const ACTIVITY_REBUILD_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const tasteSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "likes", "dislikes"],
  properties: {
    summary: { type: "string", description: "2-4 sentences describing the user's film taste" },
    likes: { type: "array", items: { type: "string" }, description: "Up to 6 short phrases" },
    dislikes: { type: "array", items: { type: "string" }, description: "Up to 4 short phrases" },
  },
} as const;

export async function getTasteProfile(userId: string, supabase: SupabaseClient): Promise<TasteProfile | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function upsertTasteProfile(
  profile: Pick<TasteProfile, 'user_id' | 'summary' | 'likes' | 'dislikes' | 'anchors' | 'fingerprint' | 'core_fingerprint'>,
  supabase: SupabaseClient
): Promise<TasteProfile> {
  const { data, error } = await supabase
    .from(table)
    .upsert({ ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Everything a profile is built from. Cheap: database reads only. */
export interface TasteSignals {
  ratings: Awaited<ReturnType<typeof getUserRatings>>;
  favouriteIds: number[];
  /** Recently watched films the user hasn't rated */
  watchedIds: number[];
  watchlistIds: number[];
  preferences: TastePreferences;
}

export async function getTasteSignals(userId: string, supabase: SupabaseClient): Promise<TasteSignals> {
  const [ratings, favourites, watched, watchlist, preferences] = await Promise.all([
    getUserRatings(userId, supabase),
    getUserFavourites(userId, supabase),
    getRecentlyWatchedMovieIds(userId, RECENT_WATCHED, supabase),
    getWatchlistMovieIds(userId, WATCHLIST_SIGNALS, supabase),
    getTastePreferences(userId, supabase),
  ]);
  const rated = new Set(ratings.map((rating) => Number(rating.tmdb_movie_id)));
  const favouriteIds = favourites.map((favourite) => Number(favourite.tmdb_movie_id));

  return {
    ratings,
    favouriteIds,
    watchedIds: watched.filter((id) => !rated.has(id) && !favouriteIds.includes(id)),
    watchlistIds: watchlist,
    preferences,
  };
}

/** Enough to say something useful: a few films, or preferences the user set */
export function hasEnoughSignals(signals: TasteSignals): boolean {
  const filmSignals = signals.ratings.length + signals.favouriteIds.length + signals.watchedIds.length + signals.watchlistIds.length;
  return filmSignals >= MIN_FILM_SIGNALS || hasPreferences(signals.preferences);
}

function hash(value: unknown): string {
  return createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

/** Ratings, favourites and preferences: any change rebuilds the profile */
function fingerprintCore(signals: TasteSignals): string {
  const { favourite_genre_ids, avoided_genre_ids, eras, languages, notes, story_axes, arc_types, comparisons, people, keywords } =
    signals.preferences;
  return hash({
    ratings: signals.ratings.map((r) => `${r.tmdb_movie_id}:${r.rating_percentage}`).sort(),
    favourites: [...signals.favouriteIds].sort((a, b) => a - b),
    preferences: {
      favourite_genre_ids,
      avoided_genre_ids,
      eras,
      languages,
      notes,
      story_axes,
      arc_types,
      comparisons,
      people: people.map((person) => `${person.role}:${person.id}`),
      keywords: keywords.map((keyword) => keyword.id),
    },
  });
}

/** Everything a profile is built from, including watched films and the watchlist */
function fingerprintAll(signals: TasteSignals, core: string): string {
  return hash({
    core,
    watched: [...signals.watchedIds].sort((a, b) => a - b),
    watchlist: [...signals.watchlistIds].sort((a, b) => a - b),
  });
}

/**
 * Whether the stored profile needs rebuilding, and the fingerprint the
 * current profile has (or will have once rebuilt). Watching films or changing
 * the watchlist only rebuilds a profile older than a week, so everyday
 * activity doesn't cost an AI call each time or invalidate cached suggestions.
 */
export function assessProfile(stored: TasteProfile | null, signals: TasteSignals) {
  const core = fingerprintCore(signals);
  const all = fingerprintAll(signals, core);
  const age = stored?.updated_at ? Date.now() - Date.parse(stored.updated_at) : Infinity;
  const needsRebuild =
    !stored || stored.core_fingerprint !== core || (stored.fingerprint !== all && age >= ACTIVITY_REBUILD_AGE_MS);

  return { needsRebuild, core, fingerprint: needsRebuild || !stored ? all : stored.fingerprint };
}

async function resolveAnchor(tmdbId: number, tier: string): Promise<TasteAnchor | null> {
  const details = await getMovieDetailsById({ movie_id: tmdbId }).catch(() => null);
  if (!details?.title) return null;
  return { tmdb_id: tmdbId, title: details.title, year: details.release_date?.split("-")[0] || "", tier };
}

function pickAnchors(signals: TasteSignals): { id: number; tier: string }[] {
  const { ratings, favouriteIds } = signals;
  const tierById = new Map(ratings.map((r) => [Number(r.tmdb_movie_id), r.rating_tier as string]));

  // Favourites first, then the highest rated; plus the lowest rated
  const liked = [...favouriteIds, ...ratings.filter((r) => r.rating_percentage >= 70).map((r) => Number(r.tmdb_movie_id))]
    .filter((id, index, self) => self.indexOf(id) === index)
    .slice(0, MAX_LIKED_ANCHORS)
    .map((id) => ({ id, tier: tierById.get(id) || "Favourite" }));
  const disliked = ratings
    .filter((r) => r.rating_percentage < 55 && !favouriteIds.includes(Number(r.tmdb_movie_id)))
    .slice(-MAX_DISLIKED_ANCHORS)
    .map((r) => ({ id: Number(r.tmdb_movie_id), tier: r.rating_tier as string }));
  const taken = new Set([...liked, ...disliked].map((anchor) => anchor.id));
  const watched = signals.watchedIds.filter((id) => !taken.has(id)).slice(0, MAX_WATCHED_ANCHORS).map((id) => ({ id, tier: "Watched" }));
  watched.forEach((anchor) => taken.add(anchor.id));
  const wanted = signals.watchlistIds.filter((id) => !taken.has(id)).slice(0, MAX_WATCHLIST_ANCHORS).map((id) => ({ id, tier: "Watchlist" }));

  return [...liked, ...disliked, ...watched, ...wanted];
}

async function buildProfile(
  userId: string,
  signals: TasteSignals,
  { fingerprint, core }: { fingerprint: string; core: string },
  supabase: SupabaseClient
) {
  const anchors = (await Promise.all(pickAnchors(signals).map(({ id, tier }) => resolveAnchor(id, tier))))
    .filter((anchor): anchor is TasteAnchor => anchor !== null);
  const preferences = await resolvePreferences(signals.preferences);

  const films = anchors.map((a) => `${a.title} (${a.year}) — ${a.tier}`).join("\n");
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You summarise a person's film taste. Films are listed with how they relate to each: a rating tier, " +
          "\"Favourite\", \"Watched\" (seen, not rated) or \"Watchlist\" (wants to see; a weaker signal). " +
          "Focus on story structure, character arcs, themes, tone and pacing rather than just genre. " +
          "Respect the person's stated preferences. Be specific and concise.",
      },
      { role: "user", content: [films, describePreferences(preferences)].filter(Boolean).join("\n\n") },
    ],
    response_format: { type: "json_schema", json_schema: { name: "taste_profile", strict: true, schema: tasteSchema } },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty taste profile response");
  const parsed = JSON.parse(content) as { summary: string; likes: string[]; dislikes: string[] };

  console.log(`Taste profile regenerated for user ${userId} from ${anchors.length} films`);
  const profile = await upsertTasteProfile({ user_id: userId, ...parsed, anchors, fingerprint, core_fingerprint: core }, supabase);
  return { profile, preferences };
}

/**
 * The user's taste profile, regenerated only when its inputs have changed
 * (see `assessProfile`). Returns null when there isn't enough to go on, or if
 * anything fails: suggestions must work without it.
 */
export async function getOrBuildTasteProfile(userId: string, supabase: SupabaseClient): Promise<TasteContext | null> {
  let stored: TasteProfile | null = null;
  let signals: TasteSignals | null = null;

  try {
    [signals, stored] = await Promise.all([getTasteSignals(userId, supabase), getTasteProfile(userId, supabase)]);
    if (!hasEnoughSignals(signals)) return null;

    const assessment = assessProfile(stored, signals);
    if (stored && !assessment.needsRebuild) {
      return { ...stored, preferences: await resolvePreferences(signals.preferences) };
    }

    const { profile, preferences } = await buildProfile(userId, signals, assessment, supabase);
    return { ...profile, preferences };
  } catch (error) {
    console.error("Failed to build taste profile (continuing without it):", error);
    if (!stored) return null;
    const preferences = signals ? await resolvePreferences(signals.preferences).catch(() => null) : null;
    return { ...stored, preferences };
  }
}
