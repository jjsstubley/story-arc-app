import { CompanyInterface } from "../../company";
import { GenreInterface } from "../../genre";
import { MediaAppendsInterface } from "../../media/appends";
import { MovieListsInterface } from "../../movie-lists";
import { TVEpisodeSummaryInterface } from "../episode/summary";
import { TVSeasonSummaryInterface } from "../season/summary";
import { BaseTVInterface } from "./base";

export interface TVSeriesDetailsInterface extends BaseTVInterface {
    created_by: CreatedByInterface,
    episode_run_time: number,
    genres: GenreInterface[],
    homepage: string,
    in_production: boolean,
    languages: string[],
    last_air_date: string,
    last_episode_to_air: TVEpisodeSummaryInterface,
    next_episode_to_air: string,
    networks: CompanyInterface[],
    number_of_episodes: number,
    number_of_seasons: number,
    production_companies: CompanyInterface[],
    production_countries: ProductionCountryInterface[],
    seasons: TVSeasonSummaryInterface[],
    spoken_languages: SpokenLanguageInterface[],
    status: string,
    tagline: string,
    type: string,
}
export interface TmdbTVSeriesDetailWAppendsProps extends TVSeriesDetailsInterface, MediaAppendsInterface<MovieListsInterface> { }


interface CreatedByInterface {
    id: number,
    credit_id: string,
    name: string,
    profile_path: string
}


interface ProductionCountryInterface {
    iso_3166_1: string,
    name: string
}


interface SpokenLanguageInterface {
    english_name: string,
    iso_639_1: string,
    name: string
}