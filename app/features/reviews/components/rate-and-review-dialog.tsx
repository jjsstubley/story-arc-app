"use client";

import { Box, Button, CloseButton, Dialog, Heading, Portal, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { RatingSelector } from "~/features/ratings";
import { useMovieWatched, useSetMovieWatched } from "~/features/watched";
import UserReview from "./user-review";

interface RateAndReviewDialogProps {
  children: React.ReactNode;
  movieId: number;
  movieTitle: string;
}

/** Rate and review a movie, offering to mark it watched first if needed */
export default function RateAndReviewDialog({ children, movieId, movieTitle }: RateAndReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const watched = useMovieWatched(movieId, { enabled: open });
  const setWatched = useSetMovieWatched(movieId);

  const renderContent = () => {
    if (watched.isPending) {
      return (
        <VStack align="stretch" gap={4}>
          <Skeleton height="24" rounded="md" />
          <Skeleton height="48" rounded="md" />
        </VStack>
      );
    }

    if (!watched.data?.watched) {
      return (
        <Box p={4} bg="gray.800" rounded="md">
          <VStack align="start" gap={3}>
            <Heading size="sm">Mark as Watched</Heading>
            <Text fontSize="sm" color="fg.muted">
              Mark {movieTitle} as watched to rate and review it.
            </Text>
            <Button onClick={() => setWatched.mutate(true)} colorPalette="green">
              <FaCircleCheck /> Mark as Watched
            </Button>
          </VStack>
        </Box>
      );
    }

    return (
      <VStack align="stretch" gap={4}>
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <VStack align="start" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="sm">Rating</Heading>
              <Text fontSize="sm" color="fg.muted">
                Rate {movieTitle}
              </Text>
            </VStack>
            <Box width="100%">
              <RatingSelector movieId={movieId} portalled={false} />
            </Box>
          </VStack>
        </Box>

        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <VStack align="start" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="sm">Review</Heading>
              <Text fontSize="sm" color="fg.muted">
                Write a review for {movieTitle}
              </Text>
            </VStack>
            <Box width="100%">
              <UserReview movieId={movieId} />
            </Box>
          </VStack>
        </Box>
      </VStack>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="lg">
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <VStack align="start" gap={1}>
                <Dialog.Title>Rate and Review</Dialog.Title>
                <Dialog.Description>
                  Share your thoughts about <strong>{movieTitle}</strong>
                </Dialog.Description>
              </VStack>
            </Dialog.Header>
            <Dialog.Body>{renderContent()}</Dialog.Body>
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
