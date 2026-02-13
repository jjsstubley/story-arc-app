import { BasePersonInterface } from "./base";

export interface PersonDetailsInterface extends BasePersonInterface  {
    also_known_as: string[],
    biography: string,
    birthday: string,
    deathday: string,
    homepage: string
    imbd_id: string,
    place_of_birth: string,
}