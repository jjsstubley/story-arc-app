import { getTastePreferences, parseTastePreferences, saveTastePreferences } from "~/features/taste/index.server";
import { apiRoute, readJsonBody } from "~/shared/api/route.server";

const route = apiRoute({
  GET: ({ user, supabase }) => getTastePreferences(user.id, supabase),

  PUT: async ({ request, user, supabase }) =>
    saveTastePreferences(user.id, parseTastePreferences(await readJsonBody(request)), supabase),
});

export const loader = route;
export const action = route;
