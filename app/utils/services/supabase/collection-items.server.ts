import type { SupabaseClient } from "@supabase/supabase-js";

const collection = 'collection_items'

export async function addMovieToCollection(collectionId: string, movieId: number, userId: string, supabase: SupabaseClient) {
  console.log('addMovieToCollection collectionId', collectionId)
  console.log('addMovieToCollection movieId', movieId)
  
  // Get the current max position for this collection
  const { data: existingItems, error: fetchError } = await supabase
    .from(collection)
    .select("position")
    .eq("list_id", collectionId)
    .order("position", { ascending: false })
    .limit(1);

  if (fetchError && fetchError.code !== "PGRST116") throw fetchError;
  
  const nextPosition = existingItems && existingItems.length > 0 
    ? (existingItems[0].position || 0) + 1 
    : 0;

  const { error } = await supabase
    .from(collection)
    .insert({ 
      list_id: collectionId, 
      movie_id: movieId,
      position: nextPosition,
      is_watched: false
    });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
  console.log('addMovieToCollection all good')
}

export async function removeMovieFromCollection(collectionId: string, movieId: number, supabase: SupabaseClient) {
  console.log('removeMovieFromCollection collectionId', collectionId)
  console.log('removeMovieFromCollection movieId', movieId)
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("list_id", collectionId)
    .eq("movie_id", movieId);

  if (error) throw error;
  console.log('removeMovieFromCollection all good')
}

export async function isMovieInCollection(
  collectionId: string,
  movieId: number,
  supabase: SupabaseClient,
): Promise<boolean> {
  console.log('isMovieInCollection collectionId', collectionId)
  console.log('isMovieInCollection movieId', movieId)
  const { data, error } = await supabase
    .from(collection)
    .select("list_id")
    .eq("list_id", collectionId)
    .eq("movie_id", movieId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function updateCollectionItem(
  collectionId: string, 
  movieId: number, 
  updates: {
    notes?: string;
    position?: number;
    source?: string;
    added_at?: string;
    is_watched?: boolean;
  }, 
  supabase: SupabaseClient
) {
  console.log('updateCollectionItem collectionId', collectionId);
  console.log('updateCollectionItem movieId', movieId);
  console.log('updateCollectionItem updates', updates);

  const { data, error } = await supabase
    .from(collection)
    .update(updates)
    .eq("list_id", collectionId)
    .eq("movie_id", movieId)
    .select()
    .single();

  if (error) throw error;
  
  console.log('updateCollectionItem all good');
  return data;
}

export async function toggleMovieInCollection(userId: string, collectionId: string, movieId: number, supabase: SupabaseClient) {
  const alreadyAdded = await isMovieInCollection(collectionId, movieId, supabase);
  return alreadyAdded
    ? await removeMovieFromCollection(collectionId, movieId, supabase)
    : await addMovieToCollection(collectionId, movieId, userId, supabase);
}

