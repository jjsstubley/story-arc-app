import { getTastePreferences, parseTastePreferences, updateTastePreferences } from "~/features/taste/index.server";
import { apiRoute, readJsonBody } from "~/shared/api/route.server";

const route = apiRoute({
  GET: ({ user, supabase }) => getTastePreferences(user.id, supabase),

  // Partial update: fields left out keep their saved value
  PATCH: async ({ request, user, supabase }) =>
    updateTastePreferences(user.id, parseTastePreferences(await readJsonBody(request)), supabase),
});

export const loader = route;
export const action = route;
