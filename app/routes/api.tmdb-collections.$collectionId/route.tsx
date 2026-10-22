import { publicApiRoute, requireIntParam } from "~/shared/api/route.server";
import { getTmdbCollectionById } from "~/utils/services/external/tmdb/collections";

// A TMDB film series (e.g. "The Matrix Collection"), not a user collection.
// Lives outside /api/collections so it can't shadow /api/collections/:id.
export const loader = publicApiRoute({
  GET: ({ params }) => getTmdbCollectionById({ collection_id: requireIntParam(params, "collectionId") }),
});
