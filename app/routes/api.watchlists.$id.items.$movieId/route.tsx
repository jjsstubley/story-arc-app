import { getWatchlistMembership, requireWatchlistIdParam, setWatchlistMembership } from "~/features/watchlists/index.server";
import { apiRoute, readJsonBody, requireIntParam } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const MEDIA_TYPES = ["movie", "tv"];

// "default" or a uuid; "popcorn" is served by api.watchlists.popcorn.items.$movieId
const route = apiRoute({
  GET: ({ params, user, supabase }) =>
    getWatchlistMembership(requireWatchlistIdParam(params), requireIntParam(params, "movieId"), user.id, supabase),

  PUT: async ({ request, params, user, supabase }) => {
    const watchlistId = requireWatchlistIdParam(params);
    const movieId = requireIntParam(params, "movieId");
    const { media_type: mediaType = "movie" } = await readJsonBody(request);
    if (typeof mediaType !== "string" || !MEDIA_TYPES.includes(mediaType)) {
      throw new ValidationError("media_type must be \"movie\" or \"tv\"", "INVALID_MEDIA_TYPE");
    }
    return setWatchlistMembership(watchlistId, movieId, true, mediaType, user.id, supabase);
  },

  DELETE: ({ params, user, supabase }) =>
    setWatchlistMembership(requireWatchlistIdParam(params), requireIntParam(params, "movieId"), false, "movie", user.id, supabase),
});

export const loader = route;
export const action = route;
