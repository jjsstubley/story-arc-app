"use client";

import { useEffect, useState } from "react";
import { isMovieInAnyWatchlist } from "../watchlist/helpers";
import FavouriteToggle from "./favourite-toggle";

interface FavouriteToggleWrapperProps {
  movieId: number;
  movieTitle: string;
}

export default function FavouriteToggleWrapper({ movieId, movieTitle }: FavouriteToggleWrapperProps) {
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
    return null;
  }

  return <FavouriteToggle movieId={movieId} movieTitle={movieTitle} isInWatchlist={isInWatchlist} />;
}



