import { TmdbMovieSummaryInterface } from "./tmdb/movie/summary"

export interface CollectionsInterface {
    id: string,
    created_at: string,
    updated_at: string,
    user_id: string | null,
    name: string,
    description: string | null,
    tags: string[]
    generated_from: object,
    is_public: boolean,
    is_system_generated: boolean,
    collection_items: CollectionItemInterface[],
}

export interface CollectionItemInterface {
    list_id: string,
    movie_id: number,
    added_at: string,
    position: number,
    notes: string | null,
    source: string | null,
    is_watched: boolean,
    movie: TmdbMovieSummaryInterface
}