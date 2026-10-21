import { Button, Dialog, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { watchlistRef } from "../ids";
import { useSetWatchlistMembership } from "../queries";

interface RemoveFromWatchlistButtonProps {
  watchlist: { id: string; is_default: boolean };
  movieId: number;
  movieTitle: string;
  isHovered: boolean;
}

/** Row action that removes a movie from a watchlist after confirmation */
export default function RemoveFromWatchlistButton({ watchlist, movieId, movieTitle, isHovered }: RemoveFromWatchlistButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const setMembership = useSetWatchlistMembership(watchlistRef(watchlist), movieId);

  const handleRemove = () => {
    // The row disappears optimistically, and comes back with a toast if this fails
    setMembership.mutate(false);
    setDialogOpen(false);
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
        aria-label="Remove from watchlist"
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorPalette="red" onClick={handleRemove}>
                Remove
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
