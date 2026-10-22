import { createCollection, getUserCollections, parseCollectionFields, parseMovieIds } from "~/features/collections/index.server";
import { apiRoute, readJsonBody } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const route = apiRoute({
  GET: ({ user, supabase }) => getUserCollections(user.id, supabase),

  POST: async ({ request, user, supabase }) => {
    const body = await readJsonBody(request);
    const { name, description, tags } = parseCollectionFields(body, { requireName: true });
    const movieIds = parseMovieIds(body.movieIds);
    if (body.forkedFrom !== undefined && typeof body.forkedFrom !== "string") {
      throw new ValidationError("forkedFrom must be a collection id", "INVALID_FORKED_FROM");
    }
    return createCollection(
      user.id,
      { name: name!, description, tags, movieIds, forkedFrom: body.forkedFrom as string | undefined },
      supabase
    );
  },
});

export const loader = route;
export const action = route;
