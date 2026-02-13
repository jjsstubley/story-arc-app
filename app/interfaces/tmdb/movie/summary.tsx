import { PaginationInterface } from "../../pagination";
import { CastInterface } from "../people/cast";
import { CrewInterface } from "../people/crew";
import type { BaseMovieInterface } from "./base";

export interface TmdbMovieSummaryInterface extends BaseMovieInterface {
    genre_ids: number[],
    media_type?: string
}


export interface TmdbMovieSummaryWCastInterface extends TmdbMovieSummaryInterface, CastInterface {
}

export interface TmdbMovieSummaryWCrewInterface extends TmdbMovieSummaryInterface, CrewInterface {
}

export interface TmdbMoviePaginationInterface extends PaginationInterface<TmdbMovieSummaryInterface>{}
