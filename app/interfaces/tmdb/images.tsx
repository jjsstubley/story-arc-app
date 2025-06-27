export interface ImagesInterface {
    id: number,
    profiles: ProfilesInterface[]
}

export interface ProfilesInterface {
    aspect_ratio: number,
    height: number,
    iso_639_1: string,
    file_path: string,
    vote_average: number,
    vote_count: number,
    width: number
}