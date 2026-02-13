import { BaseMediaInterface } from "../../media/base";

export interface BaseTVInterface extends BaseMediaInterface {
    original_name: string;
    first_air_date: string;
    name: string;
    origin_country: string[];
}