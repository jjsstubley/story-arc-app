import { PaginationInterface } from "~/interfaces/pagination";
import { BaseTVInterface } from "./base";


export interface TmdbTVSeriesSummaryInterface extends BaseTVInterface {
    genre_ids: number[],
    media_type?: string,
}

export interface TmdbMoviePaginationInterface extends PaginationInterface<TmdbTVSeriesSummaryInterface>{}
