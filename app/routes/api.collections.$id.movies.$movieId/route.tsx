import {
  addMovieToCollection,
  isMovieInCollection,
  removeMovieFromCollection,
  requireCollectionIdParam,
  requireOwnedCollection,
} from "~/features/collections/index.server";
import { apiRoute, requireIntParam } from "~/shared/api/route.server";

const route = apiRoute({
  GET: async ({ params, user, supabase }) => {
    const id = requireCollectionIdParam(params);
    await requireOwnedCollection(id, user.id, supabase);
    return { inCollection: await isMovieInCollection(id, requireIntParam(params, "movieId"), supabase) };
  },

  POST: async ({ params, user, supabase }) => {
    const id = requireCollectionIdParam(params);
    await requireOwnedCollection(id, user.id, supabase);
    await addMovieToCollection(id, requireIntParam(params, "movieId"), supabase);
    return { inCollection: true };
  },

  DELETE: async ({ params, user, supabase }) => {
    const id = requireCollectionIdParam(params);
    await requireOwnedCollection(id, user.id, supabase);
    await removeMovieFromCollection(id, requireIntParam(params, "movieId"), supabase);
    return { inCollection: false };
  },
});

export const loader = route;
export const action = route;
