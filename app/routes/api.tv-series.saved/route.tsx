import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getUserSavedSeries } from "~/utils/services/supabase/tv-series.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const savedSeries = await getUserSavedSeries(user.id, supabase);
    return json({ savedSeries }, { headers });
  } catch (error: unknown) {
    console.error("Get saved TV series error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

