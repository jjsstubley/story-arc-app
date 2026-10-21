import type { WatchlistInterface } from "~/interfaces/watchlist";

/** Whether a movie is in a given watchlist */
export interface WatchlistMembership {
  inWatchlist: boolean;
}

/** A `watchlists` row without its items, plus how many items it holds */
export type WatchlistSummary = Omit<WatchlistInterface, "watchlist_items"> & { item_count: number };

export interface CreateWatchlistInput {
  name: string;
  description?: string | null;
}
