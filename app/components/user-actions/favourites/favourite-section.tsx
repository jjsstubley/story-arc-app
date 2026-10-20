"use client";

import { Box, VStack, Heading, Skeleton, Text } from "@chakra-ui/react";
import { useMovieWatched } from "~/features/watched";
import FavouriteToggle from "./favourite-toggle";

interface FavouriteSectionProps {
  movieId: number;
  movieTitle: string;
}

export default function FavouriteSection({ movieId, movieTitle }: FavouriteSectionProps) {
  const { data, isPending } = useMovieWatched(movieId);
  const isWatched = data?.watched ?? false;

  if (isPending) {
    return (
      <VStack align="stretch" gap={4}>
        <Heading size="sm">Favourites</Heading>
        <Skeleton height="10" width="100%" rounded="md" />
      </VStack>
    );
  }

  if (!isWatched) {
    return (
      <Box p={4} bg="gray.800" rounded="md">
        <Heading size="sm" mb={2}>Favourites</Heading>
        <Text fontSize="sm" color="fg.muted">
          Mark this movie as watched to add it to your favourites.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="sm">Favourites</Heading>
      <Box>
        <FavouriteToggle movieId={movieId} movieTitle={movieTitle} isWatched={isWatched} />
      </Box>
    </VStack>
  );
}

