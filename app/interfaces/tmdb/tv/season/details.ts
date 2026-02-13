import { TVEpisodeSummaryInterface } from "../episode/summary";
import { BaseSeasonInterface } from "./base";

export interface TVSeasonDetailsInterface extends BaseSeasonInterface  {
    _id: string,
    episodes: TVEpisodeSummaryInterface[],
}
