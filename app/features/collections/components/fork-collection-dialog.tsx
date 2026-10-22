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
  HStack,
  Checkbox,
  SimpleGrid,
  Box,
  Text,
} from "@chakra-ui/react";
import MediaImage from "~/components/media/common/movie-image";
import { MAX_NAME_LENGTH } from "../limits";
import { useCreateCollection } from "../queries";
import type { CollectionWithMovies } from "../types";

interface ForkCollectionDialogProps {
  sourceCollection: CollectionWithMovies;
  trigger: React.ReactNode;
}

export default function ForkCollectionDialog({ sourceCollection, trigger }: ForkCollectionDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(sourceCollection.name || "");
  const [description, setDescription] = useState(sourceCollection.description || "");
  const tags = sourceCollection.tags ?? [];
  const [selectedMovieIds, setSelectedMovieIds] = useState<number[]>(
    sourceCollection.collection_items?.map(item => item.movie_id) || []
  );
  const createCollection = useCreateCollection();

  const handleMovieToggle = (movieId: number) => {
    setSelectedMovieIds(prev => 
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleSelectAll = () => {
    const allMovieIds = sourceCollection.collection_items?.map(item => item.movie_id) || [];
    if (selectedMovieIds.length === allMovieIds.length) {
      setSelectedMovieIds([]);
    } else {
      setSelectedMovieIds(allMovieIds);
    }
  };

  const handleSubmit = () => {
    createCollection.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        tags,
        movieIds: selectedMovieIds,
        forkedFrom: sourceCollection.id,
      },
      { onSuccess: (collection) => navigate(`/collections/${collection.id}`) }
    );
  };

  return (
    <Dialog.Root size="xl" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="90vh" overflowY="auto">
            <Dialog.Header>
              <Dialog.Title>Create Collection from Template</Dialog.Title>
              <Dialog.Description>
                Fork this collection and customize it with your own name, description, and movie selection.
              </Dialog.Description>
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
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="semibold">Movies</Text>
                  <HStack mb={2} justify="space-between">
                    <Text fontSize="xs" color="fg.muted">
                      {selectedMovieIds.length} of {sourceCollection.collection_items?.length || 0} selected
                    </Text>
                    <Button size="sm" variant="ghost" onClick={handleSelectAll}>
                      {selectedMovieIds.length === sourceCollection.collection_items?.length ? "Deselect All" : "Select All"}
                    </Button>
                  </HStack>
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={4} maxH="400px" overflowY="auto" p={2}>
                    {sourceCollection.collection_items?.map((item) => (
                      <Box
                        key={item.movie_id}
                        position="relative"
                        cursor="pointer"
                        onClick={() => handleMovieToggle(item.movie_id)}
                        border="2px solid"
                        borderColor={selectedMovieIds.includes(item.movie_id) ? "orange.500" : "transparent"}
                        rounded="md"
                        overflow="hidden"
                        _hover={{ borderColor: "orange.300" }}
                      >
                        <MediaImage
                          backdrop_path={item.movie?.backdrop_path ?? ""}
                          height="120px"
                        />
                        <Box
                          position="absolute"
                          top={2}
                          right={2}
                          bg="blackAlpha.700"
                          rounded="full"
                          p={1}
                        >
                          <Checkbox.Root
                            checked={selectedMovieIds.includes(item.movie_id)}
                            onCheckedChange={() => handleMovieToggle(item.movie_id)}
                            colorPalette="orange"
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                        </Box>
                        <Box p={2} bg="blackAlpha.800">
                          <Text fontSize="xs" fontWeight="semibold" lineClamp={2}>
                            {item.movie?.title ?? `Movie ${item.movie_id}`}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleSubmit}
                loading={createCollection.isPending}
                loadingText="Creating..."
                colorPalette="orange"
                disabled={!name.trim()}
              >
                Create Collection
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

