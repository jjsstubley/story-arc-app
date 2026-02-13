import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "../config";

const SEGMENT_ENDPOINT = '/tv'

export async function getTVEpisodeDetailsById({ series_id, season, episode, append_to_response }: { series_id: number, season: number, episode: number, append_to_response?: string[] }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}/episode/${episode}?append_to_response=${append_to_response?.join()}&language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    } 
}

export async function getCreditsByTVEpisodeId({ series_id, season, episode }: { series_id: number, season: number, episode: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}/episode/${episode}/credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getTVEpisodeVideosById({ series_id, season, episode }: { series_id: number, season: number, episode: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}/episode/${episode}/videos?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}