import { Box, Heading, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useMovieWatched } from "~/features/watched";
import { InlineError } from "~/shared/ui/inline-error";
import { useMovieReviews } from "../queries";
import ReviewItem from "./review-item";
import UserReview from "./user-review";

interface ReviewsSectionProps {
  movieId: number;
}

/** Everyone's reviews for a movie; writing one requires the movie to be watched (enforced on the server too) */
export default function ReviewsSection({ movieId }: ReviewsSectionProps) {
  const watched = useMovieWatched(movieId);
  const { data, isPending, isError, error, refetch } = useMovieReviews(movieId);

  return (
    <VStack align="stretch" gap={4}>
      <Box>
        <Heading size="sm" mb={2}>Your Review</Heading>
        {watched.isPending ? (
          <Skeleton height="32" width="100%" rounded="md" />
        ) : watched.data?.watched ? (
          <UserReview movieId={movieId} />
        ) : (
          <Box p={4} bg="gray.800" rounded="md">
            <Text fontSize="sm" color="fg.muted">
              Mark this movie as watched to review it.
            </Text>
          </Box>
        )}
      </Box>

      <Box>
        <Heading size="sm" mb={4}>
          Reviews{data ? ` (${data.reviews.length})` : ""}
        </Heading>
        {isPending ? (
          <VStack align="stretch" gap={3}>
            <Skeleton height="24" rounded="md" />
            <Skeleton height="24" rounded="md" />
          </VStack>
        ) : isError ? (
          <InlineError fallback="Couldn't load reviews." error={error} onRetry={() => refetch()} />
        ) : data.reviews.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            No other reviews yet.
          </Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {data.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
