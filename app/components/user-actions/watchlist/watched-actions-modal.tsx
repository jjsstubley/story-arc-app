import { Box, Button, CloseButton, Dialog, Heading, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import { LuHeart } from "react-icons/lu";
import { useFavourite, useSetFavourite } from "~/features/favourites";
import { RatingSelector } from "~/features/ratings";
import { UserReview } from "~/features/reviews";

interface MovieActionsDialogProps {
  children?: React.ReactNode;
  movieId: number;
  movieTitle: string;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

/** Shown right after a movie is marked watched: rate, favourite and review it in one place */
export default function MovieActionsDialog({ children, movieId, movieTitle, open, onOpenChange }: MovieActionsDialogProps) {
  const favourite = useFavourite(movieId, { enabled: open });
  const setFavourite = useSetFavourite(movieId);
  const isFavourite = favourite.data?.favourite ?? false;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange({ open: e.open })} size="lg">
      {children}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <VStack align="start" gap={1}>
                <Dialog.Title>Share your thoughts or add to your favorites</Dialog.Title>
                <Dialog.Description>
                  Rate, review, or add <strong>{movieTitle}</strong> to your favorites
                </Dialog.Description>
              </VStack>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
                  <VStack align="start" gap={3}>
                    <VStack align="start" gap={1}>
                      <Heading size="sm">Rating</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Rate this movie
                      </Text>
                    </VStack>
                    <Box width="100%">
                      <RatingSelector movieId={movieId} portalled={false} />
                    </Box>
                  </VStack>
                </Box>

                <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
                  <HStack justify="space-between" align="center">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="semibold">Favorites</Text>
                      <Text fontSize="sm" color="gray.600">
                        Save this movie to your favorites list
                      </Text>
                    </VStack>
                    <Button
                      variant={isFavourite ? "solid" : "outline"}
                      colorPalette="pink"
                      width="170px"
                      onClick={() => setFavourite.mutate(!isFavourite)}
                      disabled={!favourite.data}
                    >
                      <LuHeart /> {isFavourite ? "In Favorites" : "Add to Favorites"}
                    </Button>
                  </HStack>
                </Box>

                <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
                  <VStack align="start" gap={3}>
                    <VStack align="start" gap={1}>
                      <Text fontWeight="semibold">Review</Text>
                      <Text fontSize="sm" color="gray.600">
                        Write a review for this movie
                      </Text>
                    </VStack>
                    <Box width="100%">
                      <UserReview movieId={movieId} />
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </Dialog.ActionTrigger>
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
