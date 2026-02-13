import { RatingInterface } from "~/interfaces/user-interactions";

export const getRating = async (movieId: number): Promise<RatingInterface | null> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/rating`);
    if (response.ok) {
      const data = await response.json();
      return data.rating;
    }
    return null;
  } catch (error) {
    console.error("Failed to get rating", error);
    return null;
  }
};

export const addOrUpdateRating = async (movieId: number, ratingPercentage: number): Promise<RatingInterface | null> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating_percentage: ratingPercentage }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.rating;
    }
    return null;
  } catch (error) {
    console.error("Failed to add/update rating", error);
    return null;
  }
};

export const deleteRating = async (movieId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/rating`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete rating", error);
    return false;
  }
};

