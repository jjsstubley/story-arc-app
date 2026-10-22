import { Box, Button, Text, Textarea, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { MAX_REVIEW_LENGTH } from "../limits";
import { useSaveReview } from "../queries";

interface ReviewFormProps {
  movieId: number;
  /** Starting text when editing an existing review */
  initialText?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ movieId, initialText = "", onSaved, onCancel }: ReviewFormProps) {
  const [draft, setDraft] = useState(initialText);
  const saveReview = useSaveReview(movieId);
  const text = draft.trim();
  const tooLong = text.length > MAX_REVIEW_LENGTH;

  const handleSubmit = () => {
    saveReview.mutate(text, { onSuccess: () => onSaved?.() });
  };

  return (
    <VStack align="stretch" gap={2}>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your review..."
        rows={6}
        resize="vertical"
      />
      {tooLong && (
        <Text fontSize="xs" color="red.fg">
          Reviews can be at most {MAX_REVIEW_LENGTH} characters ({text.length} now).
        </Text>
      )}
      <Box display="flex" gap={2} justifyContent="flex-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={saveReview.isPending}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} loading={saveReview.isPending} disabled={!text || tooLong}>
          {initialText ? "Update Review" : "Submit Review"}
        </Button>
      </Box>
    </VStack>
  );
}
