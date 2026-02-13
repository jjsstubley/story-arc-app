import { PaginationInterface } from "../pagination";

export interface CompanyInterface {
    id: number,
    name: string,
    logo_path: string,
    origin_country: string
}

export interface CompanyPaginationInterface extends PaginationInterface<CompanyInterface>{}