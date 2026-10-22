import {
  deleteCollection,
  getCollectionWithMovies,
  parseCollectionFields,
  requireCollectionIdParam,
  updateCollection,
} from "~/features/collections/index.server";
import { apiRoute, publicApiRoute, readJsonBody } from "~/shared/api/route.server";

// Curated collections are public, so reading works signed out; changes need the owner
export const loader = publicApiRoute({
  GET: ({ params, user, supabase }) =>
    getCollectionWithMovies(requireCollectionIdParam(params), user?.id ?? null, supabase),
});

export const action = apiRoute({
  PATCH: async ({ request, params, user, supabase }) => {
    const id = requireCollectionIdParam(params);
    const updates = parseCollectionFields(await readJsonBody(request), { requireName: false });
    return updateCollection(id, user.id, updates, supabase);
  },

  DELETE: ({ params, user, supabase }) =>
    deleteCollection(requireCollectionIdParam(params), user.id, supabase),
});
