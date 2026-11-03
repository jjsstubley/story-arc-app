// Quality report for film story profiles: queue state, coverage, value
// spread, a calibration check and sample neighbours. Read-only.
//
//   npx tsx scripts/check-film-profiles.ts
//   npx tsx scripts/check-film-profiles.ts --similar 77 --similar 1366
//   npx tsx scripts/check-film-profiles.ts --target prod
//
// Calibration: each taste comparison pair puts two films at opposite ends of
// one story axis, so the "low" film should score below the "high" film.

import { parseArgs } from "node:util";
// Scripts run under plain Node; the taste index pulls in React components
// eslint-disable-next-line no-restricted-imports
import { COMPARISON_PAIRS } from "~/features/taste/story";
import { connect } from "./lib/supabase-target";

const { values: args } = parseArgs({
  options: {
    target: { type: "string", default: "local" },
    similar: { type: "string", multiple: true, default: ["77", "1366", "603"] },
    "low-confidence": { type: "string", default: "0.5" },
  },
});

interface ProfileRow {
  tmdb_movie_id: number;
  movies: { title: string; release_date: string | null } | null;
  confidence: number;
  plot_source: string;
  arc_type: string;
  character_arc: string;
  ending_type: string;
  themes: string[];
  moods: string[];
  [axis: `axis_${string}`]: number;
}

const name = (row: ProfileRow | undefined, id: number) =>
  row?.movies ? `${row.movies.title} (${row.movies.release_date?.slice(0, 4) ?? "?"})` : `#${id}`;

function tally(values: string[], top = 12): string {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([value, count]) => `${value} ${count}`)
    .join(", ");
}

async function main() {
  // Read-only, so production doesn't need --yes
  const { supabase, label } = connect({ target: args.target, yes: true });
  console.log(`Target: ${label}\n`);

  const { data: jobs, error: jobsError } = await supabase.from("film_profile_jobs").select("tmdb_movie_id, status, last_error");
  if (jobsError) throw jobsError;
  console.log(`Queue: ${tally(jobs.map((job) => job.status))}`);
  for (const job of jobs.filter((job) => job.status === "failed").slice(0, 10)) {
    console.log(`  failed #${job.tmdb_movie_id}: ${job.last_error}`);
  }

  const profiles: ProfileRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("film_story_profiles")
      .select("*, movies(title, release_date)")
      .range(from, from + 999);
    if (error) throw error;
    profiles.push(...(data as ProfileRow[]));
    if (data.length < 1000) break;
  }
  const byId = new Map(profiles.map((profile) => [profile.tmdb_movie_id, profile]));
  if (profiles.length === 0) {
    console.log("\nNo profiles yet.");
    return;
  }

  const wikipedia = profiles.filter((profile) => profile.plot_source === "wikipedia").length;
  const avgConfidence = profiles.reduce((sum, profile) => sum + profile.confidence, 0) / profiles.length;
  const lowConfidence = profiles.filter((profile) => profile.confidence < Number(args["low-confidence"]));
  console.log(`\nProfiles: ${profiles.length}; Wikipedia plot ${Math.round((wikipedia / profiles.length) * 100)}%; average confidence ${avgConfidence.toFixed(2)}`);
  console.log(`Low confidence (${lowConfidence.length}): ${lowConfidence.slice(0, 15).map((row) => name(row, row.tmdb_movie_id)).join(", ")}`);

  console.log(`\nArc types: ${tally(profiles.map((profile) => profile.arc_type))}`);
  console.log(`Character arcs: ${tally(profiles.map((profile) => profile.character_arc))}`);
  console.log(`Endings: ${tally(profiles.map((profile) => profile.ending_type))}`);
  console.log(`Themes: ${tally(profiles.flatMap((profile) => profile.themes), 15)}`);
  console.log(`Moods: ${tally(profiles.flatMap((profile) => profile.moods), 15)}`);
  for (const axis of ["ending", "pacing", "structure", "focus", "tone", "resolution"]) {
    const scores = profiles.map((profile) => String(profile[`axis_${axis}`]));
    console.log(`Axis ${axis.padEnd(10)} ${["-2", "-1", "0", "1", "2"].map((score) => `${score}:${scores.filter((s) => s === score).length}`).join("  ")}`);
  }

  console.log("\nCalibration (low film should score below high film):");
  const results = { pass: 0, tie: 0, wrong: 0, missing: 0 };
  for (const pair of COMPARISON_PAIRS.filter((pair) => pair.active)) {
    const low = byId.get(pair.low.tmdbId);
    const high = byId.get(pair.high.tmdbId);
    if (!low || !high) {
      results.missing++;
      console.log(`  ?    ${pair.id}: not profiled yet`);
      continue;
    }
    const lowScore = low[`axis_${pair.axis}`];
    const highScore = high[`axis_${pair.axis}`];
    const result = lowScore < highScore ? "pass" : lowScore === highScore ? "tie" : "wrong";
    results[result]++;
    const mark = { pass: "ok  ", tie: "TIE ", wrong: "FAIL" }[result];
    console.log(`  ${mark} ${pair.id}: ${pair.low.title} ${lowScore} vs ${pair.high.title} ${highScore}`);
  }
  console.log(`  ${results.pass} pass, ${results.tie} tie, ${results.wrong} wrong order, ${results.missing} missing`);

  for (const id of (args.similar ?? []).map(Number)) {
    const { data, error } = await supabase.rpc("similar_to_seeds", { seed_ids: [id], per_seed: 8 });
    if (error) throw error;
    if (!data?.length) continue;
    const { data: movies } = await supabase.from("movies").select("tmdb_movie_id, title").in(
      "tmdb_movie_id",
      data.map((row: { tmdb_movie_id: number }) => row.tmdb_movie_id)
    );
    const titles = new Map((movies ?? []).map((movie) => [movie.tmdb_movie_id, movie.title]));
    console.log(`\nSimilar to ${name(byId.get(id), id)}:`);
    for (const row of data as { tmdb_movie_id: number; similarity: number }[]) {
      console.log(`  ${row.similarity.toFixed(3)}  ${titles.get(row.tmdb_movie_id) ?? row.tmdb_movie_id}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
