import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { getTmdbCollectionById } from "~/utils/services/external/tmdb/collections";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  
  const { collectionId } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { user } } = await supabase.auth.getUser()

  if (!collectionId) {
    return json({ error: "Collection ID is required" }, { status: 400, headers });
  }

  // Check if collectionId is a UUID (our database) or a number (TMDB)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(collectionId);
  
  if (isUuid) {
    // This is a database collection ID
    const { data: dbCollection } = await supabase
      .from("collections")
      .select("id, is_system_generated, user_id")
      .eq("id", collectionId)
      .single();

    // If it's a system-generated collection, allow access without authentication
    if (dbCollection && dbCollection.is_system_generated) {
      // For system-generated collections, we need to get the TMDB ID from generated_from
      // or fetch the collection data from our database
      // For now, return an error as this API endpoint is primarily for TMDB collections
      return json({ error: "This endpoint is for TMDB collections. Use /collections/:id for database collections." }, { status: 400, headers });
    }

    // For non-system-generated collections, require authentication
    if (!user) {
      return json({ error: "User must be signed in" }, { status: 401, headers });
    }

    return json({ error: "This endpoint is for TMDB collections. Use /collections/:id for database collections." }, { status: 400, headers });
  }

  // This is a TMDB collection ID (number)
  // Allow access for all users (TMDB collections are public)
  try {
    const collection = await getTmdbCollectionById({ collection_id: parseInt(collectionId) });
    return json({ collection }, { headers });
  } catch (error) {
    return json({ error: "Failed to fetch collection" }, { status: 500, headers });
  }
}