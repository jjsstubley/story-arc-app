// app/routes/api/temp-watchlist.tsx
import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { deleteWatchlistById, getWatchlistById, updateWatchlistById } from "~/utils/services/supabase/watchlist.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";


// LOADER
export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const { id } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!id) {
    return json({ error: "Watchlist ID is required" }, { status: 400 });
  }

  const watchlist = await getWatchlistById(id, user.id, supabase);

  return json({ watchlist }, { headers });
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
    return json({ error: "Watchlist ID is required" }, { status: 400 });
  }

  switch (method) { 
    case "DELETE": {
      deleteWatchlistById(id, user.id, supabase);
      return json({ message: "Watchlist deleted successfully" }, { status: 204, headers });
    }
    case "PATCH": {
      const watchlist = updateWatchlistById(id, user.id, body, supabase);
      return json({watchlist: watchlist});
    }
    default:
      return new Response("Method Not Allowed", { status: 405 })
  }

}

