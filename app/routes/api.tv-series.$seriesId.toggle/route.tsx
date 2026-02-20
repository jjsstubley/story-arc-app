import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { toggleSeriesInSaved, isSeriesSaved } from "~/utils/services/supabase/tv-series.server";
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
    return json({ exists }, { headers });
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

