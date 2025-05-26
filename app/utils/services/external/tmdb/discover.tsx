import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/discover'

interface payloadProps {
    type: string,
    value: string,
}

export async function getMoviesByAdvancedFilters({ payload, page }: { payload: payloadProps[], page: string }) {

    const params = new URLSearchParams({
        include_adult: 'false',
        include_video: 'false',
        language: 'en-US',
        page: page,
        sort_by: 'popularity.desc',
    });

    payload.forEach((i) => {
        params.append(i.type, i.value)
    })
      
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie?${params.toString()}`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getMoviesByGenre({ genre }: { genre: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genre}`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getMoviesByKeyword({ keyword }: { keyword: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_keywords=${keyword}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}