import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { isMovieInWatchlist, updateWatchlistItem } from "~/utils/services/supabase/watchlist-items.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { id: watchlistId, movieId } = params;

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!watchlistId || !movieId) {
    return json({ error: "Watchlist ID and Movie ID are required" }, { status: 400 });
  }

  // Skip check for popcorn and default - they have their own routes
  if (watchlistId === "popcorn" || watchlistId === "default") {
    return json({ error: "Use specific route for this watchlist" }, { status: 400 });
  }

  const exists = await isMovieInWatchlist(watchlistId, parseInt(movieId), supabase);

  return json({ exists }, { headers });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { id: watchlistId, movieId } = params;
  const supabase = getSupabaseServerClient(request, headers);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!watchlistId || !movieId) {
    return json({ error: "Watchlist ID and Movie ID are required" }, { status: 400 });
  }

  // Skip for popcorn and default - they have their own routes
  if (watchlistId === "popcorn" || watchlistId === "default") {
    return json({ error: "Use specific route for this watchlist" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { is_seen } = body;

  if (typeof is_seen !== "boolean") {
    return json({ error: "is_seen must be a boolean" }, { status: 400 });
  }

  try {
    const watchlistItem = await updateWatchlistItem(watchlistId, parseInt(movieId), { is_seen }, supabase);
    return json({ watchlistItem }, { headers });
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    return json({ error: "Failed to update watchlist item" }, { status: 500, headers });
  }
}

