import { BasePersonInterface } from "./base-person"

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