import { BaseMovieInterface } from "./base-movie"
import { GenreInterface } from "./genre"

import { KeywordItemInterface } from "./keywords"
import { MovieListsInterface } from "./movie-lists"
import { CastInterface, CrewInterface } from "./people"
import { CountryResultInterface } from "./provider"
import { ReviewListsInterface } from "./review"
import { VideoItemInterface } from "./videos"

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
    similar?: MovieListsInterface,
    reviews?: ReviewListsInterface,
    keywords?: TmdbMovieDetailKeywordsInterface,
    providers?: TmdbMovieDetailWatchProvidersInterface,
    videos?: TmdbMovieDetailVideosInterface,
    credits?: {
        cast: CastInterface[]
        crew: CrewInterface[]
    }

}

interface TmdbMovieDetailKeywordsInterface { 
    keywords: KeywordItemInterface[]
} 

interface TmdbMovieDetailWatchProvidersInterface { 
    results: {
        [countryCode: string]: CountryResultInterface;
    }
}

interface TmdbMovieDetailVideosInterface { 
    results: VideoItemInterface[]
}