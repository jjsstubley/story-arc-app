import { BaseMovieInterface } from "./base-movie"
import { GenreInterface } from "./genre"

export interface TmdbMovieDetailInterface extends BaseMovieInterface {
    belongs_to_collection: string,
    budget: number
    genres: GenreInterface[]
    homepage: string,
    production_companies: []
    production_countries: []
    revenue: number,
    runtime: number,
    spoken_languages: [],
    status: string,
    tagline: string,
}