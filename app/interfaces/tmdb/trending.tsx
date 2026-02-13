import { PaginationInterface } from "../pagination";
import { TmdbMovieSummaryInterface } from "./movie/summary";
import { PersonSummaryForInterface } from "./people/summary";
import { TmdbTVSeriesSummaryInterface } from "./tv/series/summary";

export interface TrendingMoviesInterface extends PaginationInterface<TmdbMovieSummaryInterface>{
}

export interface TrendingTVSeriesListsInterface extends PaginationInterface<TmdbTVSeriesSummaryInterface>{
}

export interface TrendingPeopleInterface extends PaginationInterface<PersonSummaryForInterface>{
}