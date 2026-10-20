import { addOrUpdateRating, deleteRating, getUserRating } from "~/features/ratings/index.server";
import { apiRoute, readJsonBody, requireIntParam } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const route = apiRoute({
  GET: ({ params, user, supabase }) =>
    getUserRating(user.id, requireIntParam(params, "movieId"), supabase),

  POST: async ({ request, params, user, supabase }) => {
    const movieId = requireIntParam(params, "movieId");
    const { rating_percentage } = await readJsonBody(request);
    if (typeof rating_percentage !== "number") {
      throw new ValidationError("rating_percentage must be a number", "INVALID_RATING");
    }
    return addOrUpdateRating(user.id, movieId, rating_percentage, supabase);
  },

  DELETE: ({ params, user, supabase }) =>
    deleteRating(user.id, requireIntParam(params, "movieId"), supabase),
});

export const loader = route;
export const action = route;
