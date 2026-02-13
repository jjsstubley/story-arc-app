import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ReviewInterface } from "~/interfaces/user-interactions";
import { getReviews } from "./services";
import ReviewForm from "./review-form";
import ReviewItem from "./review-item";
import { isMovieInAnyWatchlist } from "../watchlist/helpers";

interface ReviewsSectionProps {
  movieId: number;
  isInWatchlist?: boolean;
}

export default function ReviewsSection({ movieId, isInWatchlist: propIsInWatchlist }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewInterface[]>([]);
  const [userReview, setUserReview] = useState<ReviewInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewInterface | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(propIsInWatchlist ?? false);

  useEffect(() => {
    if (propIsInWatchlist === undefined) {
      checkWatchlistStatus();
    } else {
      setIsInWatchlist(propIsInWatchlist);
    }
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, propIsInWatchlist]);

  const checkWatchlistStatus = async () => {
    const inWatchlist = await isMovieInAnyWatchlist(movieId);
    setIsInWatchlist(inWatchlist);
  };

  const loadReviews = async () => {
    setLoading(true);
    const data = await getReviews(movieId);
    if (data) {
      setReviews(data.reviews.filter((r) => r.id !== data.userReview?.id));
      setUserReview(data.userReview);
    }
    setLoading(false);
  };

  const handleReviewSuccess = (review: ReviewInterface) => {
    setUserReview(review);
    setShowForm(false);
    setEditingReview(null);
    loadReviews(); // Reload to update the list
  };

  const handleEdit = (review: ReviewInterface) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDelete = () => {
    setUserReview(null);
    loadReviews();
  };

  if (loading) {
    return (
      <Box p={4}>
        <Text>Loading reviews...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {/* User's own review form */}
      {isInWatchlist && (
        <Box>
          {userReview && !showForm ? (
            <VStack align="stretch" gap={2}>
              <Heading size="sm">Your Review</Heading>
              <ReviewItem
                review={userReview}
                movieId={movieId}
                isOwnReview={true}
                onDelete={handleDelete}
                onEdit={() => handleEdit(userReview)}
              />
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                Write New Review
              </Button>
            </VStack>
          ) : (
            <VStack align="stretch" gap={2}>
              <Heading size="sm">{editingReview ? "Edit Your Review" : "Write a Review"}</Heading>
              <ReviewForm
                movieId={movieId}
                existingReview={editingReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingReview(null);
                }}
                isInWatchlist={isInWatchlist}
              />
            </VStack>
          )}
        </Box>
      )}

      {/* Other users' reviews */}
      <Box>
        <Heading size="sm" mb={4}>
          Reviews ({reviews.length})
        </Heading>
        {reviews.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            No reviews yet. Be the first to review this movie!
          </Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} movieId={movieId} />
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}

