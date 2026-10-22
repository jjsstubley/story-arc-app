import { SuggestionProvider, MovieSuggestion } from "./suggestionProvider";
import { OpenAiProvider } from "./providers/openai";
// import { GeminiProvider } from "~/ai/providers/gemini";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import { findMovieIdFromTitleAndYear } from "./tmdb-match.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { appendRecommendations, findSimilarQuery, getRecommendationsByQueryId, saveAiQueryAndRecommendations } from "~/utils/services/supabase/ai-recommendations.server";
import {
  addMovieToCollection,
  createGeneratedCollection,
  findCollectionIdByAiQueryId,
  requireOwnedCollection,
} from "~/features/collections/index.server";
import { getWatchedMovieIds } from "~/features/watched/index.server";
import { getOrBuildTasteProfile } from "~/features/taste/index.server";
import type { TasteContext } from "~/features/taste";
import type { MovieSuggestionInterface, SuggestionStreamEvent } from "~/interfaces/suggestions";

// const provider: SuggestionProvider =
//   process.env.AI_PROVIDER === "gemini"
//     ? GeminiSuggestionProvider
//     : OpenAiProvider;

const provider: SuggestionProvider = OpenAiProvider

const PAGE_SIZE = 20;

export interface StreamSuggestionsInput {
  query: string;
  page: number;
  excludeTitles: string[];
  aiQueryId?: string | null;
  collectionId?: string | null;
}

type Send = (event: SuggestionStreamEvent) => void;

/**
 * Convert an error into a message that is safe to show the user
 */
function toUserMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Failed to fetch AI suggestions";

  const msg = error.message.toLowerCase();
  if (msg.includes("api key is not configured") || msg.includes("api key is invalid")) {
    return "OpenAI API key is not configured or invalid. Please check your environment variables.";
  } else if (msg.includes("rate limit")) {
    return "Too many requests. Please try again in a moment.";
  } else if (msg.includes("temporarily unavailable") || msg.includes("503") || msg.includes("502")) {
    return "AI service is temporarily unavailable. Please try again later.";
  } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused")) {
    return "Network error. Please check your connection and try again.";
  } else if (msg.includes("json") || msg.includes("parse")) {
    return "Received invalid response from AI service. Please try again.";
  } else if (msg.includes("query cannot be empty")) {
    return "Please enter a search query.";
  }
  return error.message.length < 150 ? error.message : "Failed to fetch AI suggestions";
}

/**
 * Stream suggestions as NDJSON events. Results are emitted one by one as
 * they are matched to TMDB, then persisted once the model has finished.
 */
