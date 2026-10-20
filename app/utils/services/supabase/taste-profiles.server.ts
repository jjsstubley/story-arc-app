import type { SupabaseClient } from "@supabase/supabase-js";

const collection = "user_taste_profiles";

export interface TasteAnchor {
  tmdb_id: number;
  title: string;
  year: string;
  tier: string;
}

export interface TasteProfile {
  user_id: string;
  summary: string;
  likes: string[];
  dislikes: string[];
  anchors: TasteAnchor[];
  fingerprint: string;
  updated_at?: string;
}

export async function getTasteProfile(
  userId: string,
  supabase: SupabaseClient
): Promise<TasteProfile | null> {
  const { data, error } = await supabase
    .from(collection)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertTasteProfile(
  profile: TasteProfile,
  supabase: SupabaseClient
): Promise<TasteProfile> {
  const { data, error } = await supabase
    .from(collection)
    .upsert({ ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}
