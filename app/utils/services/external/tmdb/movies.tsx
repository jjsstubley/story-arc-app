import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/movie'

export async function getMovieDetailsById({ movie_id, append_to_response }: { movie_id: number, append_to_response?: string[] }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}?append_to_response=${append_to_response?.join()}&language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getMovieKeywordsById({ movie_id }: { movie_id: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/keywords`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getMoviesListsByMovieId({ movie_id, page }: { movie_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}${movie_id}/lists?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getOtherRecommendationsByMovieId({ movie_id, page }: { movie_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/recommendations?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getSimilarMoviesById({ movie_id, page }: { movie_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/similar?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getMovieReviewsByMovieId({ movie_id, page }: { movie_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/reviews?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getCreditsByMovieId({ movie_id }: { movie_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
  }

export async function getWatchProvidersById({ movie_id }: { movie_id: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/watch/providers`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getVideosById({ movie_id }: { movie_id: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${movie_id}/videos?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}