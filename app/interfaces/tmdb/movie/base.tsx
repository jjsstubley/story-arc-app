import { BaseMediaInterface } from "../media/base";

export interface BaseMovieInterface extends BaseMediaInterface {
    original_title: string,
    release_date: string,
    title: string,
    video: boolean,
}