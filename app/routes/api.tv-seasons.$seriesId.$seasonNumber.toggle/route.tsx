import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { toggleSeasonInSaved, isSeasonSaved } from "~/utils/services/supabase/tv-seasons.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const { seriesId, seasonNumber } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!seriesId || !seasonNumber) {
    return json({ error: "Series ID and Season Number are required" }, { status: 400 });
  }

  try {
    const exists = await isSeasonSaved(user.id, parseInt(seriesId), parseInt(seasonNumber), supabase);
    return json({ exists }, { headers });
  } catch (error: unknown) {
    console.error("Check TV season error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { seriesId, seasonNumber } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!seriesId || !seasonNumber) {
    return json({ error: "Series ID and Season Number are required" }, { status: 400 });
  }

  const method = request.method.toUpperCase();

  try {
    if (method === "POST") {
      await toggleSeasonInSaved(user.id, parseInt(seriesId), parseInt(seasonNumber), supabase);
      return json({ success: true }, { headers });
    } else if (method === "DELETE") {
      const { removeSeasonFromSaved } = await import("~/utils/services/supabase/tv-seasons.server");
      await removeSeasonFromSaved(user.id, parseInt(seriesId), parseInt(seasonNumber), supabase);
      return json({ success: true }, { headers });
    } else {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error: unknown) {
    console.error("Toggle TV season error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

