// app/routes/api/temp-watchlist.tsx
import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { isMovieInWatchlist, updateWatchlistItem } from "~/utils/services/supabase/watchlist-items.server";
import { getOrCreateDefaultWatchlist } from "~/utils/services/supabase/watchlist.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { movieId } = params;

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const watchlist = await getOrCreateDefaultWatchlist(user.id, supabase);

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  }

  const isInWatchlist = await isMovieInWatchlist(watchlist.id, parseInt(movieId), supabase);

  return json({ exists: isInWatchlist }, { headers });
}


export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { movieId }  = params
  const supabase = getSupabaseServerClient(request, headers);
  const { is_seen, watchlistId } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  } 

  const watchlist = await updateWatchlistItem(watchlistId, parseInt(movieId), { is_seen }, supabase);

  return json({ watchlist }, { headers });
}


