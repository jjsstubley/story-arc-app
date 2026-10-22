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
  Text,
  type Combobox,
} from "@chakra-ui/react";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "../limits";
import { useUpdateCollection } from "../queries";
import type { Collection } from "../types";
import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { InsideModal } from "~/shared/ui/portal-context";

interface EditCollectionDialogProps {
  collection: Collection;
  trigger: React.ReactNode;
}

export default function EditCollectionDialog({ collection, trigger }: EditCollectionDialogProps) {
  const updateCollection = useUpdateCollection(collection.id);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [tags, setTags] = useState<string[]>(collection.tags ?? []);
  const [isOpen, setIsOpen] = useState(false);

  // Start each edit from the saved values, not a previously abandoned draft
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setName(collection.name);
      setDescription(collection.description ?? "");
      setTags(collection.tags ?? []);
    }
    setIsOpen(open);
  };

  const handleKeywordSelect = (details: Combobox.ValueChangeDetails | null) => {
    if (details) {
      setTags(details.value || []);
    }
  };

  // Optimistic: the page shows the new details straight away and rolls back with a toast on failure
  const handleSubmit = () => {
    updateCollection.mutate({ name: name.trim(), description: description.trim() || null, tags });
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => handleOpenChange(e.open)} size="md" motionPreset="slide-in-bottom">
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
                    maxLength={MAX_NAME_LENGTH}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Description</Text>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter collection description"
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Keywords</Text>
                  {/* The dropdown must render inside the modal to be clickable */}
                  <InsideModal>
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
                  </InsideModal>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} colorPalette="orange" disabled={!name.trim()}>
                Update Collection
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

