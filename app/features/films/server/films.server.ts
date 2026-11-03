import type { SupabaseClient } from "@supabase/supabase-js";
import type { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { normaliseSimilarities, sharedTraits, storySimilarity } from "../similarity";
import type { FilmStoryProfile, Movie, ScoredProfile, SimilarStories } from "../types";

/** Vector neighbours to re-rank; more gives the structured score more to choose from */
const CANDIDATES = 50;

type ProfileWithMovie = FilmStoryProfile & { movies: Movie };

/** Profiles (with their movie) for the given ids; movies without a profile are missing from the map */
async function getProfilesWithMovies(movieIds: number[], supabase: SupabaseClient): Promise<Map<number, ProfileWithMovie>> {
  if (movieIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("film_story_profiles")
    .select("*, movies!inner(*)")
    .in("tmdb_movie_id", movieIds);
  if (error) throw error;
  return new Map((data as ProfileWithMovie[]).map((row) => [row.tmdb_movie_id, row]));
}

function toScored(row: ProfileWithMovie): ScoredProfile {
  const { movies, ...profile } = row;
  return { ...profile, genre_ids: movies.genre_ids, keywords: movies.keywords };
}

/** A `movies` row shaped like a TMDB list result, for the shared poster components */
function toMovieSummary(movie: Movie): TmdbMovieSummaryInterface {
  return {
    id: movie.tmdb_movie_id,
    title: movie.title,
    original_title: movie.original_title ?? movie.title,
    release_date: movie.release_date ?? "",
    poster_path: movie.poster_path ?? "",
    backdrop_path: "",
    overview: movie.overview ?? "",
    original_language: movie.original_language ?? "",
    genre_ids: movie.genre_ids,
    popularity: movie.popularity ?? 0,
    vote_average: movie.vote_average ?? 0,
    vote_count: movie.vote_count ?? 0,
    adult: false,
    video: false,
  };
}

export async function getStoryProfile(movieId: number, supabase: SupabaseClient): Promise<FilmStoryProfile | null> {
  const { data, error } = await supabase.from("film_story_profiles").select("*").eq("tmdb_movie_id", movieId).maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Films whose stories are most like this one: vector neighbours re-ranked on
 * the structured profile. `ready` is false until the movie has a profile.
 */
export async function getSimilarStories(movieId: number, count: number, supabase: SupabaseClient): Promise<SimilarStories> {
  const seedRow = (await getProfilesWithMovies([movieId], supabase)).get(movieId);
  if (!seedRow) return { ready: false, logline: null, films: [] };

  const { data: neighbours, error } = await supabase.rpc("similar_to_seeds", { seed_ids: [movieId], per_seed: CANDIDATES });
  if (error) throw error;
  const candidates = (neighbours ?? []) as { tmdb_movie_id: number; similarity: number }[];
  if (candidates.length === 0) return { ready: true, logline: seedRow.logline, films: [] };

  const rows = await getProfilesWithMovies(candidates.map((candidate) => candidate.tmdb_movie_id), supabase);
  const seed = toScored(seedRow);
  const vectorScore = normaliseSimilarities(candidates.map((candidate) => candidate.similarity));

  const films = candidates
    .flatMap((candidate) => {
      const row = rows.get(candidate.tmdb_movie_id);
      if (!row) return [];
      const scored = toScored(row);
      return [
        {
          movie: toMovieSummary(row.movies),
          score: storySimilarity(seed, scored, vectorScore(candidate.similarity)),
          ...sharedTraits(seed, scored),
        },
      ];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return { ready: true, logline: seedRow.logline, films };
}
