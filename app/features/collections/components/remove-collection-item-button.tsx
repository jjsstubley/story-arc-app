import { Button, Dialog, IconButton, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { useRemoveCollectionItem } from "../queries";

interface RemoveCollectionItemButtonProps {
  collectionId: string;
  movieId: number;
  movieTitle: string;
}

/** Asks for confirmation, then removes the movie optimistically */
export default function RemoveCollectionItemButton({ collectionId, movieId, movieTitle }: RemoveCollectionItemButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const removeItem = useRemoveCollectionItem(collectionId);

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
        aria-label={`Remove ${movieTitle} from this collection`}
      >
        <HiX />
      </IconButton>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)} role="alertdialog">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Remove movie</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                Remove &ldquo;{movieTitle}&rdquo; from this collection?
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={() => {
                    removeItem.mutate(movieId);
                    setDialogOpen(false);
                  }}
                >
                  Remove
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
