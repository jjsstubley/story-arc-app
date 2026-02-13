import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { createOrUpdateReview, deleteReview, getMovieReviews, getUserReview } from "~/utils/services/supabase/reviews.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { movieId } = params;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: { user } } = await supabase.auth.getUser();

  if (!movieId) {
    return json({ error: "Movie ID is required" }, { status: 400 });
  }

  const reviews = await getMovieReviews(parseInt(movieId), supabase, limit, offset);
  
  // Also get user's own review if authenticated
  let userReview = null;
  if (user) {
    userReview = await getUserReview(user.id, parseInt(movieId), supabase);
  }

  return json({ reviews, userReview }, { headers });
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

      const { review_text } = body;

      if (!review_text || review_text.trim().length === 0) {
        return json({ error: "Review text is required" }, { status: 400 });
      }

      try {
        const review = await createOrUpdateReview(
          user.id,
          tmdbMovieId,
          review_text,
          supabase
        );
        return json({ review }, { status: 201, headers });
      } catch (error: unknown) {
        console.error("Create/update review error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    case "DELETE": {
      try {
        await deleteReview(user.id, tmdbMovieId, supabase);
        return json({ success: true }, { status: 200, headers });
      } catch (error: unknown) {
        console.error("Delete review error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
}

