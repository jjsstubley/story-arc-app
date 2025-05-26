import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/genre'

export async function getOfficialMovieGenres() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie/list?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getOfficialTVGenres() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/tv/list?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

