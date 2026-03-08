"use client";

import { Box, VStack, Heading, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getMovieWatchedStatus } from "../watched/helpers";
import FavouriteToggle from "./favourite-toggle";

interface FavouriteSectionProps {
  movieId: number;
  movieTitle: string;
}

export default function FavouriteSection({ movieId, movieTitle }: FavouriteSectionProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWatchedStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const checkWatchedStatus = async () => {
    setLoading(true);
    const status = await getMovieWatchedStatus(movieId);
    setIsWatched(status.watched);
    setLoading(false);
  };

  if (loading) {
    return (
      <Box p={4}>
        <Heading size="sm">Loading...</Heading>
      </Box>
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

