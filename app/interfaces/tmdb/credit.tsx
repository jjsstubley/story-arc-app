import type { TmdbMovieInterface } from "./tdmi-movie";

export interface CreditListInterface {
    id: number,
    cast: CastInterface[]
    crew: CrewInterface[]
}

export interface CastInterface extends TmdbMovieInterface {
    character: string;
    credit_id: string;
    order: number;
    media_type: string;
  }

export interface CrewInterface extends TmdbMovieInterface {
    credit_id: string,
    department: string,
    job: string,
    media_type: string
}
