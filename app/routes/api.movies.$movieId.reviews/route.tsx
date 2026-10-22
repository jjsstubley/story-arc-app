import { deleteReview, getMovieReviews, saveReview } from "~/features/reviews/index.server";
import { apiRoute, publicApiRoute, readJsonBody, requireIntParam } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

// Reviews are public, so reading works signed out; writing needs an account
export const loader = publicApiRoute({
  GET: ({ params, user, supabase }) =>
    getMovieReviews(requireIntParam(params, "movieId"), user?.id ?? null, supabase),
});

export const action = apiRoute({
  POST: async ({ request, params, user, supabase }) => {
    const movieId = requireIntParam(params, "movieId");
    const { review_text } = await readJsonBody(request);
    if (typeof review_text !== "string") {
      throw new ValidationError("review_text must be a string", "INVALID_REVIEW");
    }
    return saveReview(user.id, movieId, review_text, supabase);
  },

  DELETE: ({ params, user, supabase }) =>
    deleteReview(user.id, requireIntParam(params, "movieId"), supabase),
});
