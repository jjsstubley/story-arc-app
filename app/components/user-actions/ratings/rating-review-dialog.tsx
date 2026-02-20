"use client";

import {
  Dialog,
  Button,
  VStack,
  Text,
  Box,
  Portal,
  CloseButton,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { getWatchlistItemStatus } from "../watchlist/helpers";
import RatingSelector from "./rating-selector";
import ReviewForm from "../reviews/review-form";
import { FaCircleCheck } from "react-icons/fa6";

interface RatingReviewDialogProps {
  children: React.ReactNode;
  mediaId: number;
  mediaTitle: string;
  mediaType?: "movie" | "tv";
}

export default function RatingReviewDialog({
  children,
  mediaId,
  mediaTitle,
  mediaType = "movie",
}: RatingReviewDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<{
    exists: boolean;
    is_seen: boolean | null;
    watchlistId: string | null;
  } | null>(null);
  const [markingAsWatched, setMarkingAsWatched] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      loadWatchlistStatus();
    }
  }, [dialogOpen, mediaId]);

  const loadWatchlistStatus = async () => {
    setLoading(true);
    try {
      const status = await getWatchlistItemStatus(mediaId, mediaType);
      setWatchlistStatus(status);
    } catch (error) {
      console.error("Failed to load watchlist status", error);
      setWatchlistStatus({ exists: false, is_seen: null, watchlistId: null });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!watchlistStatus?.exists) return;

    setMarkingAsWatched(true);
    try {
      let apiUrl: string;
      let body: any;

      if (mediaType === "tv") {
        apiUrl = `/api/tv-series/${mediaId}/toggle`;
        body = {
          is_seen: true,
        };
      } else {
        apiUrl = `/api/watchlists/default/movies/${mediaId}`;
        body = {
          is_seen: true,
          watchlistId: watchlistStatus?.watchlistId,
        };
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Reload watchlist status
        await loadWatchlistStatus();
      } else {
        console.error("Failed to mark as watched");
      }
    } catch (error) {
      console.error("Failed to mark as watched", error);
    } finally {
      setMarkingAsWatched(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box p={4} display="flex" justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </Box>
      );
    }

    if (!watchlistStatus?.exists) {
      return (
        <Box p={4} bg="gray.800" rounded="md">
          <Heading size="sm" mb={2}>
            Add to Watchlist First
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            Add {mediaTitle} to a watchlist before you can rate or review it.
          </Text>
        </Box>
      );
    }

    // Show "Mark as Watched" if is_seen is false, null, or undefined (not explicitly true)
    if (watchlistStatus.is_seen !== true) {
      return (
        <VStack align="stretch" gap={4}>
          <Box p={4} bg="gray.800" rounded="md">
            <VStack align="start" gap={3}>
              <Heading size="sm">Mark as Watched</Heading>
              <Text fontSize="sm" color="fg.muted">
                Mark {mediaTitle} as watched to rate and review it.
              </Text>
              <Button
                onClick={handleMarkAsWatched}
                disabled={markingAsWatched}
                leftIcon={<FaCircleCheck />}
                colorScheme="green"
              >
                {markingAsWatched ? "Marking..." : "Mark as Watched"}
              </Button>
            </VStack>
          </Box>
        </VStack>
      );
    }

    // is_seen === true, show rating and review options
    return (
      <VStack align="stretch" gap={4}>
        {/* Rating Section */}
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <VStack align="start" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="sm">Rating</Heading>
              <Text fontSize="sm" color="fg.muted">
                Rate {mediaTitle}
              </Text>
            </VStack>
            <Box width="100%">
              <RatingSelector movieId={mediaId} />
            </Box>
          </VStack>
        </Box>

        {/* Review Section */}
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <VStack align="start" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="sm">Review</Heading>
              <Text fontSize="sm" color="fg.muted">
                Write a review for {mediaTitle}
              </Text>
            </VStack>
            <Box width="100%">
              <ReviewForm
                movieId={mediaId}
                onSuccess={() => {
                  // Optionally close dialog or show success message
                }}
                isInWatchlist={true}
              />
            </Box>
          </VStack>
        </Box>
      </VStack>
    );
  };

  return (
    <>
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(e) => setDialogOpen(e.open)}
        size="lg"
      >
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <VStack align="start" gap={1}>
                  <Dialog.Title>Rate and Review</Dialog.Title>
                  <Dialog.Description>
                    Share your thoughts about <strong>{mediaTitle}</strong>
                  </Dialog.Description>
                </VStack>
              </Dialog.Header>
              <Dialog.Body>{renderContent()}</Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

