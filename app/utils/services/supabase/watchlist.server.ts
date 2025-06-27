import type { SupabaseClient } from "@supabase/supabase-js";
import { getMovieDetailsById } from "../external/tmdb/movies";
import { WatchlistItemInterface } from "~/interfaces/watchlist";

export async function getAllWatchlists(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getDefaultWatchlist(userId: string, supabase: SupabaseClient) {

    const { data, error } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single();
  
    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
    return data;
}

export async function getDefaultWatchlistWMovies(userId: string, supabase: SupabaseClient) {

  const { data, error } = await supabase
    .from("watchlists")
    .select(`*,
      watchlist_items (
        id,
        tmdb_movie_id,
        is_seen,
        added_at
      )
    `)
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
  if (!data) return null

  const items = data.watchlist_items || [];

  const enrichedItems = await Promise.all(
    items.map(async (item: WatchlistItemInterface) => {
      try {
        const movie = await getMovieDetailsById({ movie_id: item.tmdb_movie_id });
        return {
          ...item,
          movie, // add full movie data here
        };
      } catch (e) {
        console.warn(`Failed to fetch movie ${item.tmdb_movie_id}`, e);
        return item; // fallback to original item
      }
    })
  );

  return {
    ...data,
    watchlist_items: enrichedItems
  };
}

export async function getWatchlistById(watchlist_id: string, userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", userId)
    .eq("watchlist_id", watchlist_id);

  if (error) throw error;
  return data;
}

type CreateWatchlistOptions = {
  user_id: string;
  name: string;
  description?: string;
  tags?: string[]; // or string, depending on your schema
};

export async function createWatchlist({ user_id, name, description, tags }: CreateWatchlistOptions,  supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("watchlists")
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

export async function createDefaultWatchlist(userId: string, supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from("watchlists")
      .insert({
        user_id: userId,
        name: "Default Watchlist",
        is_default: true,
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
  watchlist_id: string,
  userId: string,
  updates: UpdateWatchlistOptions,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("watchlists")
    .update(updates)
    .eq("watchlist_id", watchlist_id)
    .eq("user_id", userId)
    .select()
    .single(); // to get the updated row

  if (error) throw error;

  return data;
}

export async function deleteWatchlistById(
  watchlist_id: string,
  userId: string,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("watchlist_id", watchlist_id);

  if (error) throw error;

  return { success: true };
}

export async function getOrCreateDefaultWatchlist(userId: string, supabase: SupabaseClient) {
    const existing = await getDefaultWatchlist(userId, supabase);
    if (existing) return existing;
    return await createDefaultWatchlist(userId, supabase);
}