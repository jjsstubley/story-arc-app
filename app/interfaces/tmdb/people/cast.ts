import { BasePersonInterface } from "./base";

interface BaseCastInterface {
    character: string,
    credit_id: string,
    order: number
}

export interface CastInterface extends BasePersonInterface, BaseCastInterface {
    original_name?: string,
    cast_id?: number,
}
