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
import { useMovieWatched, useSetMovieWatched } from "~/features/watched";
import { RatingSelector } from "~/features/ratings";
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
  // Movies: global watched state (shared cache). TV: watchlist item status.
  const movieWatchedQuery = useMovieWatched(mediaId, { enabled: dialogOpen && mediaType === "movie" });
  const setMovieWatched = useSetMovieWatched(mediaId);
  const movieWatched = movieWatchedQuery.data?.watched ?? false;

  const [tvLoading, setTvLoading] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<{
    exists: boolean;
    is_seen: boolean | null;
    watchlistId: string | null;
  } | null>(null);
  const [markingTvAsWatched, setMarkingTvAsWatched] = useState(false);

  useEffect(() => {
    if (dialogOpen && mediaType === "tv") {
      loadTvStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, mediaId, mediaType]);

  const loadTvStatus = async () => {
    setTvLoading(true);
    try {
      setWatchlistStatus(await getWatchlistItemStatus(mediaId, "tv"));
    } catch (error) {
      console.error("Failed to load status", error);
      setWatchlistStatus({ exists: false, is_seen: null, watchlistId: null });
    } finally {
      setTvLoading(false);
    }
  };

  const markingAsWatched = mediaType === "tv" ? markingTvAsWatched : setMovieWatched.isPending;
  const loading = mediaType === "tv" ? tvLoading : movieWatchedQuery.isPending;

  const handleMarkAsWatched = async () => {
    if (mediaType !== "tv") {
      setMovieWatched.mutate(true);
      return;
    }
    if (!watchlistStatus?.exists) return;
    setMarkingTvAsWatched(true);
    try {
      const response = await fetch(`/api/tv-series/${mediaId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_seen: true }),
      });
      if (response.ok) await loadTvStatus();
      else console.error("Failed to mark as watched");
    } catch (error) {
      console.error("Failed to mark as watched", error);
    } finally {
      setMarkingTvAsWatched(false);
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

    // TV: require watchlist and is_seen
    if (mediaType === "tv") {
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
                  colorPalette="green"
                >
                  <FaCircleCheck /> {markingAsWatched ? "Marking..." : "Mark as Watched"}
                </Button>
              </VStack>
            </Box>
          </VStack>
        );
      }
    } else {
      // Movie: gate on global watched only
      if (!movieWatched) {
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
                  colorPalette="green"
                >
                  <FaCircleCheck /> {markingAsWatched ? "Marking..." : "Mark as Watched"}
                </Button>
              </VStack>
            </Box>
          </VStack>
        );
      }
    }

    // Watched (movie or TV), show rating and review options
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
              <RatingSelector movieId={mediaId} portalled={false} />
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

