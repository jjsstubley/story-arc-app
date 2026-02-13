import type { SupabaseClient } from "@supabase/supabase-js";
import { getMovieDetailsById } from "../external/tmdb/movies";
import { CollectionItemInterface } from "~/interfaces/collections";

export async function getAllCollections(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getAllUserCollections(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_system_generated", false);

  if (error) throw error;
  return data;
}

export async function getUserCollectionsWMovies(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .select(`*,
      collection_items (
        list_id,
        movie_id,
        notes,
        added_at,
        source,
        is_watched,
        position
      )
    `)
    .eq("user_id", userId)
    .eq("is_system_generated", false);

  if (error) throw error;
  if (!data) return [];

  const collectionsWithMovies = await Promise.all(
    data.map(async (collection) => {
      const items = collection.collection_items || [];
      const enrichedItems = await Promise.all(
        items.map(async (item: CollectionItemInterface) => {
          try {
            const movie = await getMovieDetailsById({ movie_id: item.movie_id });
            return {
              ...item,
              movie,
            };
          } catch (e) {
            console.warn(`Failed to fetch movie ${item.movie_id}`, e);
            return item;
          }
        })
      );

      return {
        ...collection,
        collection_items: enrichedItems
      };
    })
  );

  return collectionsWithMovies;
}


export async function getCollectionById(id: string, userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw error;
  return data;
}

export async function getCollectionWMoviesById(id: string, userId: string, supabase: SupabaseClient) {

  const { data, error } = await supabase
    .from("collections")
    .select(`*,
      collection_items (
        list_id,
        movie_id,
        notes,
        added_at,
        source,
        is_watched,
        position
      )
    `)
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
  if (!data) return null

  const items = data.collection_items || [];

  const enrichedItems = await Promise.all(
    items.map(async (item: CollectionItemInterface ) => {
      try {
        const movie = await getMovieDetailsById({ movie_id: item.movie_id });
        return {
          ...item,
          movie, // add full movie data here
        };
      } catch (e) {
        console.warn(`Failed to fetch movie ${item.movie_id}`, e);
        return item; // fallback to original item
      }
    })
  );

  return {
    ...data,
    collection_items: enrichedItems
  };
}

type CreateCollectionOptions = {
  user_id: string;
  name: string;
  description?: string;
  tags?: string[];
  generated_from?: object;
  is_public?: boolean;
};

export async function createCollection({ user_id, name, description, tags, generated_from, is_public = false }: CreateCollectionOptions, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id,
      name,
      description,
      tags,
      generated_from,
      is_public,
      is_system_generated: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createCollectionWithItems(
  userId: string,
  collectionData: { name: string; description?: string; tags?: string[]; generated_from?: object; is_public?: boolean },
  movieIds: number[],
  supabase: SupabaseClient
) {
  // Create the collection first
  const collection = await createCollection(
    {
      user_id: userId,
      name: collectionData.name,
      description: collectionData.description,
      tags: collectionData.tags,
      generated_from: collectionData.generated_from,
      is_public: collectionData.is_public
    },
    supabase
  );

  // Add all movies as collection items
  if (movieIds.length > 0) {
    const items = movieIds.map((movieId, index) => ({
      list_id: collection.id,
      movie_id: movieId,
      position: index,
      is_watched: false
    }));

    const { error: itemsError } = await supabase
      .from("collection_items")
      .insert(items);

    if (itemsError) throw itemsError;
  }

  return collection;
}

type UpdateCollectionOptions = {
  name?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
};

export async function updateCollectionById(
  id: string,
  userId: string,
  updates: UpdateCollectionOptions,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteCollectionById(
  id: string,
  userId: string,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw error;

  return { success: true };
}