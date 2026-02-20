import { Box, Grid, Heading, Text } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";
import MovieSearchItem from "../movieSearchItem";
import LoadingState from "./loading-state";
import ErrorState from "./error-state";
import EmptyState from "./empty-state";

interface SuggestionsResultsProps {
  fetcher: ReturnType<typeof useFetcher<SuggestionsDataInterface>>;
  query?: string;
}

const SuggestionsResults = ({ fetcher, query }: SuggestionsResultsProps) => {
  // Loading state
  if (fetcher.state === "loading" || fetcher.state === "submitting") {
    return <LoadingState />;
  }

  // Error state
  if (fetcher.data?.error) {
    return (
      <ErrorState
        error={fetcher.data.error}
        onRetry={() => {
          // Retry logic would be handled by the parent component
          // This is just for display
        }}
      />
    );
  }

  // No data state
  if (!fetcher.data?.result) {
    return <EmptyState query={query} />;
  }

  const suggestions = fetcher.data.result.suggestions || [];

  // Empty results state
  if (suggestions.length === 0) {
    return (
      <EmptyState
        message="No recommendations found"
        query={query}
      />
    );
  }

  // Success state with results
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Heading as="h4" fontSize="md" fontWeight="semibold">
          {fetcher.data.result.title || "Suggestions"}
        </Heading>
        {fetcher.data.cached && (
          <Text fontSize="xs" color="fg.muted" fontStyle="italic">
            From cache
          </Text>
        )}
      </Box>
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        {suggestions.map((item, index) => (
          <MovieSearchItem key={item.tmdbData?.id || index} item={item} />
        ))}
      </Grid>
    </Box>
  );
};

export default SuggestionsResults;