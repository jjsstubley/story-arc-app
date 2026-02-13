import { Box, Text, HStack, Button, VStack } from "@chakra-ui/react";
import { ReviewInterface } from "~/interfaces/user-interactions";
import { getFormattedDate } from "~/utils/helpers";
import { deleteReviewById } from "./services";

interface ReviewItemProps {
  review: ReviewInterface;
  movieId: number;
  isOwnReview?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function ReviewItem({ review, movieId, isOwnReview, onDelete, onEdit }: ReviewItemProps) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this review?")) {
      const success = await deleteReviewById(movieId, review.id);
      if (success) {
        onDelete?.();
      }
    }
  };

  return (
    <Box p={4} bg="gray.800" rounded="md" border="1px solid" borderColor="whiteAlpha.200">
      <VStack align="stretch" gap={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={1} flex={1}>
            <Text fontSize="sm" fontWeight="medium">
              {review.user_id || "Anonymous"}
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
              <Button size="xs" variant="ghost" colorPalette="red" onClick={handleDelete}>
                Delete
              </Button>
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

