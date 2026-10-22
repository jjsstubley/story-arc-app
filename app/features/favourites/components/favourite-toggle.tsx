"use client";

import { IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useMovieWatched } from "~/features/watched";
import { useFavourite, useSetFavourite } from "../queries";
import FavouriteDialog from "./favourite-dialog";

interface FavouriteToggleProps {
  movieId: number;
  movieTitle: string;
}

/** Heart button; hidden until the movie is watched, since only watched movies can be favourited */
export default function FavouriteToggle({ movieId, movieTitle }: FavouriteToggleProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const watched = useMovieWatched(movieId);
  const isWatched = watched.data?.watched ?? false;
  const { data } = useFavourite(movieId, { enabled: isWatched });
  const setFavourite = useSetFavourite(movieId);
  const isFavourite = data?.favourite ?? false;

  if (!isWatched) return null;

  return (
    <>
      <IconButton
        variant="subtle"
        border="1px solid"
        borderColor="whiteAlpha.300"
        rounded="full"
        onClick={() => (isFavourite ? setFavourite.mutate(false) : setDialogOpen(true))}
        disabled={!data}
        aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
      >
        {isFavourite ? (
          <Text color="red">
            <GoHeartFill size={28} />
          </Text>
        ) : (
          <Text>
            <GoHeart size={28} />
          </Text>
        )}
      </IconButton>
      <FavouriteDialog movieId={movieId} movieTitle={movieTitle} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
