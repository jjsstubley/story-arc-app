import type { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError, ValidationError } from "~/shared/errors";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import type { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import type {
  Collection,
  CollectionItem,
  CollectionItemWithMovie,
  CollectionSummary,
  CollectionWithMovies,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../types";

const collections = 'collections';
const items = 'collection_items';
const ITEM_COLUMNS = 'list_id, movie_id, position, added_at, notes, source, is_watched';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireCollectionIdParam(params: Record<string, string | undefined>): string {
  const id = params.id;
  if (id && UUID_PATTERN.test(id)) return id;
  throw new ValidationError("Invalid collection id", "INVALID_PARAM");
}

/** Adds TMDB details to each item, fetching each movie once even if it's in several collections */
async function attachMovies(
  rows: (Collection & { collection_items: CollectionItem[] })[]
): Promise<CollectionWithMovies[]> {
  const movieIds = [...new Set(rows.flatMap((row) => row.collection_items.map((item) => item.movie_id)))];
  const movies = new Map<number, TmdbMovieSummaryInterface | null>();

  await Promise.all(
    movieIds.map(async (movieId) => {
      try {
        movies.set(movieId, await getMovieDetailsById({ movie_id: movieId }));
      } catch (error) {
        console.warn(`Failed to fetch movie ${movieId}`, error);
        movies.set(movieId, null);
      }
    })
  );

  return rows.map((row) => ({
    ...row,
    collection_items: [...row.collection_items]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((item): CollectionItemWithMovie => ({ ...item, movie: movies.get(item.movie_id) ?? null })),
  }));
}

/** Curated collections, for navigation */
export async function getPublicCollectionSummaries(supabase: SupabaseClient): Promise<CollectionSummary[]> {
  const { data, error } = await supabase
    .from(collections)
    .select('id, name')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Curated collections with their movies, for the home page */
export async function getPublicCollectionsWithMovies(supabase: SupabaseClient): Promise<CollectionWithMovies[]> {
  const { data, error } = await supabase
    .from(collections)
    .select(`*, collection_items (${ITEM_COLUMNS})`)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachMovies(data ?? []);
}

/** The user's own collections, including generated ones, without items */
export async function getUserCollections(userId: string, supabase: SupabaseClient): Promise<Collection[]> {
  const { data, error } = await supabase
    .from(collections)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** The user's generated collections of one kind (generated_from.type), oldest first, with their movies */
export async function getGeneratedCollectionsWithMovies(
  userId: string,
  type: string,
  supabase: SupabaseClient
): Promise<CollectionWithMovies[]> {
  const { data, error } = await supabase
    .from(collections)
    .select(`*, collection_items (${ITEM_COLUMNS})`)
    .eq('user_id', userId)
    .eq('is_system_generated', true)
    .eq('generated_from->>type', type)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return attachMovies(data ?? []);
}

/** Deletes the user's generated collections of one kind, keeping any listed in `keepIds` */
export async function deleteGeneratedCollections(
  userId: string,
  type: string,
  keepIds: string[],
  supabase: SupabaseClient
): Promise<void> {
  let query = supabase
    .from(collections)
    .delete()
    .eq('user_id', userId)
    .eq('is_system_generated', true)
    .eq('generated_from->>type', type);
  if (keepIds.length > 0) query = query.not('id', 'in', `(${keepIds.join(',')})`);

  const { error } = await query;
  if (error) throw error;
}

/**
 * A collection with its movies, if the user may see it: public collections
 * for anyone, private ones only for their owner.
 */
export async function getCollectionWithMovies(
  id: string,
  userId: string | null,
  supabase: SupabaseClient
): Promise<CollectionWithMovies> {
  const visible = userId ? `is_public.eq.true,user_id.eq.${userId}` : 'is_public.eq.true';
  const { data, error } = await supabase
    .from(collections)
    .select(`*, collection_items (${ITEM_COLUMNS})`)
    .eq('id', id)
    .or(visible)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new NotFoundError(
      userId ? "We couldn't find that collection." : "We couldn't find that collection. If it's yours, sign in to see it.",
      'COLLECTION_NOT_FOUND'
    );
  }

  const [collection] = await attachMovies([data]);
  return collection;
}

/** Throws unless the collection exists and belongs to the user */
export async function requireOwnedCollection(id: string, userId: string, supabase: SupabaseClient): Promise<void> {
  const { data, error } = await supabase
    .from(collections)
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("We couldn't find that collection.", 'COLLECTION_NOT_FOUND');
}

async function insertCollection(
  row: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'is_public'>,
  movieIds: number[],
  supabase: SupabaseClient
): Promise<Collection> {
  // Users can't create public collections (RLS enforces this too)
  const { data, error } = await supabase
    .from(collections)
    .insert({ ...row, is_public: false })
    .select()
    .single();

  if (error) throw error;

  if (movieIds.length > 0) {
    const uniqueIds = [...new Set(movieIds)];
    const { error: itemsError } = await supabase
      .from(items)
      .insert(uniqueIds.map((movieId, position) => ({ list_id: data.id, movie_id: movieId, position })));

    if (itemsError) {
      // Don't leave an empty collection behind
      await supabase.from(collections).delete().eq('id', data.id);
      throw itemsError;
    }
  }

  return data;
}

/** A collection the user made, optionally copied from another one */
export async function createCollection(
  userId: string,
  { name, description = null, tags = [], movieIds = [], forkedFrom }: CreateCollectionInput,
  supabase: SupabaseClient
): Promise<Collection> {
  return insertCollection(
    {
      user_id: userId,
      name,
      description,
      tags,
      generated_from: forkedFrom ? { type: 'fork', source_collection_id: forkedFrom } : {},
      is_system_generated: false,
    },
    movieIds,
    supabase
  );
}

/** A private collection the app made for the user, e.g. from AI suggestions */
export async function createGeneratedCollection(
  userId: string,
  { name, description = null, tags = [], generatedFrom }: { name: string; description?: string | null; tags?: string[]; generatedFrom: Record<string, unknown> },
  movieIds: number[],
  supabase: SupabaseClient
): Promise<Collection> {
  return insertCollection(
    { user_id: userId, name, description, tags, generated_from: generatedFrom, is_system_generated: true },
    movieIds,
    supabase
  );
}

export async function updateCollection(
  id: string,
  userId: string,
  updates: UpdateCollectionInput,
  supabase: SupabaseClient
): Promise<Collection> {
  const { data, error } = await supabase
    .from(collections)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("We couldn't find that collection.", 'COLLECTION_NOT_FOUND');
  return data;
}

export async function deleteCollection(id: string, userId: string, supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase
    .from(collections)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

/** The generated collection created from an AI query, if any */
export async function findCollectionIdByAiQueryId(
  aiQueryId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from(collections)
    .select('id')
    .eq('user_id', userId)
    .eq('is_system_generated', true)
    .eq('generated_from->>ai_query_id', aiQueryId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}
