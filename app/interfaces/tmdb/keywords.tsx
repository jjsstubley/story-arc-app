import { PaginationInterface } from "../pagination"

export interface KeywordsInterface {
    id: number,
    keywords: KeywordItemInterface[]

}

export interface KeywordItemInterface {
    id: number,
    name: string
}

export interface KeywordsPaginationInterface extends PaginationInterface<KeywordItemInterface>{}