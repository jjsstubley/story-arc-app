import { createWatchlist, getWatchlistSummaries } from "~/features/watchlists/index.server";
import type { WatchlistSummary } from "~/features/watchlists";
import { apiRoute, readJsonBody } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const route = apiRoute({
  GET: ({ user, supabase }) => getWatchlistSummaries(user.id, supabase),

  POST: async ({ request, user, supabase }) => {
    const { name, description } = await readJsonBody(request);
    if (typeof name !== "string" || !name.trim()) {
      throw new ValidationError("Give your watchlist a name.", "NAME_REQUIRED");
    }
    if (description != null && typeof description !== "string") {
      throw new ValidationError("Description must be text.", "INVALID_DESCRIPTION");
    }

    const watchlist = await createWatchlist(
      { user_id: user.id, name: name.trim(), description: description?.trim() || undefined },
      supabase
    );
    return { ...watchlist, item_count: 0 } satisfies WatchlistSummary;
  },
});

export const loader = route;
export const action = route;
