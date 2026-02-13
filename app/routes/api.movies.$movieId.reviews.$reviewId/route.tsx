import { ActionFunctionArgs, json } from "@remix-run/node";
import { deleteReviewById, updateReviewById } from "~/utils/services/supabase/reviews.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const method = request.method;
  const { movieId, reviewId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!movieId || !reviewId) {
    return json({ error: "Movie ID and Review ID are required" }, { status: 400 });
  }

  switch (method) {
    case "PATCH": {
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
        const review = await updateReviewById(
          reviewId,
          user.id,
          review_text,
          supabase
        );
        return json({ review }, { status: 200, headers });
      } catch (error: unknown) {
        console.error("Update review error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return json({ error: message }, { status: 500 });
      }
    }
    case "DELETE": {
      try {
        await deleteReviewById(reviewId, user.id, supabase);
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

