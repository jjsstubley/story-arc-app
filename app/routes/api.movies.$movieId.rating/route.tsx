import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { addOrUpdateRating, deleteRating, getUserRating } from "~/utils/services/supabase/ratings.server";
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

  const rating = await getUserRating(user.id, parseInt(movieId), supabase);

  return json({ rating }, { headers });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const method = request.method;
  const { movieId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  }

  const tmdbMovieId = parseInt(movieId);

  switch (method) {
    case "POST": {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, { status: 400 });
      }

      const { rating_percentage } = body;

      if (rating_percentage === undefined || rating_percentage === null) {
        return json({ error: "Rating percentage is required" }, { status: 400 });
      }

      try {
        const rating = await addOrUpdateRating(
          user.id,
          tmdbMovieId,
          rating_percentage,
          supabase
        );
        return json({ rating }, { status: 201, headers });
      } catch (error: unknown) {
        console.error("Add/update rating error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    case "DELETE": {
      try {
        await deleteRating(user.id, tmdbMovieId, supabase);
        return json({ success: true }, { status: 200, headers });
      } catch (error: unknown) {
        console.error("Delete rating error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
}

