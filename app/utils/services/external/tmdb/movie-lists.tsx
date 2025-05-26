import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/movie'

export async function getMoviesNowPlaying() {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/now_playing?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return {}
    }
    
}

export async function getMoviesByPopularity({ page = 1 }: { page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/popular?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getMoviesByTopRated({ page }: { page: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/top_rated?language=en-US&page=${page}`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getMoviesUpcoming({ page }: { page: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/upcoming?language=en-US&page=${page}`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

