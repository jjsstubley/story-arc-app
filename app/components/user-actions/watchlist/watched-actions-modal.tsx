import { 
  Dialog, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  Box, 
  Portal,
  CloseButton,
  Heading
} from "@chakra-ui/react";
import { LuHeart, LuStar } from "react-icons/lu";
import { useState } from "react";
import FavouriteDialog from "../favourites/favourite-dialog";
import ReviewForm from "../reviews/review-form";
import RatingSelector from "../ratings/rating-selector";

interface MovieActionsDialogProps {
  children: React.ReactNode;
  movieId: number;
  movieTitle: string;
  isInWatchlist?: boolean;
  open?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
}

export default function MovieActionsDialog({
  children, 
  movieId, 
  movieTitle, 
  isInWatchlist = true,
  open: controlledOpen,
  onOpenChange
}: MovieActionsDialogProps) {
  const [favouriteDialogOpen, setFavouriteDialogOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const dialogOpen = controlledOpen !== undefined ? controlledOpen : internalDialogOpen;
  const setDialogOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange({ open });
    } else {
      setInternalDialogOpen(open);
    }
  };

  const handleFavouriteSuccess = () => {
    setFavouriteDialogOpen(false);
    setDialogOpen(false);
  };

  const handleReviewSuccess = () => {
    setReviewFormOpen(false);
    setDialogOpen(false);
  };

  const dialogContent = (
    <>
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
          {/* Rating Section */}
          <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
            <VStack align="start" gap={3}>
              <VStack align="start" gap={1}>
                <Heading size="sm">Rating</Heading>
                <Text fontSize="sm" color="gray.600">
                  Rate this movie
                </Text>
              </VStack>
              <Box width="100%">
                <RatingSelector movieId={movieId} />
              </Box>
            </VStack>
          </Box>

          {/* Favorites Section */}
          <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={1}>
                <Text fontWeight="semibold">Add to Favorites</Text>
                <Text fontSize="sm" color="gray.600">
                  Save this movie to your favorites list
                </Text>
              </VStack>
              <Button 
                variant="outline" 
                colorScheme="pink" 
                width="170px"
                onClick={() => setFavouriteDialogOpen(true)}
                disabled={!isInWatchlist}
              >
                <LuHeart color="pink" /> Add to Favorites
              </Button>
            </HStack>
          </Box>

          {/* Review Section */}
          <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
            <VStack align="start" gap={3}>
              <HStack justify="space-between" align="center" w="100%">
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold">Write a Review</Text>
                  <Text fontSize="sm" color="gray.600">
                    Rate and review this movie
                  </Text>
                </VStack>
                <Button 
                  width="170px"
                  onClick={() => setReviewFormOpen(true)}
                  disabled={!isInWatchlist}
                >
                  <LuStar /> Write Review
                </Button>
              </HStack>
              {reviewFormOpen && (
                <Box width="100%" mt={2}>
                  <ReviewForm 
                    movieId={movieId}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setReviewFormOpen(false)}
                    isInWatchlist={isInWatchlist || false}
                  />
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.ActionTrigger asChild>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
        </Dialog.ActionTrigger>
      </Dialog.Footer>
      <Dialog.CloseTrigger asChild>
        <CloseButton size="sm" />
      </Dialog.CloseTrigger>
    </>
  );

  return (
    <>
      {controlledOpen === undefined ? (
        <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)} size="lg">
          <Dialog.Trigger asChild>
            {children}
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                {dialogContent}
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      ) : (
        <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)} size="lg">
          {children}
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                {dialogContent}
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )}

      <FavouriteDialog
        movieId={movieId}
        movieTitle={movieTitle}
        open={favouriteDialogOpen}
        onOpenChange={setFavouriteDialogOpen}
        onSuccess={handleFavouriteSuccess}
      />
    </>
  );
}