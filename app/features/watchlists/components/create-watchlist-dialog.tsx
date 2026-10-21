import { useState } from "react";
import {
  Button,
  Dialog,
  Portal,
  CloseButton,
  Input,
  Textarea,
  VStack,
  Box,
  Text
} from "@chakra-ui/react";
import { useCreateWatchlist } from "../queries";

interface CreateWatchlistDialogProps {
  /** Added to the new list once it's created */
  movieId?: number;
  mediaType?: string;
  trigger: React.ReactNode;
}

export default function CreateWatchlistDialog({ movieId, mediaType = "movie", trigger }: CreateWatchlistDialogProps) {
  const createWatchlist = useCreateWatchlist();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    createWatchlist.mutate(
      { name: name.trim(), description: description.trim() || null, movieId, mediaType },
      {
        onSuccess: () => {
          setIsOpen(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)} size="md" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="90vh" overflowY="auto">
            <Dialog.Header>
              <Dialog.Title>Create New Watchlist</Dialog.Title>
              <Dialog.Description>
                Create a new watchlist to organize your movies.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Watchlist Name *</Text>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter watchlist name"
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Description</Text>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter watchlist description"
                    rows={3}
                  />
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                loading={createWatchlist.isPending}
                loadingText="Creating..."
                colorPalette="orange"
              >
                Create Watchlist
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
