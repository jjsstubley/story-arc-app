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
import { CollectionsInterface } from "~/interfaces/collections";
import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { Combobox } from "@chakra-ui/react";

interface EditCollectionDialogProps {
  collection: CollectionsInterface;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export default function EditCollectionDialog({ collection, trigger, onSuccess }: EditCollectionDialogProps) {
  const revalidator = useRevalidator();
  const { updateWatchlist } = useWatchlistContext();
  const [name, setName] = useState(collection.name || "");
  const [description, setDescription] = useState(collection.description || "");
  const [tags, setTags] = useState<string[]>(collection.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Update local state when collection changes or dialog opens
  useEffect(() => {
    if (collection && isOpen) {
      setName(collection.name || "");
      setDescription(collection.description || "");
      setTags(collection.tags || []);
    }
  }, [collection, isOpen]);

  const handleKeywordSelect = (details: Combobox.ValueChangeDetails | null) => {
    if (details) {
      setTags(details.value || []);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Collection name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
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
        throw new Error(error.error || "Failed to update collection");
      }

      const { collection: updatedCollection } = await response.json();
      
      updateWatchlist(collection.id);
      revalidator.revalidate();
      onSuccess?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating collection:", error);
      alert(error instanceof Error ? error.message : "Failed to update collection");
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
              <Dialog.Title>Edit Collection</Dialog.Title>
              <Dialog.Description>
                Update your collection details.
              </Dialog.Description>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Collection Name *</Text>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter collection name"
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Description</Text>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter collection description"
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
                isLoading={isSubmitting}
                loadingText="Updating..."
                colorScheme="orange"
              >
                Update Collection
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

