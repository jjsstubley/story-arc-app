import { Badge, Box, Button, Flex, Grid, Heading, Spinner, Text } from "@chakra-ui/react";
import { useSuggestionStream } from "~/hooks/use-suggestion-stream";
import MovieSearchItem from "../movieSearchItem";
import LoadingState from "./loading-state";
import ErrorState from "./error-state";
import EmptyState from "./empty-state";

interface SuggestionsResultsProps {
  stream: ReturnType<typeof useSuggestionStream>;
}

const SuggestionsResults = ({ stream }: SuggestionsResultsProps) => {
  const { status, query, title, cached, personalised, suggestions, error } = stream.state;

  // Error before anything arrived
  if (status === "error" && suggestions.length === 0) {
    return <ErrorState error={error ?? undefined} onRetry={stream.retry} />;
  }

  // Waiting for the first suggestion
  if (status === "streaming" && suggestions.length === 0) {
    return <LoadingState />;
  }

  // Empty results state
  if (suggestions.length === 0) {
    return status === "done"
      ? <EmptyState message="No recommendations found" query={query} />
      : <EmptyState query={query} />;
  }

  // Results (still filling in while streaming)
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Heading as="h4" fontSize="md" fontWeight="semibold">
          {title || "Suggestions"}
        </Heading>
        <Flex gap={3} alignItems="center">
          {personalised && (
            <Badge colorPalette="orange" variant="subtle">
              Personalised for you
            </Badge>
          )}
          {cached && (
            <Text fontSize="xs" color="fg.muted" fontStyle="italic">
              From cache
            </Text>
          )}
        </Flex>
      </Box>
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        {suggestions.map((item) => (
          <MovieSearchItem key={item.movie_id ?? `${item.rank}-${item.title}`} item={item} />
        ))}
      </Grid>

      <Flex justifyContent="center" alignItems="center" gap={3} py={6}>
        {status === "streaming" && (
          <>
            <Spinner size="sm" color="orange.500" />
            <Text fontSize="sm" color="fg.muted">Finding more recommendations...</Text>
          </>
        )}
        {status === "error" && (
          <>
            <Text fontSize="sm" color="red.400">{error}</Text>
            <Button size="sm" variant="outline" onClick={stream.retry}>Try again</Button>
          </>
        )}
        {status === "done" && (
          <Button colorPalette="orange" variant="outline" onClick={stream.loadMore}>
            More results
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default SuggestionsResults;
