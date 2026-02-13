import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "../config";

const SEGMENT_ENDPOINT = '/tv'

export async function getTVSeasonDetailsById({ series_id, season, append_to_response }: { series_id: number, season: number, append_to_response?: string[] }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}?append_to_response=${append_to_response?.join()}&language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    } 
}

export async function getCreditsByTVSeasonId({ series_id, season }: { series_id: number, season: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}/credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
  }

export async function getTVSeasonWatchProvidersById({ series_id, season }: { series_id: number, season: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}/watch/providers`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getTVSeasonVideosById({ series_id, season }: { series_id: number, season: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/season/${season}/videos?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}