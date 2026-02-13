import { FavouriteInterface } from "~/interfaces/user-interactions";

export const checkFavourite = async (movieId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/favourite`);
    if (response.ok) {
      const data = await response.json();
      return data.isFavourite || false;
    }
    return false;
  } catch (error) {
    console.error("Failed to check favourite", error);
    return false;
  }
};

export const addToFavourites = async (
  movieId: number,
  options?: {
    rating_percentage?: number;
    review_text?: string;
  }
): Promise<FavouriteInterface | null> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/favourite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options || {}),
    });
    if (response.ok) {
      const data = await response.json();
      return data.favourite;
    }
    return null;
  } catch (error) {
    console.error("Failed to add to favourites", error);
    return null;
  }
};

export const removeFromFavourites = async (movieId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/movies/${movieId}/favourite`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to remove from favourites", error);
    return false;
  }
};

