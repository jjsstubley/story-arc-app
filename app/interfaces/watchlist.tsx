import { TmdbMovieDetailInterface } from "./tmdb/tdmi-movie-detail"

export interface WatchlistInterface {
    id: string,
    user_id: string,
    created_at: string,
    updated_at: string,
    name: string,
    descriptions: string | null,
    tags: string[],
    is_public: boolean,
    is_default: boolean,
    source: string,
    forked_from_watchlist_id: string,
    shared_with: string
    watchlist_items: WatchlistItemInterface[]
}

export interface WatchlistItemInterface {
    id: string,
    tmdb_movie_id: number,
    user_id: string,
    added_at: string,
    watchlist_id: string,
    is_seen: boolean
    movie: TmdbMovieDetailInterface
}