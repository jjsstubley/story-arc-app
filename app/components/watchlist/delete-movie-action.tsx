"use client"

import { Button, Dialog, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { useWatchlistContext } from "~/components/providers/watchlist-context";

interface DeleteMovieActionProps {
  movieId: number;
  movieTitle: string;
  watchlistId: string;
  isDefault: boolean;
  onDelete: () => void;
  isHovered: boolean;
}

export default function DeleteMovieAction({ 
  movieId, 
  movieTitle,
  watchlistId,
  isDefault,
  onDelete,
  isHovered 
}: DeleteMovieActionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateWatchlist } = useWatchlistContext();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const effectiveWatchlistId = isDefault ? "default" : watchlistId;
      // Use POST to toggle - since the movie is already in the watchlist, it will be removed
      const response = await fetch(`/api/watchlists/${effectiveWatchlistId}/movies/${movieId}/toggle`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ media_type: 'movie' })
      });
      
      if (response.ok) {
        updateWatchlist(effectiveWatchlistId);
        onDelete();
        setDialogOpen(false);
      } else {
        console.error("Failed to delete movie");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <IconButton
        variant="ghost"
        size="sm"
        colorPalette="red"
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
        aria-label="Delete movie"
        opacity={isHovered ? 1 : 0.5}
      >
        <HiX />
      </IconButton>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Remove Movie</Dialog.Header>
            <Dialog.Body>
              Are you sure you want to remove &quot;{movieTitle}&quot; from your watchlist?
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                colorPalette="red"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Remove
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}

