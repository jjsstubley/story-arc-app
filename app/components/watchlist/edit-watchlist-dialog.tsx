import { useState, useEffect } from "react";
import { useRevalidator } from "@remix-run/react";
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
import { WatchlistInterface } from "~/interfaces/watchlist";
import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { Combobox } from "@chakra-ui/react";

interface EditWatchlistDialogProps {
  watchlist: WatchlistInterface;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export default function EditWatchlistDialog({ watchlist, trigger, onSuccess }: EditWatchlistDialogProps) {
  const revalidator = useRevalidator();
  const { updateWatchlist } = useWatchlistContext();
  const [name, setName] = useState(watchlist.name || "");
  const [description, setDescription] = useState(watchlist.descriptions || "");
  const [tags, setTags] = useState<string[]>(watchlist.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Update local state when watchlist changes or dialog opens
  useEffect(() => {
    if (watchlist && isOpen) {
      setName(watchlist.name || "");
      setDescription(watchlist.descriptions || "");
      setTags(watchlist.tags || []);
    }
  }, [watchlist, isOpen]);

  const handleKeywordSelect = (details: Combobox.ValueChangeDetails | null) => {
    if (details) {
      setTags(details.value || []);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Watchlist name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/watchlists/${watchlist.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          tags: tags.length > 0 ? tags : [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update watchlist");
      }

      // const { watchlist: updatedWatchlist } = await response.json();
      updateWatchlist(watchlist.id);
      revalidator.revalidate();
      onSuccess?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      alert(error instanceof Error ? error.message : "Failed to update watchlist");
    } finally {
      setIsSubmitting(false);
    }
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
              <Dialog.Title>Edit Watchlist</Dialog.Title>
              <Dialog.Description>
                Update your watchlist details.
              </Dialog.Description>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
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

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Keywords</Text>
                  <AsyncMultipleCombobox 
                    suggestions={[]} 
                    onSelect={handleKeywordSelect} 
                    startElement="" 
                    fetchUrl="/api/keywords" 
                    placeholder="Add keywords" 
                    defaultOpen={false} 
                    colorPalette="orange" 
                    defaultTags={tags}
                  >
                    {(item) => {
                      return (
                        <Box display="flex" justifyItems="space-between" width="100%" alignItems="center">
                          <Box
                            p={2}
                            display="flex"
                            flexDirection="column"
                            rounded="md"
                            width="100%"
                            color="white"
                            cursor="pointer"
                          >
                            <strong>{item.name}</strong>
                          </Box>
                        </Box>
                      );
                    }}
                  </AsyncMultipleCombobox>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Updating..."
                colorScheme="orange"
              >
                Update Watchlist
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

