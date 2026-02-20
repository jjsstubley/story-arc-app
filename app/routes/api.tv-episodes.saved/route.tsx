import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getUserSavedEpisodes } from "~/utils/services/supabase/tv-episodes.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const savedEpisodes = await getUserSavedEpisodes(user.id, supabase);
    return json({ savedEpisodes }, { headers });
  } catch (error: unknown) {
    console.error("Get saved TV episodes error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}

