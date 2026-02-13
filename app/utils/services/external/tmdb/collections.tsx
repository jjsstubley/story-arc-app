import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/collection'

export async function getTmdbCollectionById({ collection_id }: { collection_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${collection_id}?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}