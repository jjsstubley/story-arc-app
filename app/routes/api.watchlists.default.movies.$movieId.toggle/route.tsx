// app/routes/api/temp-watchlist.tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { toggleMovieInDefaultWatchlist } from "~/utils/services/supabase/watchlist-items.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { movieId }  = params
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  } 

  const watchlist = await toggleMovieInDefaultWatchlist(user.id, parseInt(movieId), supabase);

  return json({ watchlist }, { headers });
}

