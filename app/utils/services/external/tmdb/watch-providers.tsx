import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/watch/providers'

export async function getAvailableRegions() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/regions?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}


export async function getMovieProviders() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie?language=en-US&watch_region=AU`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getTVProviders() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/tv?language=en-US&watch_region=AU`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

