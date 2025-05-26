import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/trending'

export async function getTrendingMovies({ time }: { time: 'day' | 'week' }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie/${time}?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getTrendingTvShows({ time }: { time: 'day' | 'week' }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/tv/${time}?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getTrendingAll({ time }: { time: 'day' | 'week' }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/all/${time}?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}
