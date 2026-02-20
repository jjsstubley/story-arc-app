import { json, type ActionFunctionArgs } from "@remix-run/node";
import { toggleMovieInWatchlist } from "~/utils/services/supabase/watchlist-items.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { id: watchlistId, movieId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

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

  // Get media_type from request body if provided, default to 'movie'
  let body;
  let mediaType = 'movie';
  try {
    body = await request.json().catch(() => ({}));
    mediaType = body.media_type || 'movie';
  } catch {
    // No body provided, use default
  }

  try {
    await toggleMovieInWatchlist(watchlistId, parseInt(movieId), user.id, supabase, mediaType);
    return json({ success: true }, { headers });
  } catch (error: unknown) {
    console.error("Toggle watchlist error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

