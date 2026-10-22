import type { SupabaseClient } from "@supabase/supabase-js";

const items = 'collection_items';

/** Appends a movie to a collection; adding one that's already there is a no-op */
export async function addMovieToCollection(collectionId: string, movieId: number, supabase: SupabaseClient): Promise<void> {
  const { data: last, error: fetchError } = await supabase
    .from(items)
    .select('position')
    .eq('list_id', collectionId)
    .order('position', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from(items)
    .insert({ list_id: collectionId, movie_id: movieId, position: (last?.position ?? -1) + 1 });

  if (error && error.code !== '23505') throw error; // 23505 = already in the collection
}

export async function removeMovieFromCollection(collectionId: string, movieId: number, supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase
    .from(items)
    .delete()
    .eq('list_id', collectionId)
    .eq('movie_id', movieId);

  if (error) throw error;
}

export async function isMovieInCollection(collectionId: string, movieId: number, supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase
    .from(items)
    .select('list_id')
    .eq('list_id', collectionId)
    .eq('movie_id', movieId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
