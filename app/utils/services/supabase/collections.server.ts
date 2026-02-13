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
        source
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

type CreateWatchlistOptions = {
  user_id: string;
  name: string;
  description?: string;
  tags?: string[]; // or string, depending on your schema
};

export async function createWatchlist({ user_id, name, description, tags }: CreateWatchlistOptions,  supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id,
      name,
      description,
      tags
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

type UpdateWatchlistOptions = {
  name?: string;
  description?: string;
  tags?: string[];
  is_default?: boolean;
};

export async function updateWatchlistById(
  id: string,
  userId: string,
  updates: UpdateWatchlistOptions,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single(); // to get the updated row

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