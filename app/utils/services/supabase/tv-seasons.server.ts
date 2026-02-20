import type { SupabaseClient } from "@supabase/supabase-js";

const collection = 'saved_tv_seasons'

export async function addSeasonToSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  console.log('addSeasonToSaved userId', userId)
  console.log('addSeasonToSaved seriesId', seriesId, 'seasonNumber', seasonNumber)
  const { error } = await supabase
    .from(collection)
    .insert({ 
      user_id: userId, 
      tmdb_series_id: seriesId,
      season_number: seasonNumber,
      watchlist_id: watchlistId || null
    });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
  console.log('addSeasonToSaved all good')
}

export async function removeSeasonFromSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  supabase: SupabaseClient
) {
  console.log('removeSeasonFromSaved userId', userId)
  console.log('removeSeasonFromSaved seriesId', seriesId, 'seasonNumber', seasonNumber)
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber);

  if (error) throw error;
  console.log('removeSeasonFromSaved all good')
}

export async function isSeasonSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  supabase: SupabaseClient
): Promise<boolean> {
  console.log('isSeasonSaved userId', userId)
  console.log('isSeasonSaved seriesId', seriesId, 'seasonNumber', seasonNumber)
  const { data, error } = await supabase
    .from(collection)
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function toggleSeasonInSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  const alreadyAdded = await isSeasonSaved(userId, seriesId, seasonNumber, supabase);
  return alreadyAdded
    ? await removeSeasonFromSaved(userId, seriesId, seasonNumber, supabase)
    : await addSeasonToSaved(userId, seriesId, seasonNumber, supabase, watchlistId);
}

export async function getUserSavedSeasons(
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
  return data || [];
}

