import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/configuration'

export async function getAvailableRegions() {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/countries?language=en-US`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}
export async function getAvailableLanguages() {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/languages`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}