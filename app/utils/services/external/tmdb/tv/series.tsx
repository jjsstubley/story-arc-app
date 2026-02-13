import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "../config";

const SEGMENT_ENDPOINT = '/tv'

export async function getTVSeriesDetailsById({ series_id, append_to_response }: { series_id: number, append_to_response?: string[] }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}?append_to_response=${append_to_response?.join()}&language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getTVSeriesKeywordsById({ series_id }: { series_id: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/keywords`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getTVSeriesListsByMovieId({ series_id, page }: { series_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}${series_id}/lists?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getOtherRecommendationsByTVSeriesId({ series_id, page }: { series_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/recommendations?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getSimilarTVSeriesById({ series_id, page }: { series_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/similar?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getTVSeriesReviewsByTVSeriesId({ series_id, page }: { series_id: number, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/reviews?language=en-US&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getCreditsByTVSeriesId({ series_id }: { series_id: number }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/credits?language=en-US`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
  }

export async function getTVSeriesWatchProvidersById({ series_id }: { series_id: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/watch/providers`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getTVSeriesVideosById({ series_id }: { series_id: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/${series_id}/videos?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}