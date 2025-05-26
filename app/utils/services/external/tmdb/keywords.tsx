import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/keyword'

export async function getKeywordDetail({id} : {id: string}) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${id}`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

