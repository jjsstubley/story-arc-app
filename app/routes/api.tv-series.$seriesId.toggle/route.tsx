import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { toggleSeriesInSaved, isSeriesSaved, updateTVSeriesItem } from "~/utils/services/supabase/tv-series.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const { seriesId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!seriesId) {
    return json({ error: "Series ID is required" }, { status: 400 });
  }

  try {
    const exists = await isSeriesSaved(user.id, parseInt(seriesId), supabase);
    
    // Get is_seen status if series exists
    let is_seen: boolean | null = null;
    let watchlistId: string | null = null;
    
    if (exists) {
      const { data, error } = await supabase
        .from("saved_tv_series")
        .select("is_seen, watchlist_id")
        .eq("user_id", user.id)
        .eq("tmdb_series_id", parseInt(seriesId))
        .maybeSingle();
      
      if (!error && data) {
        is_seen = data.is_seen ?? null;
        watchlistId = data.watchlist_id ?? null;
      }
    }
    
    return json({ exists, is_seen, watchlistId }, { headers });
  } catch (error: unknown) {
    console.error("Check TV series error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { seriesId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!seriesId) {
    return json({ error: "Series ID is required" }, { status: 400 });
  }

  const method = request.method.toUpperCase();

  try {
    // Check if request body contains is_seen update
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // If is_seen is provided, update the TV series item
    if (typeof body.is_seen === "boolean") {
      const updated = await updateTVSeriesItem(user.id, parseInt(seriesId), { is_seen: body.is_seen }, supabase);
      return json({ success: true, item: updated }, { headers });
    }

    // Otherwise, handle toggle
    if (method === "POST") {
      await toggleSeriesInSaved(user.id, parseInt(seriesId), supabase);
      return json({ success: true }, { headers });
    } else if (method === "DELETE") {
      const { removeSeriesFromSaved } = await import("~/utils/services/supabase/tv-series.server");
      await removeSeriesFromSaved(user.id, parseInt(seriesId), supabase);
      return json({ success: true }, { headers });
    } else {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error: unknown) {
    console.error("Toggle TV series error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

