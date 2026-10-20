import { Box, HStack, Portal, Select, Skeleton, Text, createListCollection } from "@chakra-ui/react";
import { InlineError } from "~/shared/ui/inline-error";
import { useRating, useUpdateRating } from "../queries";
import { RATING_TIERS, RATING_TIER_OPTIONS } from "../tiers";
import type { Rating } from "../types";

const ratingTiers = createListCollection({ items: RATING_TIER_OPTIONS });

interface RatingSelectorProps {
  movieId: number;
  onRatingChange?: (rating: Rating | null) => void;
  size?: "sm" | "md" | "lg";
  /**
   * Render the dropdown in a portal on document.body. Set to false inside a
   * Dialog: a modal dialog blocks interaction with portalled content.
   */
  portalled?: boolean;
}

export default function RatingSelector({ movieId, onRatingChange, size = "md", portalled = true }: RatingSelectorProps) {
  const { data: rating, isPending, isError, error, refetch } = useRating(movieId);
  const updateRating = useUpdateRating(movieId);

  if (isPending) return <Skeleton height={size === "sm" ? "8" : "10"} width="100%" rounded="md" />;
  if (isError) return <InlineError fallback="Couldn't load your rating." error={error} onRetry={() => refetch()} />;

  // Snap stored percentages to their tier so the select always shows a value
  const selectedValue = rating ? [String(RATING_TIERS[rating.rating_tier])] : [];

  const handleChange = (value: string[]) => {
    const percentage = value[0] ? Number(value[0]) : null;
    updateRating.mutate(percentage, {
      onSuccess: (saved) => onRatingChange?.(saved),
    });
  };

  return (
    <Box width="100%">
      <Select.Root
        collection={ratingTiers}
        value={selectedValue}
        onValueChange={(e) => handleChange(e.value)}
        size={size}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select rating" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal disabled={!portalled}>
          <Select.Positioner>
            <Select.Content>
              {ratingTiers.items.map((tier) => (
                <Select.Item item={tier} key={tier.value}>
                  <HStack justify="space-between" width="100%">
                    <Text>{tier.label}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {tier.value}%
                    </Text>
                  </HStack>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
      {rating && (
        <Text fontSize="xs" color="fg.muted" mt={2}>
          Current: {rating.rating_tier} ({rating.rating_percentage}%)
        </Text>
      )}
    </Box>
  );
}
