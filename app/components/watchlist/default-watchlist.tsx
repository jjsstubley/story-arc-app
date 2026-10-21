import { Skeleton, VStack } from "@chakra-ui/react";
import { DEFAULT_WATCHLIST_ID, useWatchlist } from "~/features/watchlists";
import { InlineError } from "~/shared/ui/inline-error";
import { SideBarWatchlist } from "./displays/sidebar-list";
import EmptyWatchlist from "./empty-watchlist";

export default function DefaultWatchlist({filter='all'}: {filter: string}) {
  const { data: watchlist, isPending, error, refetch } = useWatchlist(DEFAULT_WATCHLIST_ID);

  if (isPending) {
    return (
      <VStack gap={2} mt={4} align="stretch">
        {[0, 1, 2].map((row) => <Skeleton key={row} height="72px" rounded="md" />)}
      </VStack>
    );
  }

  if (error) {
    return <InlineError fallback="Couldn't load your watchlist." error={error} onRetry={() => refetch()} />;
  }

  if (watchlist.watchlist_items.length === 0) {
    return <EmptyWatchlist title="The Default List is empty" description="Add movies to your Default List to get started." />;
  }

  return <SideBarWatchlist watchlist={watchlist} inDialog={false} filter={filter} />;
}
