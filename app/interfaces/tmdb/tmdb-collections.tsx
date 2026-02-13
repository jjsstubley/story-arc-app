import { PaginationInterface } from "../pagination";
import { TmdbMovieSummaryInterface } from "./movie/summary";

export interface TmdbCollectionsInterface {
    id: number,
    name: string,
    poster_path: string,
    backdrop_path: string,
    overview: string,
    popularity: number,
    adult?: boolean,
    parts?: TmdbMovieSummaryInterface[]
}   

export interface TmdbCollectionsPaginationInterface extends PaginationInterface<TmdbCollectionsInterface>{}
