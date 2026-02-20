import type { SupabaseClient } from "@supabase/supabase-js";
import { getTVSeriesDetailsById } from "../external/tmdb/tv/series";

const collection = 'saved_tv_series'

export async function addSeriesToSaved(
  userId: string,
  seriesId: number,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  console.log('addSeriesToSaved userId', userId)
  console.log('addSeriesToSaved seriesId', seriesId)
  const { error } = await supabase
    .from(collection)
    .insert({ 
      user_id: userId, 
      tmdb_series_id: seriesId,
      watchlist_id: watchlistId || null
    });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
  console.log('addSeriesToSaved all good')
}

export async function removeSeriesFromSaved(
  userId: string,
  seriesId: number,
  supabase: SupabaseClient
) {
  console.log('removeSeriesFromSaved userId', userId)
  console.log('removeSeriesFromSaved seriesId', seriesId)
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId);

  if (error) throw error;
  console.log('removeSeriesFromSaved all good')
}

export async function isSeriesSaved(
  userId: string,
  seriesId: number,
  supabase: SupabaseClient
): Promise<boolean> {
  console.log('isSeriesSaved userId', userId)
  console.log('isSeriesSaved seriesId', seriesId)
  const { data, error } = await supabase
    .from(collection)
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function toggleSeriesInSaved(
  userId: string,
  seriesId: number,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  const alreadyAdded = await isSeriesSaved(userId, seriesId, supabase);
  return alreadyAdded
    ? await removeSeriesFromSaved(userId, seriesId, supabase)
    : await addSeriesToSaved(userId, seriesId, supabase, watchlistId);
}

export async function updateTVSeriesItem(
  userId: string,
  seriesId: number,
  updates: {
    is_seen?: boolean;
    notes?: string;
  },
  supabase: SupabaseClient
) {
  console.log('updateTVSeriesItem userId', userId);
  console.log('updateTVSeriesItem seriesId', seriesId);
  console.log('updateTVSeriesItem updates', updates);

  const { data, error } = await supabase
    .from(collection)
    .update(updates)
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .select()
    .single();

  if (error) throw error;
  
  console.log('updateTVSeriesItem all good');
  return data;
}

export async function getUserSavedSeries(
  userId: string,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  let query = supabase
    .from(collection)
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (watchlistId) {
    query = query.eq("watchlist_id", watchlistId);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Enrich with full series data from TMDB
  const enrichedSeries = await Promise.all(
    data.map(async (saved) => {
      try {
        const series = await getTVSeriesDetailsById({ 
          series_id: saved.tmdb_series_id,
          append_to_response: []
        });
        return {
          ...saved,
          series, // add full series data here
        };
      } catch (e) {
        console.warn(`Failed to fetch series ${saved.tmdb_series_id}`, e);
        return saved; // fallback to original saved data
      }
    })
  );

  return enrichedSeries;
}

