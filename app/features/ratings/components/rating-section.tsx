"use client";

import { Box, Heading, Skeleton, Text } from "@chakra-ui/react";
import { useMovieWatched } from "~/features/watched";
import RatingSelector from "./rating-selector";

interface RatingSectionProps {
  movieId: number;
}

/** Rating is only allowed once the movie is watched (enforced on the server too) */
export default function RatingSection({ movieId }: RatingSectionProps) {
  const { data, isPending } = useMovieWatched(movieId);

  if (isPending) {
    return (
      <Box>
        <Heading size="sm" mb={4}>Rating</Heading>
        <Skeleton height="10" width="100%" rounded="md" />
      </Box>
    );
  }

  if (!data?.watched) {
    return (
      <Box p={4} bg="gray.800" rounded="md">
        <Heading size="sm" mb={2}>Rating</Heading>
        <Text fontSize="sm" color="fg.muted">
          Mark this movie as watched to rate it.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="sm" mb={4}>Rating</Heading>
      <RatingSelector movieId={movieId} />
    </Box>
  );
}
