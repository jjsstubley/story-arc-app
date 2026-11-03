import { PermanentError } from "./errors.ts";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";

export interface MovieRow {
  tmdb_movie_id: number;
  title: string;
  original_title: string | null;
  release_date: string | null;
  runtime: number | null;
  original_language: string | null;
  genre_ids: number[];
  keywords: string[];
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
  poster_path: string | null;
  overview: string | null;
  imdb_id: string | null;
  wikidata_id: string | null;
  tmdb_synced_at: string;
}

interface TmdbMovie {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  runtime?: number;
  original_language?: string;
  genres?: { id: number; name: string }[];
  keywords?: { keywords?: { name: string }[] };
  external_ids?: { imdb_id?: string | null; wikidata_id?: string | null };
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string | null;
  overview?: string;
}

export interface TmdbFilm {
  row: MovieRow;
  genreNames: string[];
}

export async function fetchMovie(movieId: number): Promise<TmdbFilm> {
  const response = await fetch(
    `${TMDB_API_BASE_URL}/movie/${movieId}?append_to_response=keywords,external_ids`,
    { headers: { accept: "application/json", Authorization: `Bearer ${Deno.env.get("TMDB_ACCESS_TOKEN")}` } }
  );
  if (response.status === 404) throw new PermanentError(`TMDB has no movie ${movieId}`);
  if (!response.ok) throw new Error(`TMDB ${response.status} for movie ${movieId}`);

  const movie = (await response.json()) as TmdbMovie;
  return {
    genreNames: (movie.genres ?? []).map((genre) => genre.name),
    row: {
      tmdb_movie_id: movie.id,
      title: movie.title,
      original_title: movie.original_title ?? null,
      release_date: movie.release_date || null,
      runtime: movie.runtime || null,
      original_language: movie.original_language ?? null,
      genre_ids: (movie.genres ?? []).map((genre) => genre.id),
      keywords: (movie.keywords?.keywords ?? []).map((keyword) => keyword.name),
      popularity: movie.popularity ?? null,
      vote_average: movie.vote_average ?? null,
      vote_count: movie.vote_count ?? null,
      poster_path: movie.poster_path ?? null,
      overview: movie.overview || null,
      imdb_id: movie.external_ids?.imdb_id ?? null,
      wikidata_id: movie.external_ids?.wikidata_id ?? null,
      tmdb_synced_at: new Date().toISOString(),
    },
  };
}
