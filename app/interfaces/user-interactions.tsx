export interface FavouriteInterface {
    id: string;
    user_id: string;
    tmdb_movie_id: number;
    created_at: string;
    updated_at: string;
}

export interface RatingInterface {
    id: string;
    user_id: string;
    tmdb_movie_id: number;
    rating_percentage: number;
    rating_tier: 'Masterpiece' | 'Excellent' | 'Good' | 'Okay' | 'Bad' | 'Awful';
    created_at: string;
    updated_at: string;
}

export interface ReviewInterface {
    id: string;
    user_id: string;
    tmdb_movie_id: number;
    review_text: string;
    created_at: string;
    updated_at: string;
}

export interface ReviewWithUserInterface extends ReviewInterface {
    user?: {
        id: string;
        email?: string;
        user_metadata?: {
            full_name?: string;
            avatar_url?: string;
        };
    };
}

