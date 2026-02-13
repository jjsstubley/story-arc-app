
import { GenreInterface } from "../genre"

import { MediaAppendsInterface } from "../media/appends"
import { MovieListsInterface } from "../movie-lists"
import { BaseMovieInterface } from "./base"

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

export interface TmdbMovieDetailWAppendsProps extends TmdbMovieDetailInterface, MediaAppendsInterface<MovieListsInterface> { }
