import { Dialog, Portal, CloseButton, VStack, Heading, Text, Button, Box, Select, Textarea, createListCollection } from "@chakra-ui/react";
import { useState } from "react";
import { addToFavourites } from "./services";
import { RATING_TIERS } from "~/utils/constants/ratings";

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
  onSuccess?: () => void;
}

export default function FavouriteDialog({
  movieId,
  movieTitle,
  open,
  onOpenChange,
  onSuccess,
}: FavouriteDialogProps) {
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const ratingPercentage = selectedRating ? parseInt(selectedRating) : undefined;
    const review = reviewText.trim() ? reviewText.trim() : undefined;

    const favourite = await addToFavourites(movieId, {
      rating_percentage: ratingPercentage,
      review_text: review,
    });

    if (favourite) {
      onOpenChange(false);
      onSuccess?.();
      // Reset form
      setSelectedRating("");
      setReviewText("");
    }
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    const favourite = await addToFavourites(movieId);
    if (favourite) {
      onOpenChange(false);
      onSuccess?.();
    }
    setLoading(false);
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
                    <Portal>
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
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                Skip
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
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

