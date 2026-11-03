// Queues films for the film-profile-worker. It only adds jobs; the worker
// (run by pg_cron every minute) does the work.
//
//   npx tsx scripts/enqueue-films.ts --limit 200
//   npx tsx scripts/enqueue-films.ts --limit 5000 --target prod --yes
//   npx tsx scripts/enqueue-films.ts --requeue --all --reason vocab_change   # regenerate every queued film
//
// Order: the taste comparison-pair films (needed for calibration), then
// every movie users have rated, favourited, watched, saved or collected, then
// TMDB top rated and popular, alternating, until --limit.

import { parseArgs } from "node:util";
// Scripts run under plain Node; the taste index pulls in React components
// eslint-disable-next-line no-restricted-imports
import { COMPARISON_PAIRS } from "~/features/taste/story";
import { connect, selectAllIds } from "./lib/supabase-target";

const { values: args } = parseArgs({
  options: {
    target: { type: "string", default: "local" },
    yes: { type: "boolean", default: false },
    limit: { type: "string", default: "200" },
    "min-votes": { type: "string", default: "300" },
    reason: { type: "string", default: "backfill" },
    requeue: { type: "boolean", default: false },
    all: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
});

const limit = Number(args.limit);
const minVotes = Number(args["min-votes"]);
const TMDB_MAX_PAGE = 500;

async function tmdbPage(list: "top_rated" | "popular", page: number): Promise<number[]> {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${list}?page=${page}`, {
    headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
  });
  if (!response.ok) throw new Error(`TMDB ${list} page ${page}: ${response.status}`);
  const data = (await response.json()) as { results: { id: number; vote_count: number }[]; total_pages: number };
  return data.results.filter((movie) => movie.vote_count >= minVotes).map((movie) => movie.id);
}

async function collectIds(supabase: ReturnType<typeof connect>["supabase"]): Promise<number[]> {
  const ids = new Set<number>();
  const add = (list: number[]) => list.forEach((id) => Number.isInteger(id) && id > 0 && ids.add(id));

  add(COMPARISON_PAIRS.flatMap((pair) => [pair.low.tmdbId, pair.high.tmdbId]));
  const calibration = ids.size;

  for (const [table, column] of [
    ["user_ratings", "tmdb_movie_id"],
    ["user_favourites", "tmdb_movie_id"],
    ["user_watched_movies", "tmdb_movie_id"],
    ["collection_items", "movie_id"],
  ] as const) {
    add(await selectAllIds(supabase, table, column));
  }
  add(await selectAllIds(supabase, "watchlist_items", "tmdb_id", { column: "media_type", value: "movie" }));
  const fromUsers = ids.size - calibration;

  for (let page = 1; ids.size < limit && page <= TMDB_MAX_PAGE; page++) {
    add(await tmdbPage("top_rated", page));
    if (ids.size < limit) add(await tmdbPage("popular", page));
  }
  console.log(`Collected ${ids.size}: ${calibration} calibration, ${fromUsers} from users, ${ids.size - calibration - fromUsers} from TMDB`);
  // Calibration and user films are always kept; TMDB fills up to the limit
  return [...ids].slice(0, Math.max(limit, calibration + fromUsers));
}

async function main() {
  const { supabase, label } = connect(args);
  console.log(`Target: ${label}`);

  const ids = args.all ? await selectAllIds(supabase, "film_profile_jobs", "tmdb_movie_id") : await collectIds(supabase);
  if (args["dry-run"]) {
    console.log(`Dry run: would ${args.requeue ? "requeue" : "queue"} ${ids.length} films`);
    return;
  }

  let written = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const rows = chunk.map((tmdb_movie_id) =>
      args.requeue
        ? {
            tmdb_movie_id,
            reason: args.reason,
            status: "pending",
            attempts: 0,
            last_error: null,
            locked_at: null,
            finished_at: null,
            requested_at: new Date().toISOString(),
          }
        : { tmdb_movie_id, reason: args.reason }
    );
    const { data, error } = await supabase
      .from("film_profile_jobs")
      .upsert(rows, { onConflict: "tmdb_movie_id", ignoreDuplicates: !args.requeue })
      .select("tmdb_movie_id");
    if (error) throw error;
    written += data?.length ?? 0;
  }
  console.log(
    args.requeue
      ? `Requeued ${written} films`
      : `Queued ${written} new films (${ids.length - written} were already in the queue; use --requeue to redo them)`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
