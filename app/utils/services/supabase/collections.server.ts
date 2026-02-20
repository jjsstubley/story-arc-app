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
  is_system_generated?: boolean;
};

export async function createCollection({ user_id, name, description, tags, generated_from, is_public = false, is_system_generated = false }: CreateCollectionOptions, supabase: SupabaseClient) {
  console.log("=== createCollection ===");
  console.log("Inserting collection with data:", {
    user_id,
    name,
    description,
    tags,
    generated_from,
    is_public,
    is_system_generated,
  });

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id,
      name,
      description,
      tags,
      generated_from,
      is_public,
      is_system_generated
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
  
  console.log("Collection created successfully:", {
    id: data.id,
    name: data.name,
    user_id: data.user_id,
  });
  return data;
}

export async function createCollectionWithItems(
  userId: string,
  collectionData: { name: string; description?: string; tags?: string[]; generated_from?: object; is_public?: boolean; is_system_generated?: boolean },
  movieIds: number[],
  supabase: SupabaseClient
) {
  console.log("=== createCollectionWithItems ===");
  console.log("User ID:", userId);
  console.log("Collection data:", {
    name: collectionData.name,
    description: collectionData.description,
    tags: collectionData.tags,
    is_public: collectionData.is_public,
    is_system_generated: collectionData.is_system_generated,
    generated_from: collectionData.generated_from,
  });
  console.log("Movie IDs:", movieIds);
  console.log("Number of movie IDs:", movieIds.length);

  // Create the collection first
  console.log("Creating collection...");
  const collection = await createCollection(
    {
      user_id: userId,
      name: collectionData.name,
      description: collectionData.description,
      tags: collectionData.tags,
      generated_from: collectionData.generated_from,
      is_public: collectionData.is_public ?? false,
      is_system_generated: collectionData.is_system_generated ?? false
    },
    supabase
  );
  console.log("Collection created:", {
    id: collection.id,
    name: collection.name,
    user_id: collection.user_id,
    is_system_generated: collection.is_system_generated,
  });

  // Add all movies as collection items
  if (movieIds.length > 0) {
    console.log(`Creating ${movieIds.length} collection items...`);
    const items = movieIds.map((movieId, index) => ({
      list_id: collection.id,
      movie_id: movieId,
      position: index,
      is_watched: false
    }));

    console.log("Collection items to insert (first 3):", items.slice(0, 3));
    console.log("Total items:", items.length);

    const { data: insertedItems, error: itemsError } = await supabase
      .from("collection_items")
      .insert(items)
      .select();

    if (itemsError) {
      console.error("Error inserting collection items:", itemsError);
      throw itemsError;
    }
    
    console.log(`Successfully inserted ${insertedItems?.length || 0} collection items`);
  } else {
    console.warn("No movie IDs provided, skipping collection items creation");
  }

  console.log("=== createCollectionWithItems completed ===");
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