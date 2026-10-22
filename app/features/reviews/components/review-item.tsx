import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { getFormattedDate } from "~/utils/helpers";
import type { Review } from "../types";

interface ReviewItemProps {
  review: Review;
  /** Only passed for the user's own review */
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewItem({ review, onEdit, onDelete }: ReviewItemProps) {
  const isOwnReview = Boolean(onEdit || onDelete);

  return (
    <Box p={4} bg="gray.800" rounded="md" border="1px solid" borderColor="whiteAlpha.200">
      <VStack align="stretch" gap={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={1} flex={1}>
            {/* There are no public profiles yet, so other authors stay anonymous */}
            <Text fontSize="sm" fontWeight="medium">
              {isOwnReview ? "You" : "Filmarc member"}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {getFormattedDate({
                release_date: review.created_at,
                options: { year: "numeric", month: "long", day: "numeric" },
                region: "en-US",
              })}
              {review.updated_at !== review.created_at && " (edited)"}
            </Text>
          </VStack>
          {isOwnReview && (
            <HStack gap={2}>
              {onEdit && (
                <Button size="xs" variant="ghost" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button size="xs" variant="ghost" colorPalette="red" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </HStack>
          )}
        </HStack>
        <Text fontSize="sm" whiteSpace="pre-wrap">
          {review.review_text}
        </Text>
      </VStack>
    </Box>
  );
}
