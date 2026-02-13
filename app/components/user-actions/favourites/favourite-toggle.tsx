import { IconButton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { checkFavourite, removeFromFavourites } from "./services";
import FavouriteDialog from "./favourite-dialog";

interface FavouriteToggleProps {
  movieId: number;
  movieTitle: string;
  isInWatchlist: boolean;
}

export default function FavouriteToggle({ movieId, movieTitle, isInWatchlist }: FavouriteToggleProps) {
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isInWatchlist) {
      loadFavouriteStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, isInWatchlist]);

  const loadFavouriteStatus = async () => {
    const fav = await checkFavourite(movieId);
    setIsFavourite(fav);
  };

  const handleToggle = async () => {
    if (!isInWatchlist) {
      return; // Don't allow if not in watchlist
    }

    if (isFavourite) {
      // Remove from favourites
      setLoading(true);
      const success = await removeFromFavourites(movieId);
      if (success) {
        setIsFavourite(false);
      }
      setLoading(false);
    } else {
      // Open dialog to add to favourites
      setDialogOpen(true);
    }
  };

  const handleDialogSuccess = () => {
    setIsFavourite(true);
    loadFavouriteStatus();
  };

  if (!isInWatchlist) {
    return null; // Don't show if not in watchlist
  }

  return (
    <>
      <IconButton
        variant="subtle"
        border="1px solid"
        borderColor="whiteAlpha.300"
        rounded="full"
        onClick={handleToggle}
        disabled={loading}
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
      <FavouriteDialog
        movieId={movieId}
        movieTitle={movieTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}

