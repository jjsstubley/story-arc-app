import { BasePersonInterface } from "./base";

interface BaseCrewInterface {
    credit_id: string,
    department: string,
    job: string,
}

export interface CrewInterface extends BasePersonInterface, BaseCrewInterface {
    original_name: string,
}
