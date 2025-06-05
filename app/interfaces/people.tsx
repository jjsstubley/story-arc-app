import { BasePersonInterface } from "./base-person"
import { PaginationInterface } from "./pagination"
import { TmdbMovieInterface } from "./tdmi-movie"

export interface PeopleListInterface {
    id: number,
    cast: CastInterface[]
    crew: CrewInterface[]
}

export interface CastInterface extends BasePersonInterface {
    original_name: string,
    cast_id: number,
    character: string,
    credit_id: string,
    order: number
}

export interface CrewInterface extends BasePersonInterface {
    original_name: string,
    credit_id: string,
    department: string,
    job: string
}


export interface PersonDetailsInterface extends BasePersonInterface  {
    also_known_as: string[],
    biography: string,
    birthday: string,
    deathday: string,
    homepage: string
    imbd_id: string,
    place_of_birth: string,
}

export interface PersonKnownForInterface extends BasePersonInterface  {
    known_for: TmdbMovieInterface[],
}

export interface PeopleListsInterface extends PaginationInterface<PersonKnownForInterface>{}