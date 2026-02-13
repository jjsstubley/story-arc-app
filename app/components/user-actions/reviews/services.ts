import { ReviewInterface } from "~/interfaces/user-interactions";

export interface ReviewsResponse {
  reviews: ReviewInterface[];
  userReview: ReviewInterface | null;
}

export const getReviews = async (movieId: number, limit: number = 20, offset: number = 0): Promise<ReviewsResponse | null> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/reviews?limit=${limit}&offset=${offset}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Failed to get reviews", error);
    return null;
  }
};

export const createOrUpdateReview = async (movieId: number, reviewText: string): Promise<ReviewInterface | null> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review_text: reviewText }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.review;
    }
    return null;
  } catch (error) {
    console.error("Failed to create/update review", error);
    return null;
  }
};

export const deleteReview = async (movieId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/reviews`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete review", error);
    return false;
  }
};

export const updateReviewById = async (movieId: number, reviewId: string, reviewText: string): Promise<ReviewInterface | null> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review_text: reviewText }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.review;
    }
    return null;
  } catch (error) {
    console.error("Failed to update review", error);
    return null;
  }
};

export const deleteReviewById = async (movieId: number, reviewId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete review", error);
    return false;
  }
};

