import { Box, Select, Portal, Text, HStack } from "@chakra-ui/react";
import { createListCollection } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RatingInterface } from "~/interfaces/user-interactions";
import { getRating, addOrUpdateRating, deleteRating } from "./services";

const ratingTiers = createListCollection({
  items: [
    { label: "Masterpiece", value: "95" },
    { label: "Excellent", value: "85" },
    { label: "Good", value: "70" },
    { label: "Okay", value: "55" },
    { label: "Bad", value: "35" },
    { label: "Awful", value: "15" },
  ],
});

interface RatingSelectorProps {
  movieId: number;
  onRatingChange?: (rating: RatingInterface | null) => void;
  size?: "sm" | "md" | "lg";
}

export default function RatingSelector({ movieId, onRatingChange, size = "md" }: RatingSelectorProps) {
  const [rating, setRating] = useState<RatingInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);

  useEffect(() => {
    loadRating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const loadRating = async () => {
    setLoading(true);
    const currentRating = await getRating(movieId);
    setRating(currentRating);
    if (currentRating) {
      setSelectedValue([currentRating.rating_percentage.toString()]);
    } else {
      setSelectedValue([]);
    }
    setLoading(false);
  };

  const handleRatingChange = async (value: string[]) => {
    setSelectedValue(value);
    setLoading(true);

    if (value.length === 0 || value[0] === "") {
      // Delete rating
      const success = await deleteRating(movieId);
      if (success) {
        setRating(null);
        onRatingChange?.(null);
      } else {
        // Revert on error
        if (rating) {
          setSelectedValue([rating.rating_percentage.toString()]);
        }
      }
    } else {
      // Add or update rating
      const percentage = parseInt(value[0]);
      const newRating = await addOrUpdateRating(movieId, percentage);
      if (newRating) {
        setRating(newRating);
        onRatingChange?.(newRating);
      } else {
        // Revert on error
        if (rating) {
          setSelectedValue([rating.rating_percentage.toString()]);
        } else {
          setSelectedValue([]);
        }
      }
    }
    setLoading(false);
  };

  return (
    <Box width="100%">
      <Select.Root
        collection={ratingTiers}
        value={selectedValue}
        onValueChange={(e) => handleRatingChange(e.value)}
        size={size}
        disabled={loading}
        placeholder="Select rating"
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
        <Portal>
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

