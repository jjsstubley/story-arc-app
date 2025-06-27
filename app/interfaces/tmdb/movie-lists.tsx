import { PaginationInterface } from "../pagination";
import { TmdbMovieInterface } from "./tdmi-movie";

interface DatesInterface {
    maximum: string,
    minimum: string
}
  
export interface MovieListsInterface  extends PaginationInterface<TmdbMovieInterface>{
    dates?: DatesInterface;
}