import { TmdbMovieSummaryWCastInterface, TmdbMovieSummaryWCrewInterface } from "../movie/summary"

export interface CreditListInterface {
    id: number,
    cast: TmdbMovieSummaryWCastInterface[]
    crew: TmdbMovieSummaryWCrewInterface[]
}