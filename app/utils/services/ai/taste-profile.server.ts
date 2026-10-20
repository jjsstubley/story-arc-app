import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { openai, OPENAI_MODEL } from "./providers/openai";
import { getUserRatings } from "~/features/ratings/index.server";
import { getUserFavourites } from "~/utils/services/supabase/favourites.server";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import {
  getTasteProfile,
  upsertTasteProfile,
  type TasteAnchor,
  type TasteProfile,
} from "~/utils/services/supabase/taste-profiles.server";

const MIN_SIGNALS = 3;
const MAX_LIKED_ANCHORS = 12;
const MAX_DISLIKED_ANCHORS = 5;

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

async function resolveAnchor(tmdbId: number, tier: string): Promise<TasteAnchor | null> {
  const details = await getMovieDetailsById({ movie_id: tmdbId });
  if (!details?.title) return null;
  return {
    tmdb_id: tmdbId,
    title: details.title,
    year: details.release_date?.split("-")[0] || "",
    tier,
  };
}

/**
 * Return the user's taste profile, regenerating it only when their
 * ratings or favourites have changed. Returns null when there isn't enough
 * signal, or if anything fails — recommendations must work without it.
 */
export async function getOrBuildTasteProfile(
  userId: string,
  supabase: SupabaseClient
): Promise<TasteProfile | null> {
  let stored: TasteProfile | null = null;

  try {
    const [ratings, favourites, existing] = await Promise.all([
      getUserRatings(userId, supabase),
      getUserFavourites(userId, supabase),
      getTasteProfile(userId, supabase),
    ]);
    stored = existing;

    const favouriteIds: number[] = (favourites || []).map((f: { tmdb_movie_id: number }) => Number(f.tmdb_movie_id));
    if (ratings.length + favouriteIds.length < MIN_SIGNALS) return null;

    const fingerprint = createHash("sha1")
      .update(
        JSON.stringify({
          ratings: ratings.map((r) => `${r.tmdb_movie_id}:${r.rating_percentage}`).sort(),
          favourites: [...favouriteIds].sort((a, b) => a - b),
        })
      )
      .digest("hex");

    if (stored?.fingerprint === fingerprint) return stored;

    // Pick anchors: favourites first, then the highest rated; plus the lowest rated
    const tierById = new Map(ratings.map((r) => [Number(r.tmdb_movie_id), r.rating_tier as string]));
    const likedIds = [
      ...favouriteIds,
      ...ratings.filter((r) => r.rating_percentage >= 70).map((r) => Number(r.tmdb_movie_id)),
    ].filter((id, index, self) => self.indexOf(id) === index).slice(0, MAX_LIKED_ANCHORS);
    const dislikedIds = ratings
      .filter((r) => r.rating_percentage < 55 && !favouriteIds.includes(Number(r.tmdb_movie_id)))
      .slice(-MAX_DISLIKED_ANCHORS)
      .map((r) => Number(r.tmdb_movie_id));

    const anchors = (
      await Promise.all([
        ...likedIds.map((id) => resolveAnchor(id, tierById.get(id) || "Favourite")),
        ...dislikedIds.map((id) => resolveAnchor(id, tierById.get(id) || "Bad")),
      ])
    ).filter((a): a is TasteAnchor => a !== null);

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You summarise a person's film taste from films they rated. Focus on story structure, character arcs, themes, tone and pacing rather than just genre. Be specific and concise.",
        },
        {
          role: "user",
          content: anchors.map((a) => `${a.title} (${a.year}) — ${a.tier}`).join("\n"),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "taste_profile", strict: true, schema: tasteSchema },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty taste profile response");
    const parsed = JSON.parse(content) as { summary: string; likes: string[]; dislikes: string[] };

    console.log(`Taste profile regenerated for user ${userId} from ${anchors.length} anchors`);

    return await upsertTasteProfile(
      { user_id: userId, ...parsed, anchors, fingerprint },
      supabase
    );
  } catch (error) {
    console.error("Failed to build taste profile (continuing without it):", error);
    return stored;
  }
}
