// app/routes/api/temp-watchlist.tsx
import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { createDefaultWatchlist, createWatchlist, getAllWatchlists } from "~/utils/services/supabase/watchlist.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";


// LOADER
export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await getAllWatchlists(user.id, supabase);

  return json({ watchlist }, { headers });
}

// ACTIONS
export async function action({ request }: ActionFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, tags } = body;

  if (!name) {
    const defaultWatchlist = createDefaultWatchlist(user.id, supabase);
    return json({ watchlist: defaultWatchlist }, { status: 201, headers });
  }

  try {
    const newWatchlist = await createWatchlist(
      {
        user_id: user.id,
        name,
        description,
        tags,
      },
      supabase
    );

    return json({ watchlist: newWatchlist }, { status: 201, headers });
  } catch (error: unknown) {
    console.error("Create Watchlist Error:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, { status: 500 });
  }
}
