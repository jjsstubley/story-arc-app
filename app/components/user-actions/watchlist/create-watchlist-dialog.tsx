import { useState } from "react";
import { useNavigate } from "@remix-run/react";
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
import { useWatchlistContext } from "~/components/providers/watchlist-context";

interface CreateWatchlistDialogProps {
  movieId?: number;
  trigger: React.ReactNode;
}

export default function CreateWatchlistDialog({ movieId, trigger }: CreateWatchlistDialogProps) {
  const navigate = useNavigate();
  const { updateWatchlist } = useWatchlistContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Watchlist name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/watchlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          tags: tags.length > 0 ? tags : [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create watchlist");
      }

      const { watchlist } = await response.json();
      
      // If movieId is provided, add the movie to the new watchlist
      if (movieId && watchlist.id) {
        try {
          const addResponse = await fetch(`/api/watchlists/${watchlist.id}/movies/${movieId}/toggle`, {
            method: "POST",
          });
          
          if (addResponse.ok) {
            updateWatchlist(watchlist.id);
          }
        } catch (error) {
          console.error("Failed to add movie to watchlist:", error);
        }
      }

      setIsOpen(false);
      setName("");
      setDescription("");
      setTags([]);
    } catch (error) {
      console.error("Error creating watchlist:", error);
      alert(error instanceof Error ? error.message : "Failed to create watchlist");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen} size="md" motionPreset="slide-in-bottom">
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
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button 
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Creating..."
                colorScheme="orange"
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

