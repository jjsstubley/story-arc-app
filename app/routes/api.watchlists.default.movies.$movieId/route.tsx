// app/routes/api/temp-watchlist.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { isMovieInWatchlist } from "~/utils/services/supabase/watchlist-items.server";
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


