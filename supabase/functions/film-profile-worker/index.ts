// Drains film_profile_jobs: for each claimed movie, sync TMDB metadata, fetch
// the Wikipedia plot, generate a story profile and embed its story card.
// Called every minute by pg_cron (see the film_profile_worker_cron
// migration), or by hand: POST with `Authorization: Bearer $FILM_WORKER_SECRET`
// and an optional body `{ "batch": 10 }`.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { VOCAB_VERSION } from "../_shared/film-vocabulary.ts";
import { PermanentError } from "./errors.ts";
import { buildStoryCard, embed, EMBEDDING_MODEL, generateProfile, PROFILE_MODEL, sourceHash } from "./profile.ts";
import { fetchMovie } from "./tmdb.ts";
import { fetchPlot } from "./wikipedia.ts";

const DEFAULT_BATCH = 10;
const MAX_BATCH = 25;
const CONCURRENCY = 5;
const MAX_ATTEMPTS = 3;

type Outcome = "done" | "skipped" | "retry" | "failed";

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

/** Returns "skipped" when the inputs haven't changed since the last profile */
async function buildProfile(movieId: number, supabase: SupabaseClient): Promise<"done" | "skipped"> {
  const { row: movie, genreNames } = await fetchMovie(movieId);
  const { error: movieError } = await supabase.from("movies").upsert(movie);
  if (movieError) throw movieError;

  const wikipedia = await fetchPlot(movie.wikidata_id).catch(() => null);
  const input = { movie, genreNames, plot: wikipedia?.plot ?? null };
  const hash = await sourceHash(input);

  const { data: existing, error: existingError } = await supabase
    .from("film_embeddings")
    .select("source_hash")
    .eq("tmdb_movie_id", movieId)
    .eq("kind", "story")
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.source_hash === hash) return "skipped";

  const profile = await generateProfile(input);
  const storyCard = buildStoryCard(profile, genreNames);
  const embedding = await embed(storyCard);

  const { axes, ...facets } = profile;
  const { error: profileError } = await supabase.from("film_story_profiles").upsert({
    tmdb_movie_id: movieId,
    axis_ending: axes.ending,
    axis_pacing: axes.pacing,
    axis_structure: axes.structure,
    axis_focus: axes.focus,
    axis_tone: axes.tone,
    axis_resolution: axes.resolution,
    ...facets,
    story_card: storyCard,
    plot_source: wikipedia ? "wikipedia" : "tmdb",
    wikipedia_title: wikipedia?.title ?? null,
    vocab_version: VOCAB_VERSION,
    model: PROFILE_MODEL,
    source_hash: hash,
    generated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  // Written last: its source_hash is what marks the whole profile as current
  const { error: embeddingError } = await supabase.from("film_embeddings").upsert({
    tmdb_movie_id: movieId,
    kind: "story",
    model: EMBEDDING_MODEL,
    embedding: JSON.stringify(embedding),
    source_hash: hash,
    created_at: new Date().toISOString(),
  });
  if (embeddingError) throw embeddingError;
  return "done";
}

async function runJob(job: { tmdb_movie_id: number; attempts: number }, supabase: SupabaseClient): Promise<Outcome> {
  let outcome: Outcome;
  let lastError: string | null = null;
  try {
    outcome = await buildProfile(job.tmdb_movie_id, supabase);
  } catch (error) {
    lastError = error instanceof Error ? error.message : JSON.stringify(error);
    outcome = error instanceof PermanentError || job.attempts >= MAX_ATTEMPTS ? "failed" : "retry";
    console.error(`film ${job.tmdb_movie_id} (attempt ${job.attempts}): ${lastError}`);
  }

  const finished = outcome !== "retry";
  const { error } = await supabase
    .from("film_profile_jobs")
    .update({
      status: outcome === "retry" ? "pending" : outcome === "failed" ? "failed" : "done",
      last_error: lastError,
      locked_at: null,
      finished_at: finished ? new Date().toISOString() : null,
    })
    .eq("tmdb_movie_id", job.tmdb_movie_id);
  if (error) console.error(`film ${job.tmdb_movie_id}: couldn't update job: ${error.message}`);
  return outcome;
}

Deno.serve(async (request) => {
  const secret = Deno.env.get("FILM_WORKER_SECRET");
  if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const batch = Math.min(MAX_BATCH, Math.max(1, Number(body?.batch) || DEFAULT_BATCH));

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: jobs, error } = await supabase.rpc("claim_film_profile_jobs", { batch_size: batch });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const outcomes = await mapWithConcurrency(jobs ?? [], CONCURRENCY, (job) => runJob(job, supabase));
  const counts = { claimed: outcomes.length, done: 0, skipped: 0, retry: 0, failed: 0 };
  for (const outcome of outcomes) counts[outcome]++;
  return Response.json(counts);
});
