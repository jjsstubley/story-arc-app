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

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!id) {
    return json({ error: "Collection ID is required" }, { status: 400 });
  }

  switch (method) { 
    case "DELETE": {
      await deleteCollectionById(id, user.id, supabase);
      return json({ message: "Collection deleted successfully" }, { status: 204, headers });
    }
    case "PATCH": {
      const collection = await updateCollectionById(id, user.id, body, supabase);
      return json({ collection }, { headers });
    }
    default:
      return new Response("Method Not Allowed", { status: 405 })
  }
}


