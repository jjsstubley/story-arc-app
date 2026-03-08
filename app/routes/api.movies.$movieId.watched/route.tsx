import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { getWatchedMovie, addWatchedMovie, removeWatchedMovie } from "~/utils/services/supabase/user-watched-movies.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { movieId } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  }

  const row = await getWatchedMovie(user.id, parseInt(movieId), supabase);
  return json(
    {
      watched: Boolean(row),
      watched_at: row?.watched_at ?? undefined,
    },
    { headers }
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { movieId } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  }

  let body: { watched?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const watched = body.watched;
  if (typeof watched !== "boolean") {
    return json({ error: "watched must be a boolean" }, { status: 400 });
  }

  const tmdbMovieId = parseInt(movieId);
  if (watched) {
    await addWatchedMovie(user.id, tmdbMovieId, supabase);
  } else {
    await removeWatchedMovie(user.id, tmdbMovieId, supabase);
  }

  const row = await getWatchedMovie(user.id, tmdbMovieId, supabase);
  return json(
    {
      watched: Boolean(row),
      watched_at: row?.watched_at ?? undefined,
    },
    { headers }
  );
}
