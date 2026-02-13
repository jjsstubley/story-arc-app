import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { createCollection, createCollectionWithItems, getAllUserCollections } from "~/utils/services/supabase/collections.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

// LOADER
export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await getAllUserCollections(user.id, supabase);

  return json({ collections }, { headers });
}

// ACTIONS
export async function action({ request }: ActionFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, tags, movieIds, generated_from, is_public } = body;

  if (!name) {
    return json({ error: "Collection name is required" }, { status: 400 });
  }

  try {
    let newCollection;
    
    // If movieIds are provided, create collection with items (forking)
    if (movieIds && Array.isArray(movieIds) && movieIds.length > 0) {
      newCollection = await createCollectionWithItems(
        user.id,
        {
          name,
          description,
          tags,
          generated_from,
          is_public: is_public ?? false
        },
        movieIds,
        supabase
      );
    } else {
      // Otherwise, create empty collection
      newCollection = await createCollection(
        {
          user_id: user.id,
          name,
          description,
          tags,
          generated_from,
          is_public: is_public ?? false
        },
        supabase
      );
    }

    return json({ collection: newCollection }, { status: 201, headers });
  } catch (error: unknown) {
    console.error("Create Collection Error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

