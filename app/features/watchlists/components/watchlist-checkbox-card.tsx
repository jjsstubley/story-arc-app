import { CheckboxCard, Skeleton } from "@chakra-ui/react";
import { InlineError } from "~/shared/ui/inline-error";
import { useSetWatchlistMembership, useWatchlistMembership } from "../queries";

interface WatchlistCheckboxCardProps {
  watchlistId: string;
  label: string;
  description: string;
  movieId: number;
  mediaType?: string;
  addon?: string;
}

/** Adds the movie to, or removes it from, one watchlist */
export default function WatchlistCheckboxCard({
  watchlistId,
  label,
  description,
  movieId,
  mediaType = "movie",
  addon,
}: WatchlistCheckboxCardProps) {
  const { data, isPending, error, refetch } = useWatchlistMembership(watchlistId, movieId);
  const setMembership = useSetWatchlistMembership(watchlistId, movieId, mediaType);

  if (isPending) return <Skeleton height={addon ? "96px" : "68px"} width="100%" rounded="md" />;
  if (error) return <InlineError fallback={`Couldn't load ${label}.`} error={error} onRetry={() => refetch()} />;

  return (
    <CheckboxCard.Root
      size="sm"
      width="100%"
      checked={data.inWatchlist}
      onCheckedChange={(details) => setMembership.mutate(details.checked === true)}
      onClick={(e) => e.stopPropagation()}
    >
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <CheckboxCard.Label>{label}</CheckboxCard.Label>
          <CheckboxCard.Description>{description}</CheckboxCard.Description>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
      {addon && <CheckboxCard.Addon>{addon}</CheckboxCard.Addon>}
    </CheckboxCard.Root>
  );
}
