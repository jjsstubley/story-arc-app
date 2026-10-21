import { POPCORN_WATCHLIST_ID, useWatchlist } from "~/features/watchlists";
import { InlineError } from "~/shared/ui/inline-error";
import { WatchlistInterface } from "~/interfaces/watchlist";
import { SideBarWatchlist } from "./displays/sidebar-list";
import EmptyWatchlist from "./empty-watchlist";

export default function PopcornWatchlist({watchlist: initialWatchlist}: {watchlist: WatchlistInterface | null}) {
  const { data: watchlist, error, refetch } = useWatchlist(POPCORN_WATCHLIST_ID, { initialData: initialWatchlist });

  if (error) {
    return <InlineError fallback="Couldn't load your Popcorn List." error={error} onRetry={() => refetch()} />;
  }

  return watchlist?.watchlist_items.length ? (
    <SideBarWatchlist watchlist={watchlist} inDialog={true} filter='all' />
  ) : (
    <EmptyWatchlist title="The Popcorn List is empty" description="Add movies to your Popcorn List to get started." />
  );
}
