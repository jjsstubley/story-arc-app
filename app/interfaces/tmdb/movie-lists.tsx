import { PaginationInterface } from "../pagination";
import { TmdbMovieSummaryInterface } from "./movie/summary";

interface DatesInterface {
    maximum: string,
    minimum: string
}
  
export interface MovieListsInterface extends PaginationInterface<TmdbMovieSummaryInterface>{
    dates?: DatesInterface;
}