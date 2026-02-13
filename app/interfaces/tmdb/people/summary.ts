import { TmdbMovieSummaryInterface } from "../movie/summary";
import { BasePersonInterface } from "./base";

export interface PersonSummaryForInterface extends BasePersonInterface {
    known_for: TmdbMovieSummaryInterface[],
    original_name: string
}