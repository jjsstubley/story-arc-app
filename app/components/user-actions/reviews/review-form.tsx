import { Box, Button, Textarea, VStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { ReviewInterface } from "~/interfaces/user-interactions";
import { createOrUpdateReview } from "./services";

interface ReviewFormProps {
  movieId: number;
  existingReview?: ReviewInterface | null;
  onSuccess?: (review: ReviewInterface) => void;
  onCancel?: () => void;
  isInWatchlist: boolean;
}

export default function ReviewForm({ movieId, existingReview, onSuccess, onCancel, isInWatchlist }: ReviewFormProps) {
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isInWatchlist) {
    return (
      <Box p={4} bg="gray.800" rounded="md">
        <Text fontSize="sm" color="fg.muted">
          Add this movie to a watchlist to leave a review.
        </Text>
      </Box>
    );
  }

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError("Review text cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    const review = await createOrUpdateReview(movieId, reviewText);
    if (review) {
      setReviewText("");
      onSuccess?.(review);
    } else {
      setError("Failed to save review");
    }
    setLoading(false);
  };

  return (
    <VStack align="stretch" gap={4}>
      <Textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Write your review..."
        rows={6}
        resize="vertical"
      />
      {error && (
        <Text fontSize="sm" color="red.500">
          {error}
        </Text>
      )}
      <Box display="flex" gap={2} justifyContent="flex-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={loading || !reviewText.trim()}>
          {existingReview ? "Update Review" : "Submit Review"}
        </Button>
      </Box>
    </VStack>
  );
}

