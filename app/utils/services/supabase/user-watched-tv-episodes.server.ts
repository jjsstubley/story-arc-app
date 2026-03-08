import type { SupabaseClient } from "@supabase/supabase-js";

const collection = "user_watched_tv_episodes";

export async function isEpisodeWatched(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient
): Promise<boolean> {
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

export async function getWatchedEpisode(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient
): Promise<{ id: string; watched_at: string } | null> {
  const { data, error } = await supabase
    .from(collection)
    .select("id, watched_at")
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber)
    .eq("episode_number", episodeNumber)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addWatchedEpisode(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase.from(collection).insert({
    user_id: userId,
    tmdb_series_id: seriesId,
    season_number: seasonNumber,
    episode_number: episodeNumber,
  });

  if (error && error.code !== "23505") throw error; // 23505 = unique violation
}

export async function removeWatchedEpisode(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from(collection)
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber)
    .eq("episode_number", episodeNumber);

  if (error) throw error;
}

export async function getWatchedEpisodeNumbersForSeason(
  userId: string,
  seriesId: number,
  seasonNumber: number,
  supabase: SupabaseClient
): Promise<number[]> {
  const { data, error } = await supabase
    .from(collection)
    .select("episode_number")
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId)
    .eq("season_number", seasonNumber);

  if (error) throw error;
  return (data ?? []).map((row) => row.episode_number).sort((a, b) => a - b);
}

export async function getWatchedEpisodesForSeries(
  userId: string,
  seriesId: number,
  supabase: SupabaseClient
): Promise<Record<number, number[]>> {
  const { data, error } = await supabase
    .from(collection)
    .select("season_number, episode_number")
    .eq("user_id", userId)
    .eq("tmdb_series_id", seriesId);

  if (error) throw error;

  const bySeason: Record<number, number[]> = {};
  for (const row of data ?? []) {
    const sn = row.season_number as number;
    if (!bySeason[sn]) bySeason[sn] = [];
    bySeason[sn].push(row.episode_number as number);
  }
  for (const eps of Object.values(bySeason)) {
    eps.sort((a, b) => a - b);
  }
  return bySeason;
}
