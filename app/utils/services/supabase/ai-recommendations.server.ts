import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Find similar AI query by searching for exact or fuzzy matches
 * Returns the most similar query if found, null otherwise
 */
export async function findSimilarQuery(
  prompt: string,
  userId: string,
  supabase: SupabaseClient
) {
  // First try exact match (case-insensitive)
  const { data: exactMatch, error: exactError } = await supabase
    .from("ai_queries")
    .select("*")
    .eq("generated_by", userId)
    .ilike("prompt", prompt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exactError && exactError.code !== "PGRST116") {
    throw exactError;
  }

  if (exactMatch) {
    return exactMatch;
  }

  // If no exact match, try fuzzy match using similarity
  // Note: This requires pg_trgm extension which is enabled in the migration
  const { data: fuzzyMatches, error: fuzzyError } = await supabase
    .rpc("find_similar_queries", {
      search_prompt: prompt,
      user_id: userId,
      similarity_threshold: 0.3
    });

  if (fuzzyError) {
    // If the RPC function doesn't exist yet, fall back to simple ILIKE search
    // This is a fallback - ideally the RPC function should be created
    const { data: fallbackMatch, error: fallbackError } = await supabase
      .from("ai_queries")
      .select("*")
      .eq("generated_by", userId)
      .ilike("prompt", `%${prompt}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError && fallbackError.code !== "PGRST116") {
      throw fallbackError;
    }

    return fallbackMatch || null;
  }

  if (fuzzyMatches && fuzzyMatches.length > 0) {
    return fuzzyMatches[0];
  }

  return null;
}

/**
 * Get AI query by ID
 */
export async function getAiQueryById(
  id: string,
  userId: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("ai_queries")
    .select("*")
    .eq("id", id)
    .eq("generated_by", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

/**
 * Get all recommendations for a specific AI query
 */
export async function getRecommendationsByQueryId(
  queryId: string,
  userId: string,
  supabase: SupabaseClient
) {
  // First verify the query belongs to the user
  const query = await getAiQueryById(queryId, userId, supabase);
  if (!query) {
    return [];
  }

  const { data, error } = await supabase
    .from("ai_recommendations")
    .select("*")
    .eq("ai_query_id", queryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Save AI query and all its recommendations to the database
 */
export async function saveAiQueryAndRecommendations(
  prompt: string,
  context: object | null,
  recommendations: Array<{
    movie_id: number;
    context_tags?: string[] | null;
    reasoning?: string | null;
  }>,
  userId: string,
  supabase: SupabaseClient
) {
  // First, create the AI query
  const { data: aiQuery, error: queryError } = await supabase
    .from("ai_queries")
    .insert({
      prompt,
      context: context || null,
      generated_by: userId,
    })
    .select()
    .single();

  if (queryError) {
    throw queryError;
  }

  // Then, insert all recommendations
  if (recommendations.length > 0) {
    const recommendationRecords = recommendations.map((rec) => ({
      ai_query_id: aiQuery.id as string, // Ensure it's a string UUID
      movie_id: Number(rec.movie_id), // Ensure it's an integer
      context_tags: rec.context_tags || null,
      reasoning: rec.reasoning || null,
    }));

    console.log("=== Inserting Recommendations ===");
    console.log("AI Query ID:", aiQuery.id);
    console.log("AI Query ID type:", typeof aiQuery.id);
    console.log("Sample recommendation:", {
      ai_query_id: recommendationRecords[0]?.ai_query_id,
      movie_id: recommendationRecords[0]?.movie_id,
      movie_id_type: typeof recommendationRecords[0]?.movie_id,
    });

    const { error: recommendationsError } = await supabase
      .from("ai_recommendations")
      .insert(recommendationRecords);

    if (recommendationsError) {
      throw recommendationsError;
    }
  }

  return aiQuery;
}

/**
 * Delete an AI query and all its recommendations (cascade delete)
 */
export async function deleteAiQuery(
  id: string,
  userId: string,
  supabase: SupabaseClient
) {
  // Verify the query belongs to the user
  const query = await getAiQueryById(id, userId, supabase);
  if (!query) {
    throw new Error("AI query not found or access denied");
  }

  // Delete the query (recommendations will be cascade deleted)
  const { error } = await supabase
    .from("ai_queries")
    .delete()
    .eq("id", id)
    .eq("generated_by", userId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Get all AI queries for a user
 */
export async function getAllAiQueriesForUser(
  userId: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("ai_queries")
    .select("*")
    .eq("generated_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

