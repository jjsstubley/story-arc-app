import { getMovieWatchedStatus, setMovieWatched } from "~/features/watched/index.server";
import { apiRoute, readJsonBody, requireIntParam } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const route = apiRoute({
  GET: ({ params, user, supabase }) =>
    getMovieWatchedStatus(user.id, requireIntParam(params, "movieId"), supabase),

  POST: async ({ request, params, user, supabase }) => {
    const movieId = requireIntParam(params, "movieId");
    const { watched } = await readJsonBody(request);
    if (typeof watched !== "boolean") {
      throw new ValidationError("watched must be a boolean", "INVALID_WATCHED");
    }
    return setMovieWatched(user.id, movieId, watched, supabase);
  },
});

export const loader = route;
export const action = route;
