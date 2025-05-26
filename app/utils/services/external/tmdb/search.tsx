import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/search'

export async function getMovieBySearchQuery({ title, year }: { title: string, year?: string }) {
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie?query=${title}&include_adult=false&language=en-US&year=${year}&page=1`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getBestMovieMatch({ title, year }: { title: string, year: string }) {
    const data = await getMovieBySearchQuery({title: title, year: year})
  
    if (!data.results || data.results.length === 0) {
      return { error: "No movie found" };
    }
  
    const exactMatch = data.results.find(
      (m: { title: string; release_date: string; }) => m.title.toLowerCase() === title.toLowerCase() && m.release_date.startsWith(year.toString())
    );
  
    const bestMatch = exactMatch || data.results[0]; // fallback to first result
  
    return bestMatch
}

export async function getTVBySearchQuery({ title, year }: { title: string, year: string }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/tv?query=${title}&include_adult=false&language=en-US&year=${year}&page=1`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

// export async function extendMoviesObj (data) {
//     const enrichedMovies = await Promise.all(
//         data.map(async (movie) => {
//           const { title, year } = movie;
    
//           // Call TMDB API to get additional movie details
//           const tmdbData = await getMovieBySearchQuery({ title, year });
    
//           if (!tmdbData.results || tmdbData.results.length === 0) {
//             return { ...movie, tmdbData: null }; // No additional data found
//           }
    
//           const bestMatch = tmdbData.results[0]; // Take the first result as the best match
//           return { ...movie, tmdbData: bestMatch }; // Enrich the movie with TMDB data
//         })
//       );
// }

export async function getKeywordBySearchQuery({ query, page }: { query: string, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/keyword?query=${query}&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}

export async function getPersonBySearchQuery({ query, page }: { query: string, page: number }) {
  const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/person?query=${query}&include_adult=false&page=${page}`;
  
  try {
      const res = await fetch(url, TMDB_API_OPTIONS)
      return res.json()
  } catch (err) {
      console.error(err)
      return []
  }
  
}