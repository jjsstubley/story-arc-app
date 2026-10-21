import type { SupabaseClient } from "@supabase/supabase-js";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import { WatchlistItemInterface } from "~/interfaces/watchlist";
import { applyWatchedStatus, getWatchedMovieIds } from "~/features/watched/index.server";
import { NotFoundError, ValidationError } from "~/shared/errors";
import { DEFAULT_WATCHLIST_ID } from "../ids";
import type { WatchlistSummary } from "../types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads the `$id` route param of a Supabase-backed list: "default" or a watchlist uuid */
export function requireWatchlistIdParam(params: Record<string, string | undefined>): string {
  const id = params.id;
  if (id === DEFAULT_WATCHLIST_ID || (id && UUID_PATTERN.test(id))) return id;
  throw new ValidationError("Invalid watchlist id", "INVALID_PARAM");
}

/**
 * Turns a client watchlist id into a real one the user owns. "default" is
 * created on first use; any other id must belong to the user.
 */
export async function resolveWatchlistId(watchlistId: string, userId: string, supabase: SupabaseClient): Promise<string> {
  if (watchlistId === DEFAULT_WATCHLIST_ID) {
    const watchlist = await getOrCreateDefaultWatchlist(userId, supabase);
    return watchlist.id;
  }

  const { data, error } = await supabase
    .from("watchlists")
    .select("id")
    .eq("id", watchlistId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("We couldn't find that watchlist.", "WATCHLIST_NOT_FOUND");
  return data.id;
}

/** The user's watchlists with how many items each holds */
export async function getWatchlistSummaries(userId: string, supabase: SupabaseClient): Promise<WatchlistSummary[]> {
  const { data, error } = await supabase
    .from("watchlists")
    .select("*, watchlist_items(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(({ watchlist_items, ...watchlist }) => ({
    ...watchlist,
    item_count: watchlist_items?.[0]?.count ?? 0,
  }));
}

/** A watchlist ("default" or a uuid) with its items and their TMDB details */
export async function getWatchlistWMovies(watchlistId: string, userId: string, supabase: SupabaseClient) {
  const id = await resolveWatchlistId(watchlistId, userId, supabase);
  const watchlist = await getWatchlistByIdWMovies(id, userId, supabase);
  if (!watchlist) throw new NotFoundError("We couldn't find that watchlist.", "WATCHLIST_NOT_FOUND");

  return {
    ...watchlist,
    // Older rows predate media_type
    watchlist_items: watchlist.watchlist_items.map((item: WatchlistItemInterface) => ({
      ...item,
      media_type: item.media_type ?? "movie",
    })),
  };
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
        tmdb_id,
        tmdb_movie_id,
        is_seen,
        added_at,
        media_type
      )
    `)
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
  if (!data) return null

  const watchedIds = await getWatchedMovieIds(userId, supabase);
  const items = applyWatchedStatus<WatchlistItemInterface>(data.watchlist_items || [], watchedIds).sort((a: WatchlistItemInterface, b: WatchlistItemInterface) => 
    new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
  );

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
    .eq("id", watchlist_id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllWatchlistsWMovies(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("watchlists")
    .select(`*,
      watchlist_items (
        id,
        tmdb_id,
        tmdb_movie_id,
        is_seen,
        added_at,
        media_type
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const watchedIds = await getWatchedMovieIds(userId, supabase);
  const watchlistsWithMovies = await Promise.all(
    data.map(async (watchlist) => {
      const items = applyWatchedStatus<WatchlistItemInterface>(watchlist.watchlist_items || [], watchedIds).sort((a: WatchlistItemInterface, b: WatchlistItemInterface) => 
        new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      );
      
      const enrichedItems = await Promise.all(
        items.map(async (item: WatchlistItemInterface) => {
          try {
            const movie = await getMovieDetailsById({ movie_id: item.tmdb_movie_id });
            return {
              ...item,
              movie,
            };
          } catch (e) {
            console.warn(`Failed to fetch movie ${item.tmdb_movie_id}`, e);
            return item;
          }
        })
      );

      return {
        ...watchlist,
        watchlist_items: enrichedItems
      };
    })
  );

  return watchlistsWithMovies;
}

export async function getWatchlistByIdWMovies(watchlistId: string, userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("watchlists")
    .select(`*,
      watchlist_items (
        id,
        tmdb_id,
        tmdb_movie_id,
        is_seen,
        added_at,
        media_type
      )
    `)
    .eq("id", watchlistId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
  if (!data) return null;

  const watchedIds = await getWatchedMovieIds(userId, supabase);
  const items = applyWatchedStatus<WatchlistItemInterface>(data.watchlist_items || [], watchedIds).sort((a: WatchlistItemInterface, b: WatchlistItemInterface) => 
    new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
  );

  const enrichedItems = await Promise.all(
    items.map(async (item: WatchlistItemInterface) => {
      try {
        const movie = await getMovieDetailsById({ movie_id: item.tmdb_movie_id });
        return {
          ...item,
          movie,
        };
      } catch (e) {
        console.warn(`Failed to fetch movie ${item.tmdb_movie_id}`, e);
        return item;
      }
    })
  );

  return {
    ...data,
    watchlist_items: enrichedItems
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
    .eq("id", watchlist_id)
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
    .eq("id", watchlist_id);

  if (error) throw error;

  return { success: true };
}

export async function getOrCreateDefaultWatchlist(userId: string, supabase: SupabaseClient) {
    const existing = await getDefaultWatchlist(userId, supabase);
    if (existing) return existing;
    return await createDefaultWatchlist(userId, supabase);
}