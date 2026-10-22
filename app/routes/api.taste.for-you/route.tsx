import { getForYouState, refreshForYouLists } from "~/features/taste/index.server";
import { apiRoute, readJsonBody } from "~/shared/api/route.server";

const route = apiRoute({
  GET: ({ user, supabase }) => getForYouState(user.id, supabase),

  // Regenerates the lists if they're out of date. Slow (an AI call plus TMDB lookups) when it does.
  POST: async ({ request, user, supabase }) => {
    const { manual } = await readJsonBody(request);
    return refreshForYouLists(user.id, { manual: manual === true }, supabase);
  },
});

export const loader = route;
export const action = route;
