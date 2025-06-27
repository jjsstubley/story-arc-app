import { PaginationInterface } from "../pagination"

interface AuthorDetailsInterface {
    name: string,
    username: string,
    avatar_path: string,
    rating: string
}

export interface ReviewInterface {
    author: string,
    author_details: AuthorDetailsInterface,
    content: string,
    created_at: string,
    id: string,
    updated_at: string,
    url: string

}

export interface ReviewListsInterface  extends PaginationInterface<ReviewInterface> {}