export function streamSuggestions(
  input: StreamSuggestionsInput,
  userId?: string,
  supabase?: SupabaseClient
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let cancelled = false;

  return new ReadableStream({
    async start(controller) {
      const send: Send = (event) => {
        if (!cancelled) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        await runSuggestions(input, send, () => cancelled, userId, supabase);
      } catch (error) {
        console.error("AI Suggestions Error:", { error, query: input.query, userId });
        send({ type: "error", message: toUserMessage(error) });
      } finally {
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });
}

async function runSuggestions(
  { query, page, excludeTitles, aiQueryId, collectionId }: StreamSuggestionsInput,
  send: Send,
  isCancelled: () => boolean,
  userId?: string,
  supabase?: SupabaseClient
) {
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  // Personal context: watched films are excluded, taste steers the prompt
  let watched = new Set<number>();
  let taste: TasteContext | null = null;
  if (userId && supabase) {
    [watched, taste] = await Promise.all([
      getWatchedMovieIds(userId, supabase).catch((error) => {
        console.error("Failed to load watched movies:", error);
        return new Set<number>();
      }),
      getOrBuildTasteProfile(userId, supabase),
    ]);
  }
  const personalised = Boolean(taste);

  if (page === 1 && userId && supabase) {
    const served = await serveFromCache(query, watched, taste, send, userId, supabase);
    if (served) return;
  }

  // Live: start TMDB matching for each suggestion as soon as it streams in
  const rankOffset = (page - 1) * PAGE_SIZE;
  const seen = new Set<number>();
  const emitted: MovieSuggestionInterface[] = [];
  const tasks: Promise<void>[] = [];
  let collectionTitle = "";
  let metaSent = false;
  let index = 0;

  const sendMeta = (title: string) => {
    if (metaSent) return;
    metaSent = true;
    collectionTitle = title;
    send({ type: "meta", title, cached: false, personalised });
  };

  const resolveAndSend = async (movie: MovieSuggestion, rank: number) => {
    try {
      const movieId = await findMovieIdFromTitleAndYear(movie.title, movie.year);
      if (!movieId) {
        console.warn(`Could not find TMDB match for: "${movie.title}" (${movie.year})`);
        return;
      }
      if (watched.has(movieId) || seen.has(movieId)) return;
      seen.add(movieId);

      const tmdbData = await getMovieDetailsById({ movie_id: movieId }).catch(() => null);
      const suggestion: MovieSuggestionInterface = {
        rank,
        title: movie.title,
        year: movie.year,
        reason: movie.reason,
        themes: movie.themes || [],
        tags: movie.tags || [],
        because_you_liked: movie.because_you_liked ?? null,
        movie_id: movieId,
        tmdbData,
      };
      emitted.push(suggestion);
      send({ type: "suggestion", ...suggestion });
    } catch (error) {
      console.error(`Error enriching movie "${movie.title}":`, error);
    }
  };

  // Rated films are always watched, so their titles help the model avoid them up front
  const anchorTitles = taste?.anchors.map((a) => a.title) ?? [];
  const events = provider.streamSuggestions({
    query,
    page,
    taste,
    excludeTitles: [...excludeTitles, ...anchorTitles],
  });

  for await (const event of events) {
    if (isCancelled()) break;
    if (event.type === "title") {
      sendMeta(event.title);
    } else {
      sendMeta(`AI Recommendations: ${query}`);
      tasks.push(resolveAndSend(event.suggestion, rankOffset + ++index));
    }
  }
  await Promise.all(tasks);

  console.log(`=== Suggestions: ${emitted.length} of ${index} matched (page ${page}) ===`);

  if (isCancelled()) return;

  let ids = { aiQueryId: aiQueryId ?? null, collectionId: collectionId ?? null };
  if (userId && supabase && emitted.length > 0) {
    try {
      ids = await persistSuggestions({
        query,
        collectionTitle,
        suggestions: emitted.sort((a, b) => a.rank - b.rank),
        context: { taste_fingerprint: taste?.fingerprint ?? null, personalised },
        aiQueryId,
        collectionId,
        userId,
        supabase,
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to save AI query and recommendations:", error);
    }
  }

  send({ type: "done", ...ids });
}

/**
 * Serve a similar earlier query from the database. Only used when it was
 * generated against the same taste profile, and skips films watched since.
 */
async function serveFromCache(
  query: string,
  watched: Set<number>,
  taste: TasteContext | null,
  send: Send,
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const similarQuery = await findSimilarQuery(query, userId, supabase);
    if (!similarQuery) return false;

    const cachedFingerprint = similarQuery.context?.taste_fingerprint ?? null;
    if (cachedFingerprint !== (taste?.fingerprint ?? null)) return false;

    const cachedRecommendations = (await getRecommendationsByQueryId(similarQuery.id, userId, supabase))
      .filter((rec) => !watched.has(Number(rec.movie_id)));
    if (cachedRecommendations.length === 0) return false;

    const collectionId = await findCollectionIdByAiQueryId(similarQuery.id, userId, supabase).catch(() => null);

    send({
      type: "meta",
      title: `Movies similar to "${similarQuery.prompt}"`,
      cached: true,
      personalised: Boolean(similarQuery.context?.personalised),
    });

    await Promise.all(
      cachedRecommendations.map(async (rec, index) => {
        const tmdbData = await getMovieDetailsById({ movie_id: rec.movie_id }).catch(() => null);
        // context_tags is a simple string array (combined themes and tags)
        const contextTags = Array.isArray(rec.context_tags) ? rec.context_tags : [];
        send({
          type: "suggestion",
          rank: index + 1,
          title: tmdbData?.title || `Movie ${rec.movie_id}`,
          year: tmdbData?.release_date?.split("-")[0] || "",
          reason: rec.reasoning || "",
          themes: [],
          tags: contextTags,
          movie_id: rec.movie_id,
          tmdbData,
        });
      })
    );

    send({ type: "done", aiQueryId: similarQuery.id, collectionId });
    return true;
  } catch (dbError) {
    // Continue to OpenAI call if cache lookup fails
    console.error("Error serving cached recommendations:", dbError);
    return false;
  }
}

/**
 * Page 1 creates the AI query and its collection; later pages append to them.
 */
async function persistSuggestions({
  query,
  collectionTitle,
  suggestions,
  context,
  aiQueryId,
  collectionId,
  userId,
  supabase,
}: {
  query: string;
  collectionTitle: string;
  suggestions: MovieSuggestionInterface[];
  context: object;
  aiQueryId?: string | null;
  collectionId?: string | null;
  userId: string;
  supabase: SupabaseClient;
}) {
  const recommendations = suggestions.map((s) => {
    // Combine themes and tags into a simple string array
    const allTags = [...s.themes, ...s.tags];
    return {
      movie_id: s.movie_id!,
      context_tags: allTags.length > 0 ? allTags : null,
      reasoning: s.reason || null,
    };
  });
  const movieIds = suggestions.map((s) => s.movie_id!);

  if (aiQueryId) {
    await appendRecommendations(aiQueryId, recommendations, supabase);
    if (collectionId) {
      // collectionId comes from the client, so check it's this user's before appending
      await requireOwnedCollection(collectionId, userId, supabase);
      for (const movieId of movieIds) {
        await addMovieToCollection(collectionId, movieId, supabase);
      }
    }
    return { aiQueryId, collectionId: collectionId ?? null };
  }

  const aiQuery = await saveAiQueryAndRecommendations(query, context, recommendations, userId, supabase);

  let newCollectionId: string | null = null;
  try {
    // Collect all unique tags from suggestions
    const allTags = suggestions
      .flatMap((s) => s.tags)
      .filter((tag, index, self) => self.indexOf(tag) === index);

    // Private to this user: generated lists are never public
    const collection = await createGeneratedCollection(
      userId,
      {
        name: collectionTitle.trim() || `AI Recommendations: ${query}`,
        description: `AI-generated recommendations based on: "${query}"`,
        tags: allTags,
        generatedFrom: {
          type: "ai_recommendation",
          query: query,
          ai_query_id: aiQuery.id,
          context,
        },
      },
      movieIds,
      supabase
    );
    newCollectionId = collection.id;
  } catch (collectionError) {
    // Log error but don't fail the request if collection creation fails
    console.error("Failed to create collection from AI recommendations:", collectionError);
  }

  return { aiQueryId: aiQuery.id as string, collectionId: newCollectionId };
}
