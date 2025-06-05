import { BaseMovieInterface } from "./base-movie";

export interface TmdbMovieInterface extends BaseMovieInterface {
    genre_ids: number[],
    media_type?: string
}
