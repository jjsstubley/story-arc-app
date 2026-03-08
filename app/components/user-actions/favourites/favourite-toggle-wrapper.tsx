"use client";

import { useEffect, useState } from "react";
import { getMovieWatchedStatus } from "../watched/helpers";
import FavouriteToggle from "./favourite-toggle";

interface FavouriteToggleWrapperProps {
  movieId: number;
  movieTitle: string;
}

export default function FavouriteToggleWrapper({ movieId, movieTitle }: FavouriteToggleWrapperProps) {
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
    return null;
  }

  return <FavouriteToggle movieId={movieId} movieTitle={movieTitle} isWatched={isWatched} />;
}



