import type { SupabaseClient } from "@supabase/supabase-js";

const collection = 'saved_tv_episodes'

export async function addEpisodeToSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  console.log('addEpisodeToSaved userId', userId)
  console.log('addEpisodeToSaved seriesId', seriesId, 'seasonNumber', seasonNumber, 'episodeNumber', episodeNumber)
  const { error } = await supabase
    .from(collection)
    .insert({ 
      user_id: userId, 
      tmdb_series_id: seriesId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      watchlist_id: watchlistId || null
    });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
  console.log('addEpisodeToSaved all good')
}

export async function removeEpisodeFromSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient
) {
  console.log('removeEpisodeFromSaved userId', userId)
  console.log('removeEpisodeFromSaved seriesId', seriesId, 'seasonNumber', seasonNumber, 'episodeNumber', episodeNumber)
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber)
    .eq("episode_number", episodeNumber);

  if (error) throw error;
  console.log('removeEpisodeFromSaved all good')
}

export async function isEpisodeSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient
): Promise<boolean> {
  console.log('isEpisodeSaved userId', userId)
  console.log('isEpisodeSaved seriesId', seriesId, 'seasonNumber', seasonNumber, 'episodeNumber', episodeNumber)
  const { data, error } = await supabase
    .from(collection)
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber)
    .eq("episode_number", episodeNumber)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function toggleEpisodeInSaved(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient,
  watchlistId?: string | null
) {
  const alreadyAdded = await isEpisodeSaved(userId, seriesId, seasonNumber, episodeNumber, supabase);
  return alreadyAdded
    ? await removeEpisodeFromSaved(userId, seriesId, seasonNumber, episodeNumber, supabase)
    : await addEpisodeToSaved(userId, seriesId, seasonNumber, episodeNumber, supabase, watchlistId);
}

export async function getUserSavedEpisodes(
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

