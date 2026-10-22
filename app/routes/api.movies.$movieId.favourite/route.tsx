import { getFavouriteStatus, setFavourite } from "~/features/favourites/index.server";
import { apiRoute, readJsonBody, requireIntParam } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const route = apiRoute({
  GET: ({ params, user, supabase }) =>
    getFavouriteStatus(user.id, requireIntParam(params, "movieId"), supabase),

  POST: async ({ request, params, user, supabase }) => {
    const movieId = requireIntParam(params, "movieId");
    const { favourite } = await readJsonBody(request);
    if (typeof favourite !== "boolean") {
      throw new ValidationError("favourite must be a boolean", "INVALID_FAVOURITE");
    }
    return setFavourite(user.id, movieId, favourite, supabase);
  },
});

export const loader = route;
export const action = route;
