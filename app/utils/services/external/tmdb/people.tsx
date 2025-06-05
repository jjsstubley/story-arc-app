import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/person'

export async function getPeopleDetailsById({ person_id }: { person_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${person_id}?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getPeopleImagesById({ person_id }: { person_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${person_id}/images?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getPeopleCombinedCreditsById({ person_id }: { person_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${person_id}/combined_credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getPeopleMovieCreditsById({ person_id }: { person_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${person_id}/movie_credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getPeopleTvCreditsById({ person_id }: { person_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${person_id}/tv_credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getPopularPeople() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/popular?language=en-US&page=1`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}