"use client"

import { Button, Dialog, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { HiX } from "react-icons/hi";

interface DeleteSeriesActionProps {
  seriesId: number;
  seriesName: string;
  onDelete: () => void;
  isHovered: boolean;
}

export default function DeleteSeriesAction({ 
  seriesId, 
  seriesName, 
  onDelete,
  isHovered 
}: DeleteSeriesActionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tv-series/${seriesId}/toggle`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        onDelete();
        setDialogOpen(false);
      } else {
        console.error("Failed to delete series");
      }
    } catch (error) {
      console.error("Error deleting series:", error);
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
        aria-label="Delete series"
        opacity={isHovered ? 1 : 0.5}
      >
        <HiX />
      </IconButton>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Remove TV Series</Dialog.Header>
            <Dialog.Body>
              Are you sure you want to remove &quot;{seriesName}&quot; from your saved TV series?
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

