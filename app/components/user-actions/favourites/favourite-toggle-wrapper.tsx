"use client";

import { useMovieWatched } from "~/features/watched";
import FavouriteToggle from "./favourite-toggle";

interface FavouriteToggleWrapperProps {
  movieId: number;
  movieTitle: string;
}

export default function FavouriteToggleWrapper({ movieId, movieTitle }: FavouriteToggleWrapperProps) {
  const { data, isPending } = useMovieWatched(movieId);

  if (isPending) {
    return null;
  }

  return <FavouriteToggle movieId={movieId} movieTitle={movieTitle} isWatched={data?.watched ?? false} />;
}
