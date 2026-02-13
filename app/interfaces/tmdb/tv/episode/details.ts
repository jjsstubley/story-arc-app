import { CastInterface } from "../../people/cast";
import { CrewInterface } from "../../people/crew";
import { BaseEpisodeInterface } from "./base";

export interface TVEpisodeDetailsInterface extends BaseEpisodeInterface {
    crew: CrewInterface[],
    guest_stars: CastInterface[],
}