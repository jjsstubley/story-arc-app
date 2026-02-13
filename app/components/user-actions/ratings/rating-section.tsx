"use client";

import { Box, Heading, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { isMovieInAnyWatchlist } from "../watchlist/helpers";
import RatingSelector from "./rating-selector";

interface RatingSectionProps {
  movieId: number;
}

export default function RatingSection({ movieId }: RatingSectionProps) {
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
        <Heading size="sm" mb={2}>Rating</Heading>
        <Text fontSize="sm" color="fg.muted">
          Add this movie to a watchlist to rate it.
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

