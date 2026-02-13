"use client";

import { Box, VStack, Heading, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { isMovieInAnyWatchlist } from "../watchlist/helpers";
import FavouriteToggle from "./favourite-toggle";

interface FavouriteSectionProps {
  movieId: number;
  movieTitle: string;
}

export default function FavouriteSection({ movieId, movieTitle }: FavouriteSectionProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWatchlistStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const checkWatchlistStatus = async () => {
    setLoading(true);
    const inWatchlist = await isMovieInAnyWatchlist(movieId);
    setIsInWatchlist(inWatchlist);
    setLoading(false);
  };

  if (loading) {
    return (
      <Box p={4}>
        <Heading size="sm">Loading...</Heading>
      </Box>
    );
  }

  if (!isInWatchlist) {
    return (
      <Box p={4} bg="gray.800" rounded="md">
        <Heading size="sm" mb={2}>Favourites</Heading>
        <Text fontSize="sm" color="fg.muted">
          Add this movie to a watchlist to mark it as a favourite.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="sm">Favourites</Heading>
      <Box>
        <FavouriteToggle movieId={movieId} movieTitle={movieTitle} isInWatchlist={isInWatchlist} />
      </Box>
    </VStack>
  );
}

