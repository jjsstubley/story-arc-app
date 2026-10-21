import { VStack, Separator, Heading, Button, Skeleton } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { isAppError } from "~/shared/errors";
import { InlineError } from "~/shared/ui/inline-error";
import { DEFAULT_WATCHLIST_ID, POPCORN_WATCHLIST_ID } from "../ids";
import { useWatchlists } from "../queries";
import CreateWatchlistDialog from "./create-watchlist-dialog";
import WatchlistCheckboxCard from "./watchlist-checkbox-card";

interface WatchlistPickerProps {
  movieId: number;
  mediaType?: string;
  /** Extra signed-in-only options shown under the lists (e.g. saving a TV series) */
  children?: ReactNode;
}

/** Checkboxes for every watchlist the movie can be added to */
export default function WatchlistPicker({ movieId, mediaType = "movie", children }: WatchlistPickerProps) {
  const { data: watchlists, isPending, error, refetch } = useWatchlists();
  // Signed-out users only get the cookie-based popcorn list
  const isSignedOut = isAppError(error) && error.status === 401;

  return (
    <VStack align="start" gap={4}>
      <WatchlistCheckboxCard
        watchlistId={POPCORN_WATCHLIST_ID}
        label="Popcorn List"
        description="A quick list of movies you&apos;re in the mood to watch — perfect for tonight&apos;s lineup."
        movieId={movieId}
        mediaType={mediaType}
        addon="Expires in 2 days"
      />
      {isPending ? (
        <Skeleton height="180px" width="100%" rounded="md" />
      ) : isSignedOut ? null : error ? (
        <InlineError fallback="Couldn't load your watchlists." error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <WatchlistCheckboxCard
            watchlistId={DEFAULT_WATCHLIST_ID}
            label="Keep it for later"
            description="Default Watchlist"
            movieId={movieId}
            mediaType={mediaType}
          />
          <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%" />
          <Heading fontSize="sm" fontWeight="bold">Add to other lists:</Heading>
          {watchlists
            .filter((watchlist) => !watchlist.is_default)
            .map((watchlist) => (
              <WatchlistCheckboxCard
                key={watchlist.id}
                watchlistId={watchlist.id}
                label={watchlist.name}
                description={watchlist.descriptions || watchlist.name}
                movieId={movieId}
                mediaType={mediaType}
              />
            ))}
          <CreateWatchlistDialog
            movieId={movieId}
            mediaType={mediaType}
            trigger={
              <Button variant="solid" width="100%">
                Create new list
              </Button>
            }
          />
          {children}
        </>
      )}
    </VStack>
  );
}
