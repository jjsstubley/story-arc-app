import { Skeleton } from "@chakra-ui/react";
import { useState } from "react";
import { InlineError } from "~/shared/ui/inline-error";
import { useDeleteReview, useMovieReviews } from "../queries";
import ReviewForm from "./review-form";
import ReviewItem from "./review-item";

interface UserReviewProps {
  movieId: number;
}

/** The signed-in user's own review: shown with edit/delete, or a form to write one. Assumes the movie is watched. */
export default function UserReview({ movieId }: UserReviewProps) {
  const [editing, setEditing] = useState(false);
  const { data, isPending, isError, error, refetch } = useMovieReviews(movieId);
  const deleteReview = useDeleteReview(movieId);

  if (isPending) return <Skeleton height="32" width="100%" rounded="md" />;
  if (isError) return <InlineError fallback="Couldn't load your review." error={error} onRetry={() => refetch()} />;

  const review = data.userReview;

  if (!review || editing) {
    return (
      <ReviewForm
        // Remount when the saved review changes so the draft starts from it
        key={review?.updated_at ?? "new"}
        movieId={movieId}
        initialText={review?.review_text}
        onSaved={() => setEditing(false)}
        onCancel={editing ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <ReviewItem
      review={review}
      onEdit={() => setEditing(true)}
      onDelete={() => {
        if (confirm("Are you sure you want to delete your review?")) deleteReview.mutate();
      }}
    />
  );
}
