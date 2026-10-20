import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { deleteCollectionById, getCollectionWMoviesById, updateCollectionById } from "~/utils/services/supabase/collections.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const { id } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return json({ error: "Collection ID is required" }, { status: 400 });
  }

  const collection = await getCollectionWMoviesById(id, user.id, supabase);

  return json({ collection }, { headers });
}

// ACTIONS
export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const method = request.method;
  const { id } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return json({ error: "Collection ID is required" }, { status: 400 });
  }

  try {
    switch (method) {
      case "DELETE": {
        await deleteCollectionById(id, user.id, supabase);
        // A 204 response must not have a body
        return new Response(null, { status: 204, headers });
      }
      case "PATCH": {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, { status: 400 });
        }

        // Only user-editable fields; never user_id, is_system_generated, etc.
        const { name, description, tags, is_public } = body;
        const updates = Object.fromEntries(
          Object.entries({ name, description, tags, is_public }).filter(([, value]) => value !== undefined)
        );

        const collection = await updateCollectionById(id, user.id, updates, supabase);
        return json({ collection }, { headers });
      }
      default:
        return new Response("Method Not Allowed", { status: 405 })
    }
  } catch (error: unknown) {
    console.error("Collection action error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}


