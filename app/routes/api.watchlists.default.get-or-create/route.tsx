// app/routes/api/temp-watchlist.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getOrCreateDefaultWatchlist } from "~/utils/services/supabase/watchlist.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await getOrCreateDefaultWatchlist(user.id, supabase);

  return json({ watchlist }, { headers });
}
