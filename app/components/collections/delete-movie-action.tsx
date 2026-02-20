"use client"

import { Button, Dialog, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { useWatchlistContext } from "~/components/providers/watchlist-context";

interface DeleteCollectionItemActionProps {
  movieId: number;
  movieTitle: string;
  collectionId: string;
  onDelete: () => void;
  isHovered: boolean;
}

export default function DeleteCollectionItemAction({ 
  movieId, 
  movieTitle,
  collectionId,
  onDelete,
  isHovered 
}: DeleteCollectionItemActionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateWatchlist } = useWatchlistContext();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}/movies/${movieId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        updateWatchlist(collectionId);
        onDelete();
        setDialogOpen(false);
      } else {
        console.error("Failed to delete movie from collection");
      }
    } catch (error) {
      console.error("Error deleting movie from collection:", error);
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
              Are you sure you want to remove &quot;{movieTitle}&quot; from this collection?
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

