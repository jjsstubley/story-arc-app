import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { addToFavourites, isFavourite, removeFromFavourites } from "~/utils/services/supabase/favourites.server";
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

  const isFav = await isFavourite(user.id, parseInt(movieId), supabase);

  return json({ isFavourite: isFav }, { headers });
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
        body = {};
      }

      const { rating_percentage, review_text } = body;

      try {
        const favourite = await addToFavourites(
          user.id,
          tmdbMovieId,
          supabase,
          {
            rating_percentage,
            review_text,
          }
        );
        return json({ favourite }, { status: 201, headers });
      } catch (error: unknown) {
        console.error("Add to favourites error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    case "DELETE": {
      try {
        await removeFromFavourites(user.id, tmdbMovieId, supabase);
        return json({ success: true }, { status: 200, headers });
      } catch (error: unknown) {
        console.error("Remove from favourites error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
}

