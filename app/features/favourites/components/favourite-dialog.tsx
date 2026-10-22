import { Box, Button, CloseButton, Dialog, Heading, Portal, Select, Text, Textarea, VStack, createListCollection } from "@chakra-ui/react";
import { useState } from "react";
import { RATING_TIERS, useUpdateRating } from "~/features/ratings";
import { MAX_REVIEW_LENGTH, useSaveReview } from "~/features/reviews";
import { useSetFavourite } from "../queries";

const ratingTiers = createListCollection({
  items: Object.entries(RATING_TIERS).map(([tier, percentage]) => ({
    label: tier,
    value: percentage.toString(),
  })),
});

interface FavouriteDialogProps {
  movieId: number;
  movieTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Favourite a movie, optionally rating and reviewing it at the same time */
export default function FavouriteDialog({ movieId, movieTitle, open, onOpenChange }: FavouriteDialogProps) {
  const [selectedRating, setSelectedRating] = useState("");
  const [reviewText, setReviewText] = useState("");
  const setFavourite = useSetFavourite(movieId);
  const updateRating = useUpdateRating(movieId);
  const saveReview = useSaveReview(movieId);
  const review = reviewText.trim();

  const close = () => {
    onOpenChange(false);
    setSelectedRating("");
    setReviewText("");
  };

  // Favourite and rating update optimistically. The review isn't optimistic,
  // so stay open until it saves; on failure the toast shows and the draft is kept.
  const handleSubmit = () => {
    setFavourite.mutate(true);
    if (selectedRating) updateRating.mutate(parseInt(selectedRating));
    if (review) saveReview.mutate(review, { onSuccess: close });
    else close();
  };

  const handleSkip = () => {
    setFavourite.mutate(true);
    close();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="lg" motionPreset="slide-in-bottom">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add to Favourites</Dialog.Title>
              <Dialog.Description>
                Add <strong>{movieTitle}</strong> to your favourites. Optionally add a rating and review.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={6}>
                <Box>
                  <Heading size="sm" mb={3}>
                    Rating (Optional)
                  </Heading>
                  <Select.Root
                    collection={ratingTiers}
                    value={selectedRating ? [selectedRating] : []}
                    onValueChange={(e) => setSelectedRating(e.value[0] || "")}
                    size="md"
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select a rating tier" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    {/* Not portalled: the modal Dialog would block the dropdown */}
                    <Portal disabled>
                      <Select.Positioner>
                        <Select.Content>
                          {ratingTiers.items.map((tier) => (
                            <Select.Item key={tier.value} item={tier}>
                              <Box display="flex" justifyContent="space-between" width="100%">
                                <Text>{tier.label}</Text>
                                <Text fontSize="xs" color="fg.muted">
                                  {tier.value}%
                                </Text>
                              </Box>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>

                <Box>
                  <Heading size="sm" mb={3}>
                    Review (Optional)
                  </Heading>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review..."
                    rows={6}
                    resize="vertical"
                  />
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saveReview.isPending}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleSkip} disabled={saveReview.isPending}>
                Skip
              </Button>
              <Button onClick={handleSubmit} loading={saveReview.isPending} disabled={review.length > MAX_REVIEW_LENGTH}>
                Add to Favourites
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
